/**
 * WooCommerce API Proxy - Netlify Serverless Function
 * 
 * This proxy allows the PIM to make WooCommerce API calls without
 * running into CORS issues. The WordPress backend runs on Pressable
 * at a specific IP, while the domain points to this Netlify site.
 */

// WordPress backend on Pressable (same as wordpress-proxy.ts)
const WORDPRESS_BACKEND_IP = "199.16.172.188";
const WORDPRESS_HOST = "hasselbladslivs.se";

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
};

export const handler = async (event) => {
    // Handle preflight CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: CORS_HEADERS,
            body: '',
        };
    }

    // Get WooCommerce credentials from environment variables
    const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const WC_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    if (!WC_KEY || !WC_SECRET) {
        return {
            statusCode: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'WooCommerce credentials not configured.'
            }),
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { endpoint, method = 'GET', data } = body;

        if (!endpoint) {
            return {
                statusCode: 400,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing endpoint parameter' }),
            };
        }

        // Build URL pointing to the Pressable backend IP
        const wcUrl = `https://${WORDPRESS_BACKEND_IP}/wp-json/wc/v3${endpoint}`;
        const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');

        const fetchOptions = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`,
                'Host': WORDPRESS_HOST,
                'X-Forwarded-Host': WORDPRESS_HOST,
            },
        };

        if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
            fetchOptions.body = JSON.stringify(data);
        }

        console.log(`WooCommerce proxy: ${method} ${wcUrl}`);

        const response = await fetch(wcUrl, fetchOptions);
        const responseText = await response.text();

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = { raw: responseText };
        }

        return {
            statusCode: response.status,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify(responseData),
        };

    } catch (error) {
        console.error('WooCommerce proxy error:', error);
        return {
            statusCode: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error.message || 'Internal proxy error' }),
        };
    }
};
