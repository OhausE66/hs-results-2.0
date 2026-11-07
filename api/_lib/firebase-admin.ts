import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const FIREBASE_PROJECT_ID = 'hs-results';

type ServiceAccount = {
  type: string;
  project_id: string;
  client_email: string;
  private_key: string;
};

const readServiceAccount = (): ServiceAccount => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('Firebase Admin is not configured');

  let account: unknown;
  try {
    account = JSON.parse(raw);
  } catch {
    throw new Error('Firebase Admin service account is invalid');
  }
  if (!account || typeof account !== 'object') throw new Error('Firebase Admin service account is invalid');

  const candidate = account as Partial<ServiceAccount>;
  if (
    candidate.type !== 'service_account' ||
    candidate.project_id !== FIREBASE_PROJECT_ID ||
    typeof candidate.client_email !== 'string' ||
    typeof candidate.private_key !== 'string'
  ) {
    throw new Error('Firebase Admin service account is invalid');
  }
  return candidate as ServiceAccount;
};

/** Returns a server-only Admin SDK instance. Never import this from browser code. */
export const getFirebaseAdmin = () => {
  const app = getApps()[0] || initializeApp({
    credential: (() => { const account = readServiceAccount(); return cert({ projectId: account.project_id, clientEmail: account.client_email, privateKey: account.private_key }); })(),
    storageBucket: `${FIREBASE_PROJECT_ID}.firebasestorage.app`,
  });
  return {
    auth: getAuth(app),
    firestore: getFirestore(app),
    storage: getStorage(app),
  };
};
