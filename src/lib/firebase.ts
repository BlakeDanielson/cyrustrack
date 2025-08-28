import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Conditionally initialize Firebase if API key present
let app: FirebaseApp | undefined;
let dbInstance: Firestore | undefined;
let authInstance: Auth | undefined;

if (firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig);
  dbInstance = getFirestore(app);
  authInstance = getAuth(app);

  // Connect to Firestore emulator in development
  if (process.env.NODE_ENV === 'development' && !global.__FIREBASE_EMULATOR_CONNECTED__ && dbInstance) {
    try {
      connectFirestoreEmulator(dbInstance, 'localhost', 8080);
      global.__FIREBASE_EMULATOR_CONNECTED__ = true;
    } catch (error) {
      // Emulator is already connected or not available
      console.log('Firestore emulator connection skipped:', error);
    }
  }
} else {
  console.warn('Firebase configuration not found – Firebase features disabled');
}

// Export (possibly undefined) instances so importing modules can handle absence gracefully
// Consumers should check for undefined before using
export const appFirebase = app;
export const db = dbInstance as unknown as Firestore;
export const auth = authInstance as unknown as Auth;

export default app;

// Type for global Firebase emulator state
declare global {
  var __FIREBASE_EMULATOR_CONNECTED__: boolean | undefined;
}
