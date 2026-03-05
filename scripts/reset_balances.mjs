import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) acc[match[1]] = match[2];
    return acc;
}, {});

const auth = 'Basic ' + Buffer.from(`${env.WOOCOMMERCE_CONSUMER_KEY}:${env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');
const host = env.WORDPRESS_HOST || 'hasselbladslivs.se';

async function setBalance(id, amount) {
    console.log(`Setting balance for Customer ID: ${id} to ${amount}...`);

    // TeraWallet allows changing balances through transaction endpoints. But updating user meta usually works too.
    // Let's actually use the transaction endpoint since changing user meta directly might be ignored.
    // Wait, let's look at get-wallet-balance.js. It calls:
    // /wp-json/wc/v2/wallet/balance/${customerId}
    const reqRes = await fetch(`https://${host}/wp-json/wc/v3/customers/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            meta_data: [
                {
                    key: '_woo_wallet_balance',
                    value: amount.toString()
                }
            ]
        })
    });

    const updateData = await reqRes.json();
    if (updateData.meta_data) {
        const updatedMeta = updateData.meta_data.find(m => m.key === '_woo_wallet_balance');
        console.log(`Updated meta for ID ${id}:`, updatedMeta ? updatedMeta.value : 'Not found in meta_data');
    } else {
        console.log(`Failed for ID ${id}:`, updateData);
    }
}

(async () => {
    await setBalance(3, 5500); // fredrik
    await setBalance(4, 5500); // jens
})();
