import https from "node:https";

const WC_KEY = 'ck_d4eb80b3152340de830c562b749348b09ed5b1e7';
const WC_SECRET = 'cs_c066d5f2f8dc9debdf27590cb7046c77250701ea';
const WORDPRESS_BACKEND_IP = "199.16.172.188";
const WORDPRESS_HOST = "hasselbladslivs.se";

function makeWooCommerceRequest(path) {
    return new Promise((resolve, reject) => {
        const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
        const options = {
            hostname: WORDPRESS_BACKEND_IP,
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Host': WORDPRESS_HOST,
                'User-Agent': 'Node/TestScript'
            },
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => resolve(JSON.parse(responseData)));
        });

        req.on('error', reject);
        req.end();
    });
}

makeWooCommerceRequest('/wp-json/wp/v2/plugins').then(data => {
    if (Array.isArray(data)) {
        console.log("Active Plugins:");
        data.filter(p => p.status === 'active').forEach(p => console.log(`- ${p.name} (${p.plugin})`));
    } else {
        console.log("Error or non-array response:", data);
    }
});
