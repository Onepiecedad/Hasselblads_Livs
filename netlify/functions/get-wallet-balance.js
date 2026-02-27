import https from "node:https";

const WORDPRESS_BACKEND_IP = "199.16.172.188";
const WORDPRESS_HOST = "hasselbladslivs.se";

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
};

// Uses the Identity Toolkit REST API to securely verify a client token without needing a Service Account.
async function verifyFirebaseToken(idToken) {
    const apiKey = process.env.VITE_FIREBASE_API_KEY;
    if (!apiKey) throw new Error("VITE_FIREBASE_API_KEY is not set");

    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
        throw new Error('Invalid Firebase token');
    }

    const data = await response.json();
    if (!data.users || data.users.length === 0) {
        throw new Error('User not found');
    }

    return data.users[0]; // returns { localId, email, ... }
}

function makeWooCommerceRequest(path, method = 'GET') {
    const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const WC_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;
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

export default async (request, context) => {
    // Handle preflight CORS
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: CORS_HEADERS,
        });
    }

    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
                status: 401,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
        }

        const idToken = authHeader.split('Bearer ')[1];

        // 1. Verify the token securely with Firebase to get the guaranteed email
        let firebaseUser;
        try {
            firebaseUser = await verifyFirebaseToken(idToken);
        } catch (err) {
            console.error("Token verification failed:", err.message);
            return new Response(JSON.stringify({ error: 'Unauthorized token' }), {
                status: 401,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
        }

        const email = firebaseUser.email;
        if (!email) {
            return new Response(JSON.stringify({ error: 'Token does not contain an email' }), {
                status: 400,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
        }

        // 2. Lookup the WooCommerce customer by email
        const customerRes = await makeWooCommerceRequest(`/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`);

        if (customerRes.statusCode !== 200 || !Array.isArray(customerRes.data) || customerRes.data.length === 0) {
            console.log(`No WooCommerce customer found for email: ${email}`);
            return new Response(JSON.stringify({ balance: 0 }), {
                status: 200,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
        }

        const customerId = customerRes.data[0].id;

        // 3. Get the TeraWallet balance for this customer
        const walletRes = await makeWooCommerceRequest(`/wp-json/wc/v3/wallet/balance/${customerId}`);

        if (walletRes.statusCode !== 200) {
            console.error(`Failed to fetch wallet for WC ID ${customerId}:`, walletRes.data);
            return new Response(JSON.stringify({ error: 'Failed to fetch wallet balance' }), {
                status: 500,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
        }

        // Return the formatted balance
        return new Response(JSON.stringify({
            balance: walletRes.data.balance || "0", // TeraWallet returns balance as string, e.g. "5500.00"
            currency: walletRes.data.currency || "SEK"
        }), {
            status: 200,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Wallet balance error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
    }
};
