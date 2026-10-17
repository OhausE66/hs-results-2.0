import { createPublicKey, verify } from 'node:crypto';

const FIREBASE_PROJECT_ID = 'hs-results';
const FIREBASE_ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
const GOOGLE_CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const CLOCK_SKEW_SECONDS = 60;

type FirebaseTokenClaims = {
  aud: string;
  auth_time: number;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  user_id?: string;
};

type Certificates = Record<string, string>;

let certificates: Certificates | null = null;
let certificatesExpireAt = 0;

const decodeBase64Url = (value: string): Buffer => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64');
};

const parseMaxAge = (cacheControl: string | null): number => {
  const match = cacheControl?.match(/max-age=(\d+)/i);
  return match ? Number(match[1]) * 1000 : 60 * 60 * 1000;
};

const getCertificates = async (): Promise<Certificates> => {
  if (certificates && Date.now() < certificatesExpireAt) return certificates;

  const response = await fetch(GOOGLE_CERTS_URL);
  if (!response.ok) throw new Error('Unable to load Firebase token certificates');
  const parsed = await response.json();
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid Firebase token certificates');

  certificates = parsed as Certificates;
  certificatesExpireAt = Date.now() + parseMaxAge(response.headers.get('cache-control'));
  return certificates;
};

/**
 * Verifies the signature and required claims of a Firebase ID token without a
 * client-side SDK or a service-account key. Google publishes the rotating
 * public certificates used by Firebase Auth specifically for this purpose.
 */
export const verifyFirebaseIdToken = async (token: string): Promise<FirebaseTokenClaims> => {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed Firebase ID token');

  let header: { alg?: string; kid?: string };
  let claims: FirebaseTokenClaims;
  try {
    header = JSON.parse(decodeBase64Url(parts[0]).toString('utf8'));
    claims = JSON.parse(decodeBase64Url(parts[1]).toString('utf8'));
  } catch {
    throw new Error('Malformed Firebase ID token');
  }

  if (header.alg !== 'RS256' || !header.kid) throw new Error('Invalid Firebase ID token header');

  const certificate = (await getCertificates())[header.kid];
  if (!certificate) throw new Error('Unknown Firebase ID token key');
  const signature = decodeBase64Url(parts[2]);
  const signedData = Buffer.from(`${parts[0]}.${parts[1]}`);
  const signatureValid = verify('RSA-SHA256', signedData, createPublicKey(certificate), signature);
  if (!signatureValid) throw new Error('Invalid Firebase ID token signature');

  const now = Math.floor(Date.now() / 1000);
  if (
    claims.aud !== FIREBASE_PROJECT_ID ||
    claims.iss !== FIREBASE_ISSUER ||
    typeof claims.sub !== 'string' ||
    claims.sub.length === 0 ||
    claims.sub.length > 128 ||
    typeof claims.iat !== 'number' ||
    typeof claims.auth_time !== 'number' ||
    typeof claims.exp !== 'number' ||
    claims.iat > now + CLOCK_SKEW_SECONDS ||
    claims.auth_time > now + CLOCK_SKEW_SECONDS ||
    claims.exp < now - CLOCK_SKEW_SECONDS
  ) {
    throw new Error('Invalid Firebase ID token claims');
  }

  return claims;
};
