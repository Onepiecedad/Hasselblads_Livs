// Use the regular firebase web SDK via node
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";

import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "hasselblad-bildstudio.firebaseapp.com",
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "hasselblad-bildstudio",
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "hasselblad-bildstudio.firebasestorage.app",
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "906146481810",
    appId: process.env.VITE_FIREBASE_APP_ID || "1:906146481810:web:0d7989d0cce6fb9173484b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    console.log("Fetching webshop active products...");
    try {
        // Fetch from the correct public read path according to security rules
        const q = query(collection(db, "organizations/hasselblad_common/projects/default/products"));
        const snapshot = await getDocs(q);

        const products = [];
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });

        console.log(`Fetched ${products.length} products.`);

        const skuMap = new Map();
        const nameMap = new Map();
        const duplicateSkus = [];
        const duplicateNames = [];

        for (const product of products) {
            if (product.status !== 'completed' && product.status !== 'published') {
                continue; // We only care about active products on the site
            }

            if (product.plu) {
                const sku = String(product.plu).trim();
                if (skuMap.has(sku)) skuMap.get(sku).push(product);
                else skuMap.set(sku, [product]);
            }

            if (product.articleName) {
                const name = product.articleName.toLowerCase().trim();
                if (nameMap.has(name)) nameMap.get(name).push(product);
                else nameMap.set(name, [product]);
            }
        }

        // Identify SKU duplicates
        for (const [sku, items] of skuMap.entries()) {
            if (items.length > 1) {
                duplicateSkus.push({ sku, items: items.map(i => ({ id: i.id, name: i.articleName, status: i.status })) });
            }
        }

        // Identify Name duplicates
        for (const [name, items] of nameMap.entries()) {
            if (items.length > 1) {
                duplicateNames.push({ name, items: items.map(i => ({ id: i.id, sku: i.plu, status: i.status })) });
            }
        }

        console.log("\n--- DUPLICATE SKUs (Active products only) ---");
        if (duplicateSkus.length === 0) console.log("No duplicate SKUs found.");
        else {
            duplicateSkus.forEach(d => {
                console.log(`\nSKU: ${d.sku}`);
                console.table(d.items);
            });
        }

        console.log("\n--- DUPLICATE NAMES (Active products only) ---");
        if (duplicateNames.length === 0) console.log("No duplicate names found.");
        else {
            duplicateNames.forEach(d => {
                console.log(`\nName: ${d.name}`);
                console.table(d.items);
            });
        }

    } catch (e) {
        console.error(e);
    }
}

check().then(() => process.exit(0));
