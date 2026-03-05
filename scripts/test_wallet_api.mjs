import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) acc[match[1]] = match[2];
    return acc;
}, {});

const auth = 'Basic ' + Buffer.from(`${env.WOOCOMMERCE_CONSUMER_KEY}:${env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');
const host = env.WORDPRESS_HOST || 'hasselbladslivs.se';

async function testMethod(method) {
    console.log(`Testing ${method}...`);
    const res = await fetch(`https://${host}/wp-json/wc/v2/wallet/balance/3`, {
        method: method,
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json'
        },
        body: method !== 'GET' ? JSON.stringify({ amount: "5500", type: "credit" }) : undefined
    });
    console.log(`Response for ${method}:`, await res.text());
}

(async () => {
    await testMethod('POST');
    await testMethod('PUT');
})();
