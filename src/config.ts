// Feature flags and app configuration
export const ENABLE_AUTH = false; // Set to true to enable Firebase Auth

export const APP_NAME = 'Boop-Blur';
export const DB_NAME = 'boop-blur-db';
export const DB_VERSION = 1;

// Default settings
export const DEFAULT_VIBE_PACK = 'zen-but-dumb';

// Visual decay thresholds (in days)
export const DECAY_THRESHOLDS = {
  crisp: 0,
  slightBlur: 1,
  moreBlur: 3,
  heavyBlur: 5,
  pixelated: 7
};

// Firebase config (from environment variables)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
