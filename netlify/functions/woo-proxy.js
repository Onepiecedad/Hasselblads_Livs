/**
 * WooCommerce API Proxy - Netlify Serverless Function (v1 handler format)
 * 
 * This proxy allows the PIM to make WooCommerce API calls without
 * running into CORS issues. Credentials are stored in Netlify environment variables.
 */

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

    // Get WooCommerce config from environment variables
    const WC_URL = process.env.WOOCOMMERCE_URL;
    const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const WC_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    // Validate configuration
    if (!WC_URL || !WC_KEY || !WC_SECRET) {
        return {
            statusCode: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'WooCommerce not configured. Set WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET in Netlify environment variables.'
            }),
        };
    }

    try {
        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const { endpoint, method = 'GET', data } = body;

        if (!endpoint) {
            return {
                statusCode: 400,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing endpoint parameter' }),
            };
        }

        // Build WooCommerce URL with auth
        const wcUrl = `${WC_URL}/wp-json/wc/v3${endpoint}`;
        const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');

        // Build fetch options
        const fetchOptions = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`,
            },
        };

        if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
            fetchOptions.body = JSON.stringify(data);
        }

        console.log(`WooCommerce proxy: ${method} ${wcUrl}`);

        // Make request to WooCommerce
        const response = await fetch(wcUrl, fetchOptions);
        const responseText = await response.text();

        // Try to parse as JSON
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
