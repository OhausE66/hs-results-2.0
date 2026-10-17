import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
const rule = config.headers.find(({ source }) => source === '/(.*)');
assert.ok(rule, 'The Vercel catch-all rule must cover both page and API routes.');

const headers = Object.fromEntries(rule.headers.map(({ key, value }) => [key.toLowerCase(), value]));
assert.deepEqual(headers, {
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), geolocation=(), microphone=()',
  'content-security-policy-report-only': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://aistudiocdn.com https://www.gstatic.com https://esm.sh https://cdn.sheetjs.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://images.unsplash.com https://firebasestorage.googleapis.com https://ui-avatars.com https://www.transparenttextures.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://firebasestorage.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebaseinstallations.googleapis.com"
});

console.log('Security headers cover pages and API routes.');
