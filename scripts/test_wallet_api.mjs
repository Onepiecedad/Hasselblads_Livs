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

async function testWalletTransaction() {
    const customerId = 3; // fredrik@scfo.se

    console.log("1. Fetching current balance...");
    const balanceRes = await makeWooCommerceRequest(`/wp-json/wc/v2/wallet/balance/${customerId}`);
    console.log("Current Balance:", balanceRes.data);

    console.log("\n2. Trying to debit wallet by 10 kr...");
    const debitRes = await makeWooCommerceRequest(`/wp-json/wc/v2/wallet/${customerId}`, 'POST', {
        type: 'debit',
        amount: "10.00",
        note: "Test API deduction"
    });
    console.log("Debit Status:", debitRes.statusCode);
    console.log("Debit Response:", JSON.stringify(debitRes.data));

    console.log("\n3. Fetching new balance...");
    const balanceRes2 = await makeWooCommerceRequest(`/wp-json/wc/v2/wallet/balance/${customerId}`);
    console.log("New Balance:", balanceRes2.data);
}

testWalletTransaction();
