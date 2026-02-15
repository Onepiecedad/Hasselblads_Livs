#!/usr/bin/env node
/**
 * fix-kg-st-weights.mjs
 * 
 * Korrigerar Firestore-produkter baserat på Axels lista:
 * 1. csvData['Kg/st'] — felaktiga 'Kg' → 'St'
 * 2. csvData['Vikt i gram'] — importerar viktspann
 * 3. price — korrigerar priser
 * 
 *   node scripts/fix-kg-st-weights.mjs          # Dry-run
 *   node scripts/fix-kg-st-weights.mjs --live    # Applicera
 */

import { readFileSync } from 'fs';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ID = 'hasselblad-bildstudio';
const COLLECTION = 'organizations/hasselblad_common/projects/default/products';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}`;
const IS_LIVE = process.argv.includes('--live');

// --- Firebase CLI token ---
function getAccessToken() {
    const configPath = `${homedir()}/.config/configstore/firebase-tools.json`;
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    const tokens = config.tokens || config.user?.tokens || {};
    return tokens.access_token;
}

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

// --- Ladda Axels data ---
function loadAxelsData() {
    const data = JSON.parse(readFileSync(join(__dirname, 'axels-data.json'), 'utf-8'));
    const lookup = new Map();
    for (const p of data) {
        const key = normalizeName(p.name);
        const kgSt = p.kg_st.toLowerCase() === 'kg' ? 'Kg' : 'St';
        if (!lookup.has(key)) {
            lookup.set(key, { name: p.name, kgSt, vikt: p.vikt_gram || '', price: p.price });
        }
    }
    console.log(`📋 ${lookup.size} unika produkter från Axels lista\n`);
    return lookup;
}

// --- Hämta alla publicerade produkter via REST API ---
async function fetchAllProducts(token) {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
    const body = {
        structuredQuery: {
            from: [{ collectionId: 'products' }],
            where: {
                compositeFilter: {
                    op: 'AND',
                    filters: [
                        { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'completed' } } },
                        { fieldFilter: { field: { fieldPath: 'is_published' }, op: 'EQUAL', value: { booleanValue: true } } },
                    ]
                }
            },
            limit: 2000,
        },
        parent: `projects/${PROJECT_ID}/databases/(default)/documents/organizations/hasselblad_common/projects/default`,
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Firestore query failed (${res.status}): ${errText}`);
    }

    const results = await res.json();
    return results.filter(r => r.document).map(r => r.document);
}

// --- Uppdatera ett dokument via REST (PATCH) ---
async function patchDocument(docPath, fields, token) {
    // Bygg fieldMask query params
    const fieldPaths = Object.keys(fields).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
    const url = `https://firestore.googleapis.com/v1/${docPath}?${fieldPaths}`;

    // Bygg Firestore value object
    const firestoreFields = {};
    for (const [key, val] of Object.entries(fields)) {
        firestoreFields[key] = toFirestoreValue(val);
    }

    const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: firestoreFields }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`PATCH failed (${res.status}): ${errText}`);
    }
}

function toFirestoreValue(val) {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === 'string') return { stringValue: val };
    if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (typeof val === 'object' && !Array.isArray(val)) {
        const fields = {};
        for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v);
        return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
}

function extractStringField(fields, path) {
    const parts = path.split('.');
    let current = fields;
    for (const p of parts) {
        if (!current) return '';
        if (current[p]?.mapValue?.fields) {
            current = current[p].mapValue.fields;
        } else if (current[p]?.stringValue !== undefined) {
            return current[p].stringValue;
        } else {
            return '';
        }
    }
    return '';
}

function extractNumberField(fields, path) {
    const parts = path.split('.');
    let current = fields;
    for (const p of parts) {
        if (!current) return null;
        if (current[p]?.mapValue?.fields) {
            current = current[p].mapValue.fields;
        } else if (current[p]?.doubleValue !== undefined) {
            return current[p].doubleValue;
        } else if (current[p]?.integerValue !== undefined) {
            return parseInt(current[p].integerValue);
        } else {
            return null;
        }
    }
    return null;
}

function extractMapFields(fields, key) {
    return fields[key]?.mapValue?.fields || {};
}

// --- MAIN ---
async function main() {
    console.log(`🔧 Kg/St + Vikt-migrering ${IS_LIVE ? '🔴 LIVE' : '🟡 DRY-RUN'}\n`);

    const token = getAccessToken();
    console.log(`🔑 Firebase CLI token OK\n`);

    const axelsLookup = loadAxelsData();
    const docs = await fetchAllProducts(token);
    console.log(`🗄️  ${docs.length} publicerade produkter i Firestore\n`);

    const stats = { matched: 0, unmatched: 0, kgToSt: 0, stToKg: 0, viktAdded: 0, priceFixed: 0, unchanged: 0, errors: 0 };
    const changes = [];

    for (const doc of docs) {
        const fields = doc.fields || {};
        const name = fields.display_name?.stringValue || fields.product_name?.stringValue || '';
        if (!name) continue;

        const normalizedName = normalizeName(name);

        // Exakt matchning
        let axelMatch = axelsLookup.get(normalizedName);

        // Fallback: strikt prefix-matchning
        if (!axelMatch) {
            let bestMatch = null, bestScore = 0;
            for (const [key, val] of axelsLookup.entries()) {
                if (key.length < 5 || normalizedName.length < 5) continue;
                const ratio = Math.min(key.length, normalizedName.length) / Math.max(key.length, normalizedName.length);
                if (ratio < 0.7) continue;
                if (normalizedName.startsWith(key) || key.startsWith(normalizedName)) {
                    if (ratio > bestScore) { bestScore = ratio; bestMatch = val; }
                }
            }
            axelMatch = bestMatch;
        }

        if (!axelMatch) { stats.unmatched++; continue; }
        stats.matched++;

        // Nuvarande värden
        const csvDataFields = extractMapFields(fields, 'csvData');
        const currentKgSt = (csvDataFields['Kg/st']?.stringValue || '').trim();
        const currentVikt = (csvDataFields['Vikt i gram']?.stringValue || '').trim();
        const currentPrice = extractNumberField(fields, 'price');

        const changeLog = [];
        // Bygg ny csvData map med alla befintliga fält + ändringar
        const newCsvData = {};
        for (const [k, v] of Object.entries(csvDataFields)) {
            newCsvData[k] = v.stringValue ?? v.doubleValue?.toString() ?? v.integerValue?.toString() ?? '';
        }

        let hasChanges = false;
        const patchFields = {};

        // 1. Kg/st
        if (currentKgSt.toLowerCase() !== axelMatch.kgSt.toLowerCase()) {
            newCsvData['Kg/st'] = axelMatch.kgSt;
            const dir = currentKgSt.toLowerCase() === 'kg' ? 'Kg→St' : 'St→Kg';
            changeLog.push(`Kg/st: "${currentKgSt || '<tom>'}" → "${axelMatch.kgSt}" (${dir})`);
            if (dir === 'Kg→St') stats.kgToSt++; else stats.stToKg++;
            hasChanges = true;
        }

        // 2. Vikt i gram
        if (axelMatch.vikt && !currentVikt) {
            newCsvData['Vikt i gram'] = axelMatch.vikt;
            changeLog.push(`Vikt: <tom> → "${axelMatch.vikt}"`);
            stats.viktAdded++;
            hasChanges = true;
        }

        if (hasChanges) {
            patchFields['csvData'] = newCsvData;
        }

        // 3. Pris
        if (axelMatch.price && currentPrice != null && Math.abs(currentPrice - axelMatch.price) > 1) {
            patchFields['price'] = axelMatch.price;
            changeLog.push(`Pris: ${currentPrice} → ${axelMatch.price}`);
            stats.priceFixed++;
            hasChanges = true;
        }

        if (hasChanges) {
            changes.push({ docPath: doc.name, name, patchFields, changeLog });
        } else {
            stats.unchanged++;
        }
    }

    // --- Visa ---
    console.log('='.repeat(70) + '\nÄNDRINGAR\n' + '='.repeat(70));
    for (const c of changes) {
        console.log(`\n📦 ${c.name}`);
        for (const l of c.changeLog) console.log(`   → ${l}`);
    }

    console.log('\n' + '='.repeat(70) + '\nSAMMANFATTNING\n' + '='.repeat(70));
    console.log(`✅ Matchade:        ${stats.matched}`);
    console.log(`🔄 Kg→St:           ${stats.kgToSt}`);
    console.log(`🔄 St→Kg:           ${stats.stToKg}`);
    console.log(`📏 Vikt tillagd:    ${stats.viktAdded}`);
    console.log(`💰 Pris fixade:     ${stats.priceFixed}`);
    console.log(`✨ Redan korrekt:   ${stats.unchanged}`);
    console.log(`📊 Att ändra:       ${changes.length}`);

    if (IS_LIVE && changes.length > 0) {
        console.log(`\n🔴 Applicerar ${changes.length} ändringar...`);
        let ok = 0;
        for (const c of changes) {
            try {
                await patchDocument(c.docPath, c.patchFields, token);
                ok++;
                if (ok % 50 === 0) console.log(`   ${ok}/${changes.length}...`);
            } catch (err) {
                console.error(`   ❌ ${c.name}: ${err.message}`);
                stats.errors++;
            }
        }
        console.log(`\n✅ Klart! ${ok} uppdaterade, ${stats.errors} fel.`);
    } else if (!IS_LIVE && changes.length > 0) {
        console.log(`\n🟡 DRY-RUN. Kör med --live för att applicera.`);
    }

    process.exit(0);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
