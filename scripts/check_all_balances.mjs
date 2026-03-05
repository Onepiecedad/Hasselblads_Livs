import https from "node:https";

const WC_KEY = 'ck_d4eb80b3152340de830c562b749348b09ed5b1e7';
const WC_SECRET = 'cs_c066d5f2f8dc9debdf27590cb7046c77250701ea';
const WORDPRESS_BACKEND_IP = "199.16.172.188";
const WORDPRESS_HOST = "hasselbladslivs.se";

function makeWooCommerceRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
        const options = {
            hostname: WORDPRESS_BACKEND_IP,
            port: 443,
            path: path,
            method: method,
            headers: {
                'Authorization': `Basic ${auth}`,
                'Host': WORDPRESS_HOST,
                'Content-Type': 'application/json',
                'User-Agent': 'Node/TestScript'
            },
            rejectUnauthorized: false
        };

        if (data) {
            const bodyStr = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
        }

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                let parsed;
                try {
                    parsed = JSON.parse(responseData);
                } catch (e) {
                    parsed = responseData;
                }
                resolve({ statusCode: res.statusCode, data: parsed });
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function checkBalances() {
    console.log("Fetching customers...");
    const customersRes = await makeWooCommerceRequest('/wp-json/wc/v3/customers?per_page=100');
    if (!customersRes.data || !Array.isArray(customersRes.data)) {
        console.error("Failed to fetch customers:", customersRes.data);
        return;
    }

    console.log(`Found ${customersRes.data.length} customers. Checking balances...`);
    for (const customer of customersRes.data) {
        const balanceRes = await makeWooCommerceRequest(`/wp-json/wc/v2/wallet/balance/${customer.id}`);
        // TeraWallet might return the balance as a string or number directly, e.g., "150.00"
        if (balanceRes.statusCode === 200 && balanceRes.data) {
            const balance = parseFloat(balanceRes.data);
            if (balance > 0) {
                console.log(`Customer ID ${customer.id} (${customer.email}): ${balanceRes.data} kr`);
            }
        }
    }
}

checkBalances();
