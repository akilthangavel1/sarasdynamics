import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA9iWToOdq_TY81X-h6kZCX03S4wWSxT-g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sarasdynamics-8198e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sarasdynamics-8198e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sarasdynamics-8198e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "996634528220",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:996634528220:web:d4e8bf175db4c51966e719",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

export const app: FirebaseApp | null = isFirebaseConfigured
  ? !getApps().length
    ? initializeApp(firebaseConfig)
    : getApp()
  : null;

export const auth: Auth | null = app ? getAuth(app) : null;

export default {
  app,
  auth,
  isFirebaseConfigured,
};
