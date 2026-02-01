import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { ENABLE_AUTH, firebaseConfig } from './config';

// Initialize Firebase only if auth is enabled
let firebaseApp: any = null;
let auth: any = null;

if (ENABLE_AUTH) {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
}

export { firebaseApp, auth };
