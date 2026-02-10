/**
 * Script: Lägg till Annettes produkter i Firestore via REST API
 * Datum: 2026-02-09
 * Kör: node scripts/add-annette-products.mjs
 */
import { readFileSync } from 'fs';
import { homedir } from 'os';

const PROJECT_ID = 'hasselblad-bildstudio';
const COLLECTION = 'organizations/hasselblad_common/projects/default/products';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}`;
const now = new Date().toISOString();

// Get access token from Firebase CLI credentials
function getAccessToken() {
    const configPath = `${homedir()}/.config/configstore/firebase-tools.json`;
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    return config.tokens.access_token;
}

// Convert JS value to Firestore Value format
function toFirestoreValue(val) {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === 'string') return { stringValue: val };
    if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
    if (typeof val === 'object') {
        const fields = {};
        for (const [k, v] of Object.entries(val)) {
            if (v !== undefined) fields[k] = toFirestoreValue(v);
        }
        return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
}

// Build Firestore document from product data
function buildDoc(p) {
    const fields = {
        product_name: toFirestoreValue(p.product_name),
        display_name: toFirestoreValue(p.product_name),
        brand: toFirestoreValue(p.brand),
        price: toFirestoreValue(p.price),
        main_category: toFirestoreValue('Sött & Gott'),
        sub_category: toFirestoreValue(p.sub_category),
        multipack: toFirestoreValue(p.multipack),
        status: toFirestoreValue('completed'),
        is_published: toFirestoreValue(true),
        tags: toFirestoreValue([]),
        description: toFirestoreValue(''),
        origin_country: toFirestoreValue(''),
        csvData: toFirestoreValue({
            ...p.csvData,
            'Huvudkategori': 'Sött & Gott',
            'Underkategori': p.sub_category,
            'Varumärke': p.brand,
            'Multiköp': p.multipack,
        }),
        createdAt: toFirestoreValue(now),
        updatedAt: toFirestoreValue(now),
        updatedBy: toFirestoreValue('script:annette-products'),
    };
    return { fields };
}

// ============================================================
// PRODUKT-DATA FRÅN ANNETTE
// ============================================================
const products = [
    // ─── ITALIENSKA PRALINER (La Perla) — 10 st 125:- ───
    { product_name: 'Italiensk pralin - Pistage/Hallon', brand: 'La Perla', price: 125, sub_category: 'Godis', multipack: '10 st 125:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '125', 'Enhet': '10 st' } },
    { product_name: 'Italiensk pralin - Salted Caramel Cookie', brand: 'La Perla', price: 125, sub_category: 'Godis', multipack: '10 st 125:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '125', 'Enhet': '10 st' } },
    { product_name: 'Italiensk pralin - Jordnöt', brand: 'La Perla', price: 125, sub_category: 'Godis', multipack: '10 st 125:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '125', 'Enhet': '10 st' } },
    { product_name: 'Italiensk pralin - Limoncello/Maräng', brand: 'La Perla', price: 125, sub_category: 'Godis', multipack: '10 st 125:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '125', 'Enhet': '10 st' } },
    { product_name: 'Italiensk pralin - Lakrits', brand: 'La Perla', price: 125, sub_category: 'Godis', multipack: '10 st 125:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '125', 'Enhet': '10 st' } },
    { product_name: 'Italiensk pralin - Triple Chocolate', brand: 'La Perla', price: 125, sub_category: 'Godis', multipack: '10 st 125:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '125', 'Enhet': '10 st' } },
    { product_name: 'Italiensk pralin - Ingefära', brand: 'La Perla', price: 125, sub_category: 'Godis', multipack: '10 st 125:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '125', 'Enhet': '10 st' } },
    { product_name: 'Italiensk pralin - Bianco', brand: 'La Perla', price: 125, sub_category: 'Godis', multipack: '10 st 125:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '125', 'Enhet': '10 st' } },
    { product_name: 'Italiensk pralin - Ambra', brand: 'La Perla', price: 125, sub_category: 'Godis', multipack: '10 st 125:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '125', 'Enhet': '10 st' } },
    { product_name: 'Italiensk pralin - Extreme', brand: 'La Perla', price: 125, sub_category: 'Godis', multipack: '10 st 125:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '125', 'Enhet': '10 st' } },
    { product_name: 'Italiensk pralin - Tiramisù', brand: 'La Perla', price: 125, sub_category: 'Godis', multipack: '10 st 125:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '125', 'Enhet': '10 st' } },

    // ─── TARTUFFOS PRALINER — 10 st 125:- ───
    { product_name: 'Tartuffo pralin - Pistage', brand: 'Tartuffos', price: 125, sub_category: 'Godis', multipack: '10 st 125:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '125', 'Enhet': '10 st' } },
    { product_name: 'Tartuffo pralin - Cappuccino', brand: 'Tartuffos', price: 125, sub_category: 'Godis', multipack: '10 st 125:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '125', 'Enhet': '10 st' } },
    { product_name: 'Tartuffo pralin - Salt Karamell', brand: 'Tartuffos', price: 125, sub_category: 'Godis', multipack: '10 st 125:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '125', 'Enhet': '10 st' } },

    // ─── LAKRITSKOLA (Kuhnbonbon) — 3 st 10:- ───
    { product_name: 'Lakritskola - Mintlakrits', brand: 'Kuhnbonbon', price: 10, sub_category: 'Godis', multipack: '3 st 10:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '10', 'Enhet': '3 st' } },
    { product_name: 'Lakritskola - Gräddlakrits', brand: 'Kuhnbonbon', price: 10, sub_category: 'Godis', multipack: '3 st 10:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '10', 'Enhet': '3 st' } },
    { product_name: 'Lakritskola - Jordgubbslakrits', brand: 'Kuhnbonbon', price: 10, sub_category: 'Godis', multipack: '3 st 10:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '10', 'Enhet': '3 st' } },
    { product_name: 'Lakritskola - Lakrits', brand: 'Kuhnbonbon', price: 10, sub_category: 'Godis', multipack: '3 st 10:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '10', 'Enhet': '3 st' } },

    // ─── MOZART (Lambertz) — 3 st 10:- ───
    { product_name: 'Mozart', brand: 'Lambertz', price: 10, sub_category: 'Godis', multipack: '3 st 10:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '10', 'Enhet': '3 st' } },

    // ─── PUNSCH, SKÖLDPADDOR (Toms) — 3 för 35:- ───
    { product_name: 'Mintgroda', brand: 'Toms', price: 35, sub_category: 'Godis', multipack: '3 för 35:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '35', 'Enhet': '3 st' } },
    { product_name: 'Romcreme Caramell', brand: 'Toms', price: 35, sub_category: 'Godis', multipack: '3 för 35:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '35', 'Enhet': '3 st' } },
    { product_name: 'Punschpokal', brand: 'Toms', price: 35, sub_category: 'Godis', multipack: '3 för 35:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '35', 'Enhet': '3 st' } },
    { product_name: 'Toffepokal', brand: 'Toms', price: 35, sub_category: 'Godis', multipack: '3 för 35:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '35', 'Enhet': '3 st' } },
    { product_name: 'Bouchée Nougatelefant Mjölk', brand: 'Bouchée', price: 35, sub_category: 'Godis', multipack: 'Singel', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '35', 'Enhet': 'St' } },

    // ─── NÖRREGADE — 2 för 34:- ───
    { product_name: 'Salta Ugglor', brand: 'Nörregade', price: 34, sub_category: 'Godis', multipack: '2 för 34:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '34', 'Enhet': '2 st' } },
    { product_name: 'Frutti', brand: 'Nörregade', price: 34, sub_category: 'Godis', multipack: '2 för 34:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '34', 'Enhet': '2 st' } },
    { product_name: 'Extra Starka', brand: 'Nörregade', price: 34, sub_category: 'Godis', multipack: '2 för 34:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '34', 'Enhet': '2 st' } },
    { product_name: 'Blå Ugglor', brand: 'Nörregade', price: 34, sub_category: 'Godis', multipack: '2 för 34:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '34', 'Enhet': '2 st' } },
    { product_name: 'Lakrids Snak', brand: 'Nörregade', price: 34, sub_category: 'Godis', multipack: '2 för 34:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '34', 'Enhet': '2 st' } },
    { product_name: 'Pulverfyllda Halvmånar', brand: 'Nörregade', price: 34, sub_category: 'Godis', multipack: '2 för 34:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '34', 'Enhet': '2 st' } },
    { product_name: 'Blandade Starka', brand: 'Nörregade', price: 34, sub_category: 'Godis', multipack: '2 för 34:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '34', 'Enhet': '2 st' } },
    { product_name: 'Rostiga Muttrar', brand: 'Nörregade', price: 34, sub_category: 'Godis', multipack: '2 för 34:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '34', 'Enhet': '2 st' } },

    // ─── REFRESHER / BANANASKIDS (Swizzels) — 3 för 10:- ───
    { product_name: 'Refreshers', brand: 'Swizzels', price: 10, sub_category: 'Godis', multipack: '3 för 10:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '10', 'Enhet': '3 st' } },
    { product_name: 'Bananaskids', brand: 'Swizzels', price: 10, sub_category: 'Godis', multipack: '3 för 10:-', csvData: { 'Kg/st': 'St', 'Ordinarie pris': '10', 'Enhet': '3 st' } },
];

// ============================================================
// UPLOAD VIA REST API
// ============================================================
async function run() {
    const token = getAccessToken();
    console.log(`\n🚀 Lägger till ${products.length} produkter i Firestore via REST API...`);
    console.log(`📂 Path: ${COLLECTION}\n`);

    let added = 0;
    let failed = 0;

    for (const p of products) {
        const doc = buildDoc(p);
        try {
            const res = await fetch(BASE, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(doc),
            });

            if (res.ok) {
                const data = await res.json();
                const docId = data.name.split('/').pop();
                console.log(`✅ ${p.product_name} (${p.brand}) → ${docId}`);
                added++;
            } else {
                const err = await res.text();
                console.error(`❌ ${p.product_name}: ${res.status} ${err.substring(0, 100)}`);
                failed++;
                // If token is expired, abort early
                if (res.status === 401) {
                    console.error('\n⚠️  Token har gått ut. Kör: firebase login --reauth');
                    process.exit(1);
                }
            }
        } catch (err) {
            console.error(`❌ ${p.product_name}: ${err.message}`);
            failed++;
        }
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 Sammanfattning:`);
    console.log(`   ✅ Tillagda: ${added}`);
    console.log(`   ❌ Misslyckade: ${failed}`);
    console.log(`   📦 Totalt: ${products.length}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    process.exit(failed > 0 ? 1 : 0);
}

run();
