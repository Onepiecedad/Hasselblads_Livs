import https from 'https';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) acc[match[1]] = match[2];
    return acc;
}, {});

const auth = 'Basic ' + Buffer.from(`${env.WOOCOMMERCE_CONSUMER_KEY}:${env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');

const req = https.request({
    hostname: env.WORDPRESS_HOST,
    path: '/wp-json/wc/v3/customers/3',
    method: 'GET',
    headers: { 'Authorization': auth }
}, res => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
        const customer = JSON.parse(data);
        console.log("Customer Meta:");
        const walletMeta = customer.meta_data.find(m => m.key === '_woo_wallet_balance');
        console.log("Wallet Meta:", walletMeta);
    });
});
req.end();
