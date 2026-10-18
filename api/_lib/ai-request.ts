import { verifyFirebaseIdToken } from './firebase-id-token.js';

export const MAX_AI_BODY_BYTES = 64 * 1024;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const DEFAULT_AI_CALLS_PER_DAY = 500;
const requestWindows = new Map<string, number[]>();

// Vercel Functions do not share memory. This protects each warm instance; a
// persistent, solution-wide counter needs an explicitly provisioned data store.
export const AI_CALLS_PER_DAY = (() => {
  const configured = Number(process.env.AI_CALLS_PER_DAY);
  return Number.isInteger(configured) && configured > 0 ? configured : DEFAULT_AI_CALLS_PER_DAY;
})();

let budgetDay = '';
let callsToday = 0;

type Claims = Awaited<ReturnType<typeof verifyFirebaseIdToken>>;
type AuthorizeResult = { ok: true; claims: Claims } | { ok: false };

const readHeader = (headers: Record<string, unknown>, name: string): string | null => {
  const value = headers[name];
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : null;
  return typeof value === 'string' ? value : null;
};

const getBearerToken = (authorization: unknown): string | null => {
  if (typeof authorization !== 'string') return null;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
};

/** Only use proxy headers Vercel supplies itself; never trust x-forwarded-for. */
export const getTrustedClientIp = (headers: Record<string, unknown>): string => {
  const vercelIp = readHeader(headers, 'x-vercel-forwarded-for');
  if (vercelIp) return vercelIp.split(',')[0].trim() || 'unknown';
  const realIp = readHeader(headers, 'x-real-ip');
  return realIp?.trim() || 'unknown';
};

const bodyByteLength = (body: unknown): number => {
  try {
    return Buffer.byteLength(JSON.stringify(body ?? {}), 'utf8');
  } catch {
    return MAX_AI_BODY_BYTES + 1;
  }
};

const isRateLimited = (keys: string[]): boolean => {
  const now = Date.now();
  const windows = keys.map((key) => ({
    key,
    attempts: (requestWindows.get(key) || []).filter((time) => time > now - RATE_LIMIT_WINDOW_MS),
  }));
  if (windows.some(({ attempts }) => attempts.length >= MAX_REQUESTS_PER_WINDOW)) {
    for (const { key, attempts } of windows) requestWindows.set(key, attempts);
    return true;
  }
  for (const { key, attempts } of windows) {
    attempts.push(now);
    requestWindows.set(key, attempts);
  }
  return false;
};

const useDailyBudget = (): boolean => {
  const today = new Date().toISOString().slice(0, 10);
  if (budgetDay !== today) {
    budgetDay = today;
    callsToday = 0;
  }
  if (callsToday >= AI_CALLS_PER_DAY) return false;
  callsToday += 1;
  return true;
};

export const requestId = (headers: Record<string, unknown>): string =>
  readHeader(headers, 'x-vercel-id') || readHeader(headers, 'x-request-id') || 'none';

/** Logs metadata only: no addresses, prompts, responses, tokens, or IPs. */
export const logAiFailure = (event: string, req: any, status: number) => {
  console.error(`[ai] event=${event} status=${status} request_id=${requestId(req.headers || {})}`);
};

export const authorizeAiRequest = async (req: any, res: any): Promise<AuthorizeResult> => {
  const headers = req.headers || {};
  const declaredLength = Number(readHeader(headers, 'content-length'));
  if ((Number.isFinite(declaredLength) && declaredLength > MAX_AI_BODY_BYTES) || bodyByteLength(req.body) > MAX_AI_BODY_BYTES) {
    return res.status(413).json({ error: 'The request could not be processed.' }), { ok: false };
  }

  const token = getBearerToken(headers.authorization);
  if (!token) return res.status(401).json({ error: 'The request could not be processed.' }), { ok: false };

  let claims: Claims;
  try {
    claims = await verifyFirebaseIdToken(token);
  } catch {
    return res.status(401).json({ error: 'The request could not be processed.' }), { ok: false };
  }

  if (isRateLimited([`user:${claims.sub}`, `ip:${getTrustedClientIp(headers)}`])) {
    res.setHeader('Retry-After', String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)));
    return res.status(429).json({ error: 'The request could not be processed.' }), { ok: false };
  }

  if (!useDailyBudget()) {
    const exhausted = req.body?.lang === 'en'
      ? 'Today is at capacity, please try again tomorrow.'
      : 'Heute ausgelastet, bitte morgen wieder.';
    return res.status(429).json({ error: exhausted, code: 'daily_budget_exhausted' }), { ok: false };
  }

  return { ok: true, claims };
};
