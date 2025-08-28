import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Connect to Firestore emulator in development
if (process.env.NODE_ENV === 'development' && !global.__FIREBASE_EMULATOR_CONNECTED__) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    global.__FIREBASE_EMULATOR_CONNECTED__ = true;
  } catch (error) {
    // Emulator is already connected or not available
    console.log('Firestore emulator connection skipped:', error);
  }
}

export default app;

// Type for global Firebase emulator state
declare global {
  var __FIREBASE_EMULATOR_CONNECTED__: boolean | undefined;
}
