import { GoogleGenAI } from '@google/genai';

// Einfache, bewusst begrenzte Webseiten-Analyse (Startseite + bis zu 2 Unterseiten).
// Tiefere Recherche ist für die spätere Bezahlfunktion vorgesehen.
const modelName = 'gemini-3-flash-preview';
const FETCH_TIMEOUT_MS = 8000;
const MAX_HTML_BYTES = 400_000;
const MAX_PAGE_CHARS = 3500;
const MAX_SUBPAGES = 2;
const SUBPAGE_HINTS = /(ueber|über|about|unternehmen|company|leistung|service|produkt|product|loesung|lösung|solution|team)/i;

export const isPublicHostname = (hostname: string): boolean => {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!h.includes('.') && !h.includes(':')) return false;
  if (h === 'localhost' || h === '::1' || h.endsWith('.local') || h.endsWith('.internal')) return false;
  const v4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b] = v4.slice(1).map(Number);
    return !(a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224);
  }
  if (h.includes(':')) return false; // IPv6-Literale nicht zulassen
  return true;
};

export const normalizeUrl = (input: string): URL | null => {
  const trimmed = (input || '').trim();
  if (!trimmed || trimmed.length > 300) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (!['http:', 'https:'].includes(url.protocol) || !isPublicHostname(url.hostname) || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
};

const collapse = (s: string) => s.replace(/\s+/g, ' ').trim();
const stripHtml = (html: string) =>
  collapse(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<\/(p|div|section|article|h1|h2|h3|h4|h5|h6|li|br)>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
  );

const fetchHtml = async (url: URL): Promise<string | null> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    // Weiterleitungen manuell prüfen, damit sie nicht auf interne Adressen führen.
    let current = url;
    for (let hop = 0; hop < 3; hop++) {
      const res = await fetch(current.toString(), {
        signal: controller.signal,
        redirect: 'manual',
        headers: { 'User-Agent': 'hs-results-website-context/1.0', Accept: 'text/html' },
      });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        const next = loc ? normalizeUrl(new URL(loc, current).toString()) : null;
        if (!next) return null;
        current = next;
        continue;
      }
      if (!res.ok) return null;
      const type = res.headers.get('content-type') || '';
      if (!type.includes('text/html')) return null;
      const buf = await res.arrayBuffer();
      return new TextDecoder('utf-8').decode(buf.slice(0, MAX_HTML_BYTES));
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

const findSubpages = (html: string, base: URL): URL[] => {
  const found: URL[] = [];
  const seen = new Set<string>([base.pathname]);
  for (const m of html.matchAll(/<a\s[^>]*href=["']([^"'#?]+)["'][^>]*>/gi)) {
    try {
      const u = new URL(m[1], base);
      if (u.hostname !== base.hostname || !SUBPAGE_HINTS.test(u.pathname) || seen.has(u.pathname)) continue;
      if (/\.(pdf|jpg|jpeg|png|gif|svg|zip)$/i.test(u.pathname)) continue;
      seen.add(u.pathname);
      found.push(u);
      if (found.length >= MAX_SUBPAGES) break;
    } catch {
      /* ungültiger Link */
    }
  }
  return found;
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });

  const url = normalizeUrl(req.body?.url);
  const lang = req.body?.lang === 'en' ? 'en' : 'de';
  if (!url) return res.status(400).json({ error: 'invalid_url' });

  try {
    const home = await fetchHtml(url);
    if (!home) return res.status(422).json({ error: 'unreachable' });
    const title = collapse((home.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
    const pages = [stripHtml(home).slice(0, MAX_PAGE_CHARS)];
    for (const sub of findSubpages(home, url)) {
      const html = await fetchHtml(sub);
      if (html) pages.push(stripHtml(html).slice(0, MAX_PAGE_CHARS));
    }
    const text = pages.join('\n\n---\n\n');
    if (text.length < 200) return res.status(422).json({ error: 'too_little_content' });

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Du analysierst die öffentlichen Webseiten-Texte einer Organisation für eine Organisationsberatung. Sprache der Antwort: ${lang === 'de' ? 'Deutsch' : 'Englisch'}.
Erfinde nichts, nutze nur den Text. Antworte als JSON mit den Feldern:
summary (2-3 Sätze: was die Organisation tut und für wen),
offerings (bis zu 5 Angebote/Leistungen),
target_groups (bis zu 4 Zielgruppen),
size_hints (Hinweise auf Größe, Standorte, Struktur; sonst leer),
tone_and_values (Auftreten und genannte Werte in einem Satz),
open_questions (bis zu 3 Fragen, die die Webseite offen lässt und für eine Organisationsanalyse wichtig wären).

TITEL: ${title}
TEXT:
${text}`,
      config: { responseMimeType: 'application/json', temperature: 0.2 },
    });
    let parsed: any = null;
    try {
      parsed = JSON.parse((response.text || '').trim());
    } catch {
      /* unten behandelt */
    }
    if (!parsed || typeof parsed.summary !== 'string') return res.status(502).json({ error: 'analysis_failed' });

    const list = (v: any) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 5) : []);
    return res.status(200).json({
      url: url.toString(),
      title,
      pagesRead: pages.length,
      summary: parsed.summary,
      offerings: list(parsed.offerings),
      target_groups: list(parsed.target_groups),
      size_hints: typeof parsed.size_hints === 'string' ? parsed.size_hints : '',
      tone_and_values: typeof parsed.tone_and_values === 'string' ? parsed.tone_and_values : '',
      open_questions: list(parsed.open_questions).slice(0, 3),
    });
  } catch (error: any) {
    console.error('Website Context Error:', error);
    return res.status(500).json({ error: 'analysis_failed' });
  }
}
