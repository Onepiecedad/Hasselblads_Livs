import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "hasselblad-bildstudio.firebaseapp.com",
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "hasselblad-bildstudio",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    console.log("Fetching products...");
    const snapshot = await getDocs(query(collection(db, "products")));
    
    let found = 0;
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.product_name && data.product_name.toLowerCase().includes("bönor")) {
            console.log(`[${doc.id}] ${data.product_name} | Main: ${data.main_category} | Sub: ${data.sub_category} | Sort: ${data.sort}`);
            found++;
        }
    });
    console.log(`Found ${found} products with 'bönor'`);
    process.exit(0);
}
run();
