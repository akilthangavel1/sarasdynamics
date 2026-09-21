import { initializeApp, cert, getApps, getApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import config from "../config/index.js";

export interface DecodedAuthToken {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  phone_number?: string;
  [key: string]: unknown;
}

/**
 * Lazily initializes and returns the Firebase Admin SDK application instance.
 */
export function getFirebaseAdminApp(): App | null {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  const { projectId, clientEmail, privateKey } = config.firebase;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  try {
    const app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log(`[Firebase Admin] Initialized successfully for project: ${projectId}`);
    return app;
  } catch (err) {
    console.error("[Firebase Admin] Initialization failed:", err);
    return null;
  }
}

/**
 * Verifies a Firebase ID token extracted from the Authorization header.
 * Rejects invalid, expired, or malformed tokens with an Error.
 */
export async function verifyFirebaseToken(token: string): Promise<DecodedAuthToken> {
  if (!token || typeof token !== "string") {
    throw new Error("Missing or empty token");
  }

  const app = getFirebaseAdminApp();
  if (!app) {
    throw new Error(
      "Firebase Admin credentials are not configured on the server. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }

  try {
    const auth = getAuth(app);
    const decoded = await auth.verifyIdToken(token);
    return decoded;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Token verification failed";
    throw new Error(`Firebase token verification failed: ${msg}`);
  }
}

export default {
  getFirebaseAdminApp,
  verifyFirebaseToken,
};
