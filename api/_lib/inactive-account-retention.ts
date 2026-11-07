export const INACTIVITY_MONTHS = 12;
export const AUTH_PAGE_SIZE = 1000;
export const DEFAULT_MAX_USERS_PER_RUN = 100;

type AuthUserRecord = {
  uid: string;
  metadata: { creationTime?: string; lastSignInTime?: string | null; lastRefreshTime?: string | null };
};

export type RetentionDependencies = {
  firestore: {
    doc: (path: string) => { get: () => Promise<{ exists: boolean; get: (field: string) => unknown }> };
    recursiveDelete: (reference: unknown) => Promise<void>;
  };
  auth: {
    listUsers: (maxResults: number, pageToken?: string) => Promise<{ users: AuthUserRecord[]; pageToken?: string }>;
    deleteUser: (uid: string) => Promise<void>;
  };
  storage: { bucket: () => { deleteFiles: (options: { prefix: string }) => Promise<void> } };
};

export type RetentionResult = {
  scanned: number;
  inactive: number;
  deleted: number;
  failed: number;
  dryRun: boolean;
  hasMore: boolean;
};

export const inactivityCutoff = (now = new Date()): string => {
  const cutoff = new Date(now);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - INACTIVITY_MONTHS);
  return cutoff.toISOString();
};

const toTime = (value: unknown): number => {
  if (typeof value !== 'string' || !value) return 0;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
};

/**
 * Last activity across Firebase Auth (sign-in, token refresh, creation) and the
 * app's own `users/{uid}.lastSeenAt`. Accounts created before `lastSeenAt`
 * existed are still covered through the Auth metadata.
 */
const lastActivity = (user: AuthUserRecord, lastSeenAt: unknown): number => Math.max(
  toTime(user.metadata.lastRefreshTime),
  toTime(user.metadata.lastSignInTime),
  toTime(user.metadata.creationTime),
  toTime(lastSeenAt),
);

const isAlreadyDeleted = (error: unknown): boolean => {
  const code: unknown = (error as { code?: unknown })?.code;
  return code === 'auth/user-not-found' || code === 'not-found' || code === 404;
};

/**
 * Deletes data first and the Auth user last. If Storage or Firestore fails, the
 * Auth user still exists, so the next daily run finds the account again and
 * repeats the cleanup.
 */
export const deleteInactiveAccount = async (dependencies: RetentionDependencies, uid: string): Promise<void> => {
  const bucket = dependencies.storage.bucket();
  await bucket.deleteFiles({ prefix: `user_uploads/${uid}/` });
  await bucket.deleteFiles({ prefix: `user_profiles/${uid}/` });
  await dependencies.firestore.recursiveDelete(dependencies.firestore.doc(`users/${uid}`));
  try {
    await dependencies.auth.deleteUser(uid);
  } catch (error) {
    if (!isAlreadyDeleted(error)) throw error;
  }
};

export const runInactiveAccountRetention = async (
  dependencies: RetentionDependencies,
  options: { dryRun: boolean; now?: Date; maxUsers?: number; pageSize?: number },
): Promise<RetentionResult> => {
  const maxUsers = Math.max(1, Math.min(options.maxUsers || DEFAULT_MAX_USERS_PER_RUN, 1_000));
  const pageSize = Math.max(1, Math.min(options.pageSize || AUTH_PAGE_SIZE, AUTH_PAGE_SIZE));
  const cutoff = Date.parse(inactivityCutoff(options.now));
  let pageToken: string | undefined;
  let scanned = 0;
  let inactive = 0;
  let deleted = 0;
  let failed = 0;
  let hasMore = false;

  do {
    const page = await dependencies.auth.listUsers(pageSize, pageToken);
    pageToken = page.pageToken;
    for (const user of page.users) {
      scanned += 1;
      // Cheap Auth check first; Firestore is read only for Auth-inactive accounts.
      if (lastActivity(user, undefined) >= cutoff) continue;
      const profile = await dependencies.firestore.doc(`users/${user.uid}`).get();
      if (lastActivity(user, profile.exists ? profile.get('lastSeenAt') : undefined) >= cutoff) continue;

      if (inactive >= maxUsers) { hasMore = true; break; }
      inactive += 1;
      if (options.dryRun) continue;
      try {
        await deleteInactiveAccount(dependencies, user.uid);
        deleted += 1;
      } catch {
        // UID, email, paths and error details deliberately never reach logs.
        failed += 1;
      }
    }
  } while (pageToken && !hasMore);

  return { scanned, inactive, deleted, failed, dryRun: options.dryRun, hasMore };
};
