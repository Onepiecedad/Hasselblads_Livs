import { initializeApp } from 'firebase/app';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hasselblad-bildstudio.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hasselblad-bildstudio",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hasselblad-bildstudio.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "906146481810",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:906146481810:web:0d7989d0cce6fb9173484b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Enable offline persistence - cached data loads instantly on repeat visits
enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        // Multiple tabs open - persistence can only be enabled in one tab
        console.warn('Firestore persistence unavailable: multiple tabs open');
    } else if (err.code === 'unimplemented') {
        // Browser doesn't support persistence
        console.warn('Firestore persistence unavailable: browser not supported');
    }
});
