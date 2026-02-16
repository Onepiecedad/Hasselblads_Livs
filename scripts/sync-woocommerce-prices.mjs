#!/usr/bin/env node
/**
 * Sync WooCommerce prices to match the React webshop display prices
 * 
 * Problem: WooCommerce stores kg-prices for weight-based products,
 * but the React app calculates per-piece prices (price_per_kg × estimated_weight_g / 1000).
 * When a customer checks out, WooCommerce charges the kg-price instead of the piece-price.
 * 
 * This script:
 * 1. Reads all published products from Firestore (via Firebase client SDK)
 * 2. Calculates the "display price" (same logic as useProducts.ts)
 * 3. Compares with WooCommerce price  
 * 4. Updates WooCommerce if they differ
 * 
 * SAFETY: Only updates products where BOTH Firestore & WooCommerce have valid prices > 0.
 * 
 * Usage:
 *   node scripts/sync-woocommerce-prices.mjs           # Dry run (show changes)
 *   node scripts/sync-woocommerce-prices.mjs --apply    # Apply changes
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const DRY_RUN = !process.argv.includes('--apply');

// Firebase config (same as src/lib/firebase.ts)
const firebaseConfig = {
    apiKey: "AIzaSyBQgB2A_bXaLOFP8MRH5uhQ2JPKMY9YCWg",
    authDomain: "hasselblad-bildstudio.firebaseapp.com",
    projectId: "hasselblad-bildstudio",
    storageBucket: "hasselblad-bildstudio.firebasestorage.app",
    messagingSenderId: "906146481810",
    appId: "1:906146481810:web:0d7989d0cce6fb9173484b"
};

// WooCommerce REST API credentials
const WC_BASE = 'https://hasselbladslivs.se';
const WC_KEY = 'ck_d4eb80b3152340de830c562b749348b09ed5b1e7';
const WC_SECRET = 'cs_c066d5f2f8dc9debdf27590cb7046c77250701ea';
const WC_AUTH = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');

// WordPress backend IP (bypass Netlify proxy)
const WP_BACKEND_IP = '199.16.172.188';

// ─── Price calculation (mirrors useProducts.ts transformProduct logic) ───

function calculateDisplayPrice(product) {
    const pricingType = product.pricing_type;
    const pricePerKg = product.price_per_kg || 0;
    const estimatedWeightG = product.estimated_weight_g || 0;
    const estimatedPiecePrice = product.estimated_piece_price || 0;
    const rawPrice = product.price || 0;

    const isWeightBased = pricingType === 'weight_based';

    if (isWeightBased && (estimatedPiecePrice || (pricePerKg && estimatedWeightG))) {
        return estimatedPiecePrice || (pricePerKg * estimatedWeightG / 1000);
    } else if (isWeightBased && pricePerKg && !estimatedWeightG) {
        return pricePerKg;
    } else {
        return rawPrice;
    }
}

// ─── WooCommerce API ───

async function getWooCommerceProduct(wcId) {
    const url = `${WC_BASE}/wp-json/wc/store/v1/products?include=${wcId}`;
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const products = await res.json();
        return products[0] || null;
    } catch {
        return null;
    }
}

async function updateWooCommercePrice(wcId, newPrice) {
    const https = await import('node:https');

    return new Promise((resolve) => {
        const postData = JSON.stringify({
            regular_price: newPrice.toFixed(2)
        });

        const options = {
            hostname: WP_BACKEND_IP,
            port: 443,
            path: `/wp-json/wc/v3/products/${wcId}`,
            method: 'PUT',
            headers: {
                'Host': 'hasselbladslivs.se',
                'Authorization': `Basic ${WC_AUTH}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'HasselbladsSync/1.0',
            },
            rejectUnauthorized: false,
        };

        const req = https.request(options, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const body = Buffer.concat(chunks).toString();
                try {
                    const json = JSON.parse(body);
                    resolve({ ok: res.statusCode === 200, status: res.statusCode, data: json });
                } catch {
                    resolve({ ok: false, status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (e) => resolve({ ok: false, status: 0, data: e.message }));
        req.write(postData);
        req.end();
    });
}

// ─── Main ───

async function main() {
    console.log(`\n🔄 WooCommerce Price Sync${DRY_RUN ? ' (DRY RUN – use --apply to commit changes)' : ' (APPLYING CHANGES)'}\n`);

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Get all products
    console.log('📦 Fetching products from Firestore...');
    const productsRef = collection(db, 'organizations/hasselblad_common/projects/default/products');
    const snapshot = await getDocs(productsRef);

    const allProducts = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.woocommerce_id) {
            allProducts.push({ docId: doc.id, ...data });
        }
    });

    console.log(`   Found ${snapshot.size} total products`);
    console.log(`🔗 Products with woocommerce_id: ${allProducts.length}\n`);

    if (allProducts.length === 0) {
        console.log('⚠️  No products with woocommerce_id found!');
        process.exit(0);
    }

    let needsUpdate = 0;
    let updated = 0;
    let unchanged = 0;
    let errors = 0;
    let skippedNoPrice = 0;
    let skippedNotInWc = 0;
    const weightBasedChanges = [];
    const unitBasedChanges = [];

    for (const product of allProducts) {
        const displayPrice = Math.round(calculateDisplayPrice(product) * 100) / 100;
        const wcId = product.woocommerce_id;
        const name = product.display_name || product.product_name || 'Unknown';
        const isWeightBased = product.pricing_type === 'weight_based';

        // SAFETY: Skip products with no display price in Firestore
        if (displayPrice <= 0) {
            skippedNoPrice++;
            continue;
        }

        // Get current WooCommerce price
        const wcProduct = await getWooCommerceProduct(wcId);
        if (!wcProduct) {
            skippedNotInWc++;
            continue;
        }

        // Store API returns prices in minor units (ören)
        const wcPrice = parseInt(wcProduct.prices.price) / 100;

        // Check if prices match
        if (Math.abs(wcPrice - displayPrice) < 0.01) {
            unchanged++;
            continue;
        }

        needsUpdate++;
        const change = {
            name,
            wcId,
            oldPrice: wcPrice,
            newPrice: displayPrice,
            isWeightBased,
            pricePerKg: product.price_per_kg,
            estimatedWeightG: product.estimated_weight_g,
        };

        if (isWeightBased) {
            weightBasedChanges.push(change);
        } else {
            unitBasedChanges.push(change);
        }

        if (!DRY_RUN) {
            const result = await updateWooCommercePrice(wcId, displayPrice);
            if (result.ok) {
                updated++;
            } else {
                console.log(`  ❌ ${name}: ${result.status} ${JSON.stringify(result.data).substring(0, 150)}`);
                errors++;
            }
        }

        // Small delay
        await new Promise(r => setTimeout(r, 300));
    }

    // ─── Display results ───

    console.log(`${'='.repeat(60)}`);
    console.log(`📊 RESULTAT`);
    console.log(`${'='.repeat(60)}`);
    console.log(`   Totalt med WC-id:       ${allProducts.length}`);
    console.log(`   ✅ Redan korrekt pris:   ${unchanged}`);
    console.log(`   ⏭️  Skippad (0kr i FS):   ${skippedNoPrice}`);
    console.log(`   ⏭️  Skippad (ej i WC):    ${skippedNotInWc}`);
    console.log(`   📝 Behöver ändras:       ${needsUpdate}`);
    if (!DRY_RUN) {
        console.log(`   ✅ Uppdaterade:          ${updated}`);
    }
    if (errors > 0) {
        console.log(`   ❌ Fel:                  ${errors}`);
    }

    // Show weight-based changes (the main fix)
    if (weightBasedChanges.length > 0) {
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`🥕 VIKTBASERADE PRODUKTER (kg → styck) – ${weightBasedChanges.length} st:`);
        console.log(`${'─'.repeat(60)}`);
        for (const c of weightBasedChanges) {
            const label = `${c.pricePerKg} kr/kg × ${c.estimatedWeightG}g`;
            console.log(`  ${DRY_RUN ? '📝' : '✅'} ${c.name}`);
            console.log(`     ${c.oldPrice.toFixed(2)} kr → ${c.newPrice.toFixed(2)} kr (${label})`);
        }
    }

    // Show unit-based changes
    if (unitBasedChanges.length > 0) {
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`📦 STYCKPRIS-PRODUKTER – ${unitBasedChanges.length} st:`);
        console.log(`${'─'.repeat(60)}`);
        for (const c of unitBasedChanges) {
            console.log(`  ${DRY_RUN ? '📝' : '✅'} ${c.name}: ${c.oldPrice.toFixed(2)} → ${c.newPrice.toFixed(2)} kr`);
        }
    }

    if (DRY_RUN && needsUpdate > 0) {
        console.log(`\n💡 Kör med --apply för att genomföra ändringarna:`);
        console.log(`   node scripts/sync-woocommerce-prices.mjs --apply`);
    }

    process.exit(0);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
