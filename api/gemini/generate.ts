import { GoogleGenAI } from '@google/genai';
import { verifyFirebaseIdToken } from '../_lib/firebase-id-token';

const defaultModel = 'gemini-3.1-pro-preview';
const allowedModels = new Set([defaultModel, 'gemini-3-flash-preview', 'gemini-3.6-flash']);
const maxBodyBytes = 64 * 1024;
const rateLimitWindowMs = 60_000;
const maxRequestsPerWindow = 12;
const requestWindows = new Map<string, number[]>();

export const config = {
  api: {
    bodyParser: { sizeLimit: '64kb' },
  },
};

const genericError = 'The request could not be processed.';

const getBearerToken = (authorization: unknown): string | null => {
  if (typeof authorization !== 'string') return null;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
};

const getClientIp = (headers: Record<string, unknown>): string => {
  const forwarded = headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim() || 'unknown';
  const realIp = headers['x-real-ip'];
  return typeof realIp === 'string' ? realIp : 'unknown';
};

const isRateLimited = (keys: string[]): boolean => {
  const now = Date.now();
  const windows = keys.map((key) => ({
    key,
    attempts: (requestWindows.get(key) || []).filter((time) => time > now - rateLimitWindowMs),
  }));
  if (windows.some(({ attempts }) => attempts.length >= maxRequestsPerWindow)) {
    for (const { key, attempts } of windows) requestWindows.set(key, attempts);
    return true;
  }
  for (const { key, attempts } of windows) {
    attempts.push(now);
    requestWindows.set(key, attempts);
  }
  return false;
};

const safeConfig = (config: unknown): Record<string, unknown> | undefined => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) return undefined;
  const candidate = config as Record<string, unknown>;
  const accepted: Record<string, unknown> = {};

  if (candidate.responseMimeType === 'application/json') accepted.responseMimeType = candidate.responseMimeType;
  if (typeof candidate.systemInstruction === 'string' && candidate.systemInstruction.length <= 12_000) {
    accepted.systemInstruction = candidate.systemInstruction;
  }
  if (typeof candidate.temperature === 'number' && candidate.temperature >= 0 && candidate.temperature <= 1) {
    accepted.temperature = candidate.temperature;
  }
  if (candidate.responseSchema && typeof candidate.responseSchema === 'object' && !Array.isArray(candidate.responseSchema)) {
    accepted.responseSchema = candidate.responseSchema;
  }

  return Object.keys(accepted).length ? accepted : undefined;
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: genericError });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: genericError });
  }

  try {
    const declaredLength = Number(req.headers?.['content-length']);
    if (Number.isFinite(declaredLength) && declaredLength > maxBodyBytes) {
      return res.status(413).json({ error: genericError });
    }
    if (Buffer.byteLength(JSON.stringify(req.body || {}), 'utf8') > maxBodyBytes) {
      return res.status(413).json({ error: genericError });
    }

    const token = getBearerToken(req.headers?.authorization);
    if (!token) return res.status(401).json({ error: genericError });
    let claims: Awaited<ReturnType<typeof verifyFirebaseIdToken>>;
    try {
      claims = await verifyFirebaseIdToken(token);
    } catch {
      // Ungültige oder abgelaufene Anmeldung: 401 statt Serverfehler.
      return res.status(401).json({ error: genericError });
    }
    const clientIp = getClientIp(req.headers || {});
    if (isRateLimited([`user:${claims.sub}`, `ip:${clientIp}`])) {
      res.setHeader('Retry-After', String(Math.ceil(rateLimitWindowMs / 1000)));
      return res.status(429).json({ error: genericError });
    }

    const { model, contents, config } = req.body || {};
    const selectedModel = typeof model === 'string' && allowedModels.has(model) ? model : defaultModel;
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: safeConfig(config),
    });

    return res.status(200).json({ text: response.text });
  } catch (error) {
    console.error('Generate Error:', error);
    return res.status(500).json({ error: genericError });
  }
}
