import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// For client-side Firebase, we need to use NEXT_PUBLIC_ prefixed environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase - handle missing API keys gracefully
let app;
let db;
let auth;

try {
  // Check if all required Firebase config values are present
  const hasAllConfig = Object.values(firebaseConfig).every(value => !!value);
  
  if (hasAllConfig) {
    // Initialize Firebase only if all config values are present
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized with project:', firebaseConfig.projectId);
    
    // Initialize Firebase services
    db = getFirestore(app);
    auth = getAuth(app);
  } else {
    console.log('Firebase config is incomplete. Using mock services.');
    
    // Mock Firebase implementations for development
    app = {};
    db = {
      collection: () => ({
        add: async () => ({ id: 'mock-id-' + Date.now() }),
        doc: () => ({
          get: async () => ({ exists: false, data: () => ({}) }),
          set: async () => {},
          update: async () => {}
        })
      })
    };
    auth = {
      onAuthStateChanged: (callback) => {
        callback(null);
        return () => {};
      },
      signInAnonymously: async () => ({ user: { uid: 'mock-uid-' + Date.now() } }),
      currentUser: null
    };
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  
  // Mock implementations for development
  app = {};
  db = {
    collection: () => ({
      add: async () => ({ id: 'mock-id-' + Date.now() }),
      doc: () => ({
        get: async () => ({ exists: false, data: () => ({}) }),
        set: async () => {},
        update: async () => {}
      })
    })
  };
  auth = {
    onAuthStateChanged: (callback) => {
      callback(null);
      return () => {};
    },
    signInAnonymously: async () => ({ user: { uid: 'mock-uid-' + Date.now() } }),
    currentUser: null
  };
}

// Export the Firebase instances
export { db, auth };
export default app;
