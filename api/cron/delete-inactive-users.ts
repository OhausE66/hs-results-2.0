import { timingSafeEqual } from 'node:crypto';
import { getFirebaseAdmin } from '../_lib/firebase-admin.js';
import { runInactiveAccountRetention } from '../_lib/inactive-account-retention.js';

export const config = { maxDuration: 60 };

const equalsSecret = (actual: unknown, expected: string): boolean => {
  if (typeof actual !== 'string') return false;
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
};

const isAuthorizedCron = (req: any): boolean => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return equalsSecret(req.headers?.authorization, `Bearer ${secret}`);
};

/** Daily Vercel Cron: logs aggregate counts only, never user identifiers. */
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isAuthorizedCron(req)) return res.status(401).json({ error: 'Unauthorized' });

  // Safe by default. Production deletion needs this explicit setting to false.
  const dryRun = process.env.INACTIVE_ACCOUNT_RETENTION_DRY_RUN !== 'false';
  try {
    const result = await runInactiveAccountRetention(getFirebaseAdmin(), { dryRun });
    console.info(`[retention] scanned=${result.scanned} inactive=${result.inactive} deleted=${result.deleted} failed=${result.failed} dry_run=${result.dryRun} has_more=${result.hasMore}`);
    if (result.failed > 0) return res.status(500).json({ error: 'Retention incomplete', ...result });
    return res.status(200).json(result);
  } catch {
    console.error('[retention] failed=1');
    return res.status(500).json({ error: 'Retention failed' });
  }
}
