#!/usr/bin/env node
/**
 * Sync WooCommerce product IDs to Firestore
 * 
 * Searches WooCommerce Store API for products matching Firestore products
 * that are missing woocommerce_id, then updates Firestore via REST API.
 */

import { readFileSync } from 'fs';
import { homedir } from 'os';

const PROJECT_ID = 'hasselblad-bildstudio';
const WC_BASE = 'https://hasselbladslivs.se';
const COLLECTION = 'organizations/hasselblad_common/projects/default/products';

// Get Firebase CLI access token
function getAccessToken() {
    const configPath = `${homedir()}/.config/configstore/firebase-tools.json`;
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    const tokens = config.tokens || config.user?.tokens || {};
    return tokens.access_token;
}

// Search WooCommerce Store API for a product by name
async function searchWooCommerce(productName) {
    const url = `${WC_BASE}/wp-json/wc/store/v1/products?search=${encodeURIComponent(productName)}&per_page=10`;
    const res = await fetch(url);
    if (!res.ok) return [];
    return res.json();
}

// Get ALL Firestore products missing woocommerce_id
async function getMissingProducts(token) {
    let allDocs = [];
    let nextPageToken = null;

    do {
        let url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}?pageSize=300`;
        if (nextPageToken) url += `&pageToken=${nextPageToken}`;

        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const docs = data.documents || [];
        allDocs = allDocs.concat(docs);
        nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    // Filter to those missing woocommerce_id
    return allDocs.filter(doc => {
        const wc = doc.fields?.woocommerce_id || {};
        return !('integerValue' in wc) && !('doubleValue' in wc);
    }).map(doc => ({
        docId: doc.name.split('/').pop(),
        name: doc.fields?.product_name?.stringValue || 'Unknown',
        fullPath: doc.name
    }));
}

// Update a Firestore document with woocommerce_id
async function updateFirestoreDoc(token, docId, woocommerceId) {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}/${docId}?updateMask.fieldPaths=woocommerce_id`;
    const res = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fields: {
                woocommerce_id: { integerValue: String(woocommerceId) }
            }
        })
    });
    return res.ok;
}

// Normalize product name for matching
function normalize(name) {
    return name.toLowerCase()
        .replace(/[éèê]/g, 'e')
        .replace(/[àâ]/g, 'a')
        .replace(/[ùû]/g, 'u')
        .replace(/[^a-zåäö0-9]/g, '')
        .trim();
}

async function main() {
    console.log('🔄 Syncing WooCommerce IDs to Firestore...\n');

    const token = getAccessToken();
    if (!token) {
        console.error('❌ No Firebase CLI token found. Run: firebase login');
        process.exit(1);
    }

    // Get products missing woocommerce_id
    const missing = await getMissingProducts(token);
    console.log(`📦 Found ${missing.length} products without woocommerce_id\n`);

    if (missing.length === 0) {
        console.log('✅ All products have woocommerce_id!');
        return;
    }

    let matched = 0;
    let notFound = 0;
    const notFoundList = [];

    for (const product of missing) {
        // Search WooCommerce
        const results = await searchWooCommerce(product.name);

        // Try exact match first, then normalized match
        let wcProduct = results.find(r => r.name === product.name);
        if (!wcProduct) {
            wcProduct = results.find(r => normalize(r.name) === normalize(product.name));
        }

        if (wcProduct) {
            const ok = await updateFirestoreDoc(token, product.docId, wcProduct.id);
            if (ok) {
                console.log(`  ✅ ${product.name} → wc_id: ${wcProduct.id}`);
                matched++;
            } else {
                console.log(`  ⚠️ ${product.name} → found wc_id ${wcProduct.id} but Firestore update failed`);
            }
        } else {
            console.log(`  ❌ ${product.name} → not found in WooCommerce`);
            notFound++;
            notFoundList.push(product.name);
        }

        // Small delay to not hammer the API
        await new Promise(r => setTimeout(r, 200));
    }

    console.log(`\n=== RESULTS ===`);
    console.log(`✅ Matched & updated: ${matched}`);
    console.log(`❌ Not found in WooCommerce: ${notFound}`);

    if (notFoundList.length > 0) {
        console.log(`\nProducts not found in WooCommerce:`);
        notFoundList.forEach(n => console.log(`  - ${n}`));
        console.log(`\n💡 These need to be created in WooCommerce first, or they won't be available for online checkout.`);
    }
}

main().catch(console.error);
