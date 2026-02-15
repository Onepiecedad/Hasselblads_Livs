/**
 * fix-kg-st-weights.cjs
 * 
 * Korrigerar Firestore-produkter baserat på Axels lista:
 * 1. csvData['Kg/st'] — felaktiga 'Kg' → 'St' (och vice versa)
 * 2. csvData['Vikt i gram'] — importerar viktspann (saknas idag)
 * 3. price — korrigerar priser som avviker från Axels lista
 * 
 * Användning:
 *   node scripts/fix-kg-st-weights.cjs          # Dry-run
 *   node scripts/fix-kg-st-weights.cjs --live    # Applicera
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, doc, setDoc } = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');
const fs = require('fs');
const path = require('path');

// --- Firebase config ---
const app = initializeApp({
    apiKey: "AIzaSyDVXvM31-uY2JZFr-GCYFKigd09vNye2Ts",
    authDomain: "hasselblad-bildstudio.firebaseapp.com",
    projectId: "hasselblad-bildstudio",
    storageBucket: "hasselblad-bildstudio.firebasestorage.app",
    messagingSenderId: "906146481810",
    appId: "1:906146481810:web:0d7989d0cce6fb9173484b",
});
const db = getFirestore(app);
const auth = getAuth(app);
const PRODUCTS_PATH = 'organizations/hasselblad_common/projects/default/products';

const IS_LIVE = process.argv.includes('--live');

// --- Normalisera namn ---
function normalizeName(name) {
    return name.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/dubbellägga\??/g, '')
        .replace(/delad halv\/kvart/g, '')
        .replace(/vakuumförpackad/g, '')
        .replace(/i övermorgon|i morgon|idag/g, '')
        .trim();
}

// --- 1. Ladda Axels data ---
function loadAxelsData() {
    const jsonPath = path.join(__dirname, 'axels-data.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    const lookup = new Map();
    for (const p of data) {
        const key = normalizeName(p.name);
        const kgSt = p.kg_st.toLowerCase() === 'kg' ? 'Kg' : 'St';

        if (!lookup.has(key)) {
            lookup.set(key, {
                name: p.name,
                kgSt,
                vikt: p.vikt_gram || '',
                price: p.price,
                salePrice: p.sale_price,
                active: p.active,
            });
        }
    }

    console.log(`📋 Läste ${lookup.size} unika produkter från Axels lista\n`);
    return lookup;
}

// --- 2. Kör migreringen ---
async function main() {
    console.log(`🔧 Kg/St + Vikt-migrering ${IS_LIVE ? '🔴 LIVE' : '🟡 DRY-RUN'}\n`);

    // Logga in anonymt för skrivbehörighet
    if (IS_LIVE) {
        await signInAnonymously(auth);
        console.log(`✅ Anonym inloggning OK\n`);
    }

    const axelsLookup = loadAxelsData();

    // Hämta alla publicerade produkter
    const productsRef = collection(db, PRODUCTS_PATH);
    const q = query(
        productsRef,
        where('status', '==', 'completed'),
        where('is_published', '==', true)
    );

    const snapshot = await getDocs(q);
    console.log(`🗄️  Hämtade ${snapshot.size} publicerade produkter från Firestore\n`);

    const stats = {
        matched: 0, unmatched: 0, kgToSt: 0, stToKg: 0,
        viktAdded: 0, priceFixed: 0, unchanged: 0, errors: 0,
    };

    const unmatchedProducts = [];
    const changes = [];

    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const name = data.display_name || data.product_name || '';
        if (!name) continue;

        const normalizedName = normalizeName(name);

        // Exakt matchning
        let axelMatch = axelsLookup.get(normalizedName);

        // Fallback: striktare delsträngsmatchning
        if (!axelMatch) {
            let bestMatch = null;
            let bestScore = 0;

            for (const [key, val] of axelsLookup.entries()) {
                if (key.length < 5 || normalizedName.length < 5) continue;

                const shorter = Math.min(key.length, normalizedName.length);
                const longer = Math.max(key.length, normalizedName.length);
                const ratio = shorter / longer;

                if (ratio < 0.7) continue;

                const isMatch = normalizedName.startsWith(key) || key.startsWith(normalizedName);
                if (!isMatch) continue;

                if (ratio > bestScore) {
                    bestScore = ratio;
                    bestMatch = val;
                }
            }

            axelMatch = bestMatch;
        }

        if (!axelMatch) {
            stats.unmatched++;
            unmatchedProducts.push(name);
            continue;
        }

        stats.matched++;

        // Jämför med nuvarande data
        const currentKgSt = (data.csvData?.['Kg/st'] || '').trim();
        const currentVikt = (data.csvData?.['Vikt i gram'] || '').trim();
        const currentPrice = data.price;

        // Bygg mergeObj (hela csvData-objektet)
        const mergeObj = {};
        let hasChanges = false;
        const changeLog = [];

        // 1. Korrigera Kg/st
        if (currentKgSt.toLowerCase() !== axelMatch.kgSt.toLowerCase()) {
            if (!mergeObj.csvData) mergeObj.csvData = { ...data.csvData };
            mergeObj.csvData['Kg/st'] = axelMatch.kgSt;
            const direction = currentKgSt.toLowerCase() === 'kg' ? 'Kg→St' : 'St→Kg';
            changeLog.push(`Kg/st: "${currentKgSt || '<tom>'}" → "${axelMatch.kgSt}" (${direction})`);
            if (direction === 'Kg→St') stats.kgToSt++;
            else stats.stToKg++;
            hasChanges = true;
        }

        // 2. Lägg till Vikt i gram
        if (axelMatch.vikt && !currentVikt) {
            if (!mergeObj.csvData) mergeObj.csvData = { ...data.csvData };
            mergeObj.csvData['Vikt i gram'] = axelMatch.vikt;
            changeLog.push(`Vikt: <tom> → "${axelMatch.vikt}"`);
            stats.viktAdded++;
            hasChanges = true;
        }

        // 3. Korrigera pris
        if (axelMatch.price && currentPrice != null && Math.abs(currentPrice - axelMatch.price) > 1) {
            mergeObj.price = axelMatch.price;
            changeLog.push(`Pris: ${currentPrice} → ${axelMatch.price}`);
            stats.priceFixed++;
            hasChanges = true;
        }

        if (hasChanges) {
            changes.push({ id: docSnap.id, name, mergeObj, changeLog });
        } else {
            stats.unchanged++;
        }
    }

    // --- Visa resultat ---
    console.log('='.repeat(70));
    console.log('ÄNDRINGAR');
    console.log('='.repeat(70));

    for (const change of changes) {
        console.log(`\n📦 ${change.name} (${change.id})`);
        for (const log of change.changeLog) {
            console.log(`   → ${log}`);
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('SAMMANFATTNING');
    console.log('='.repeat(70));
    console.log(`✅ Matchade produkter:     ${stats.matched}`);
    console.log(`❌ Ej matchade:            ${stats.unmatched}`);
    console.log(`🔄 Kg→St korrigerade:      ${stats.kgToSt}`);
    console.log(`🔄 St→Kg korrigerade:      ${stats.stToKg}`);
    console.log(`📏 Vikt tillagd:           ${stats.viktAdded}`);
    console.log(`💰 Pris korrigerade:       ${stats.priceFixed}`);
    console.log(`✨ Redan korrekt:          ${stats.unchanged}`);
    console.log(`📊 Totalt att ändra:       ${changes.length}`);

    // --- Applicera ---
    if (IS_LIVE && changes.length > 0) {
        console.log(`\n🔴 Applicerar ${changes.length} ändringar med setDoc(merge)...`);
        let applied = 0;
        for (const change of changes) {
            try {
                const docRef = doc(db, PRODUCTS_PATH, change.id);
                await setDoc(docRef, change.mergeObj, { merge: true });
                applied++;
                if (applied % 50 === 0) {
                    console.log(`   ${applied}/${changes.length} klar...`);
                }
            } catch (err) {
                console.error(`   ❌ Fel: ${change.name}: ${err.message}`);
                stats.errors++;
            }
        }
        console.log(`\n✅ Klart! ${applied} produkter uppdaterade. ${stats.errors} fel.`);
    } else if (!IS_LIVE && changes.length > 0) {
        console.log(`\n🟡 DRY-RUN: Inga ändringar gjordes. Kör med --live för att applicera.`);
    } else {
        console.log(`\n✨ Inga ändringar behövs!`);
    }

    process.exit(0);
}

main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
