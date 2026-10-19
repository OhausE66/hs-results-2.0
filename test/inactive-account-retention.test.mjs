import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const testDirectory = await mkdtemp(path.join(os.tmpdir(), 'hsresults-retention-'));
const outputFile = path.join(testDirectory, 'inactive-account-retention.mjs');
await build({
  entryPoints: [new URL('../api/_lib/inactive-account-retention.ts', import.meta.url).pathname],
  outfile: outputFile,
  bundle: true,
  format: 'esm',
  platform: 'node',
});
const { inactivityCutoff, runInactiveAccountRetention } = await import(pathToFileURL(outputFile).href);

const OLD = '2024-01-01T00:00:00.000Z';
const RECENT = '2026-10-01T00:00:00.000Z';
const NOW = new Date('2026-10-18T00:00:00.000Z');
const user = (uid, lastRefreshTime, creationTime = OLD) => ({ uid, metadata: { creationTime, lastSignInTime: null, lastRefreshTime } });

const createDependencies = (pages, events, { failStorageFor, lastSeen = {} } = {}) => ({
  firestore: {
    doc: (path) => ({ path, get: async () => {
      const uid = path.split('/')[1];
      return { exists: uid in lastSeen, get: () => lastSeen[uid] };
    } }),
    recursiveDelete: async (reference) => { events.push(`firestore:${reference.path}`); },
  },
  auth: {
    listUsers: async (_max, token) => {
      const index = token ? Number(token) : 0;
      return { users: pages[index] || [], pageToken: index + 1 < pages.length ? String(index + 1) : undefined };
    },
    deleteUser: async (uid) => { events.push(`auth:${uid}`); },
  },
  storage: {
    bucket: () => ({
      deleteFiles: async ({ prefix }) => {
        events.push(`storage:${prefix}`);
        if (failStorageFor && prefix.includes(failStorageFor)) throw new Error('storage failure');
      },
    }),
  },
});

test('uses an exact twelve-calendar-month cutoff', () => {
  assert.equal(inactivityCutoff(new Date('2026-10-18T12:00:00.000Z')), '2025-10-18T12:00:00.000Z');
});

test('dry run pages through Auth users but does not mutate Firebase services', async () => {
  const events = [];
  const result = await runInactiveAccountRetention(
    createDependencies([[user('one', OLD)], [user('two', OLD), user('active', RECENT)]], events),
    { dryRun: true, now: NOW },
  );
  assert.deepEqual(result, { scanned: 3, inactive: 2, deleted: 0, failed: 0, dryRun: true, hasMore: false });
  assert.deepEqual(events, []);
});

test('covers old accounts without lastSeenAt and keeps accounts active in the app', async () => {
  const events = [];
  const result = await runInactiveAccountRetention(
    createDependencies([[user('legacy', OLD), user('app-active', OLD)]], events, { lastSeen: { 'app-active': RECENT } }),
    { dryRun: false, now: NOW },
  );
  assert.equal(result.deleted, 1);
  assert.ok(events.includes('auth:legacy'));
  assert.ok(!events.some((event) => event.includes('app-active')));
});

test('deletes both Storage prefixes and the Firestore tree before the Auth user', async () => {
  const events = [];
  const result = await runInactiveAccountRetention(createDependencies([[user('account-a', OLD)]], events), { dryRun: false, now: NOW });
  assert.equal(result.deleted, 1);
  assert.deepEqual(events, [
    'storage:user_uploads/account-a/',
    'storage:user_profiles/account-a/',
    'firestore:users/account-a',
    'auth:account-a',
  ]);
});

test('a failed cleanup keeps the Auth user for the next run and is never reported as deleted', async () => {
  const events = [];
  const result = await runInactiveAccountRetention(
    createDependencies([[user('account-a', OLD)]], events, { failStorageFor: 'account-a' }),
    { dryRun: false, now: NOW },
  );
  assert.equal(result.deleted, 0);
  assert.equal(result.failed, 1);
  assert.ok(!events.includes('auth:account-a'));
});

test('stops at the per-run limit and reports more work', async () => {
  const result = await runInactiveAccountRetention(
    createDependencies([[user('a', OLD), user('b', OLD), user('c', OLD)]], []),
    { dryRun: true, now: NOW, maxUsers: 2 },
  );
  assert.equal(result.inactive, 2);
  assert.equal(result.hasMore, true);
});
