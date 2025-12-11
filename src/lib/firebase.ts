import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDVXvM31-uY2JZFr-GCYFKigd09vNye2Ts",
    authDomain: "hasselblad-bildstudio.firebaseapp.com",
    projectId: "hasselblad-bildstudio",
    storageBucket: "hasselblad-bildstudio.firebasestorage.app",
    messagingSenderId: "906146481810",
    appId: "1:906146481810:web:0d7989d0cce6fb9173484b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
