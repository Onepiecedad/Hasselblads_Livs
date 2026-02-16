import https from "node:https";

/**
 * WooCommerce API Proxy - Netlify Serverless Function
 * 
 * Proxies WooCommerce REST API requests from PIM to WordPress backend
 * at Pressable. Uses rejectUnauthorized: false for SSL cert mismatch.
 */

const WORDPRESS_BACKEND_IP = "199.16.172.188";
const WORDPRESS_HOST = "hasselbladslivs.se";

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
};

export default async (request, context) => {
    // Handle preflight CORS
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: CORS_HEADERS,
        });
    }

    const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const WC_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    if (!WC_KEY || !WC_SECRET) {
        return new Response(JSON.stringify({ error: 'WooCommerce credentials not configured.' }), {
            status: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await request.json();
        const { endpoint, method = 'GET', data } = body;

        if (!endpoint) {
            return new Response(JSON.stringify({ error: 'Missing endpoint parameter' }), {
                status: 400,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
        }

        const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
        const requestBody = data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())
            ? JSON.stringify(data) : undefined;

        const result = await new Promise((resolve) => {
            const options = {
                hostname: WORDPRESS_BACKEND_IP,
                port: 443,
                path: `/wp-json/wc/v3${endpoint}`,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${auth}`,
                    'Host': WORDPRESS_HOST,
                    'X-Forwarded-Host': WORDPRESS_HOST,
                    'User-Agent': 'HasselbladsLivs-PIM/1.0',
                },
                rejectUnauthorized: false,
            };

            if (requestBody) {
                options.headers['Content-Length'] = Buffer.byteLength(requestBody).toString();
            }

            console.log(`WooCommerce proxy: ${method} /wp-json/wc/v3${endpoint}`);

            const proxyReq = https.request(options, (proxyRes) => {
                const chunks = [];
                proxyRes.on('data', (chunk) => chunks.push(chunk));
                proxyRes.on('end', () => {
                    const responseText = Buffer.concat(chunks).toString('utf-8');
                    resolve({
                        statusCode: proxyRes.statusCode || 200,
                        body: responseText,
                    });
                });
            });

            proxyReq.on('error', (error) => {
                console.error('WooCommerce proxy error:', error);
                resolve({
                    statusCode: 502,
                    body: JSON.stringify({ error: error.message }),
                });
            });

            if (requestBody) proxyReq.write(requestBody);
            proxyReq.end();
        });

        return new Response(result.body, {
            status: result.statusCode,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('WooCommerce proxy error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal proxy error' }), {
            status: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
    }
};
