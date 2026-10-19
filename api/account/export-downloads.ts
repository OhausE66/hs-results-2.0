import { verifyFirebaseIdToken } from '../_lib/firebase-id-token.js';
import { getFirebaseAdmin } from '../_lib/firebase-admin.js';

export const config = {
  api: { bodyParser: { sizeLimit: '1kb' } },
  maxDuration: 60,
};

const LINK_TTL_MS = 15 * 60 * 1000;
const PAGE_SIZE = 20;
const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const requestWindows = new Map<string, number[]>();

type Folder = 'user_uploads' | 'user_profiles';
type Cursor = { folder: Folder; pageToken?: string };

const getBearerToken = (authorization: unknown): string | null => {
  if (typeof authorization !== 'string') return null;
  return authorization.match(/^Bearer\s+(.+)$/i)?.[1] || null;
};

const decodeCursor = (value: unknown): Cursor | null => {
  if (!value) return { folder: 'user_uploads' };
  if (typeof value !== 'string' || value.length > 1_024) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Cursor;
    if ((parsed.folder !== 'user_uploads' && parsed.folder !== 'user_profiles') || (parsed.pageToken !== undefined && typeof parsed.pageToken !== 'string')) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const encodeCursor = (cursor: Cursor): string => Buffer.from(JSON.stringify(cursor)).toString('base64url');

const isRateLimited = (uid: string): boolean => {
  const now = Date.now();
  const attempts = (requestWindows.get(uid) || []).filter((time) => time > now - RATE_WINDOW_MS);
  if (attempts.length >= MAX_REQUESTS_PER_WINDOW) {
    requestWindows.set(uid, attempts);
    return true;
  }
  attempts.push(now);
  requestWindows.set(uid, attempts);
  return false;
};

/** Returns one bounded page of short-lived links for the authenticated user's own files. */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Cache-Control', 'no-store');

  const declaredLength = Number(req.headers?.['content-length']);
  if ((Number.isFinite(declaredLength) && declaredLength > 1_024) || !req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const token = getBearerToken(req.headers?.authorization);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  let claims: Awaited<ReturnType<typeof verifyFirebaseIdToken>>;
  try {
    claims = await verifyFirebaseIdToken(token);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (isRateLimited(claims.sub)) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ error: 'Too many requests' });
  }

  const cursor = decodeCursor(req.body.cursor);
  if (!cursor) return res.status(400).json({ error: 'Invalid request' });

  try {
    const bucket = getFirebaseAdmin().storage.bucket();
    const [files, nextQuery] = await bucket.getFiles({
      prefix: `${cursor.folder}/${claims.sub}/`,
      maxResults: PAGE_SIZE,
      autoPaginate: false,
      ...(cursor.pageToken ? { pageToken: cursor.pageToken } : {}),
    });
    const expiresAt = new Date(Date.now() + LINK_TTL_MS).toISOString();
    const links = await Promise.all(files.map(async (file) => {
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + LINK_TTL_MS,
      });
      return { path: file.name, url, expiresAt };
    }));
    const nextCursor = nextQuery?.pageToken
      ? encodeCursor({ folder: cursor.folder, pageToken: nextQuery.pageToken })
      : cursor.folder === 'user_uploads'
        ? encodeCursor({ folder: 'user_profiles' })
        : null;
    return res.status(200).json({ links, nextCursor });
  } catch {
    // No storage object name, signed URL, UID, or provider error is logged.
    return res.status(500).json({ error: 'Export links could not be created' });
  }
}
