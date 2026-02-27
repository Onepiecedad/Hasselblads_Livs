import crypto from 'crypto';
import https from 'node:https';

// Hardcoded keys for testing
const WC_KEY = 'ck_d4eb80b3152340de830c562b749348b09ed5b1e7';
const WC_SECRET = 'cs_c066d5f2f8dc9debdf27590cb7046c77250701ea';
const WORDPRESS_BACKEND_IP = "199.16.172.188";
const WORDPRESS_HOST = "hasselbladslivs.se";

const email = "joakim@skylandai.se"; // Test email

function makeWooCommerceRequest(path, method = 'GET') {
    const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');

    return new Promise((resolve, reject) => {
        const options = {
            hostname: WORDPRESS_BACKEND_IP,
            port: 443,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`,
                'Host': WORDPRESS_HOST,
                'X-Forwarded-Host': WORDPRESS_HOST,
                'User-Agent': 'HasselbladsLivs-WalletAPI/1.0',
            },
            rejectUnauthorized: false, // Bypass SSL mismatch for IP direct routing
        };

        const req = https.request(options, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const responseText = Buffer.concat(chunks).toString('utf-8');
                try {
                    const data = JSON.parse(responseText);
                    resolve({ statusCode: res.statusCode, data });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: responseText });
                }
            });
        });

        req.on('error', (error) => reject(error));
        req.end();
    });
}

async function testFetch() {
    console.log(`Fetching wallet balance for customer ID: 3 using v2 API...`);
    try {
        const walletRes = await makeWooCommerceRequest(`/wp-json/wc/v2/wallet/balance/3`);

        console.log("Wallet info Status:", walletRes.statusCode);
        console.log("Wallet info Data:", JSON.stringify(walletRes.data));

    } catch (error) {
        console.error("Error during execution:", error);
    }
}

testFetch();
