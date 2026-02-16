/**
 * WooCommerce API Proxy - Netlify Serverless Function
 * 
 * This proxy allows the frontend to make WooCommerce API calls without
 * running into CORS issues. Credentials are stored in Netlify environment variables.
 */

export default async (req, context) => {
    // Handle preflight CORS
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400',
            }
        });
    }

    // Get WooCommerce config from environment variables
    const WC_URL = process.env.WOOCOMMERCE_URL;
    const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const WC_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    // Validate configuration
    if (!WC_URL || !WC_KEY || !WC_SECRET) {
        return new Response(JSON.stringify({
            error: 'WooCommerce not configured. Set WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET in Netlify environment variables.'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    try {
        // Parse request body
        const body = await req.json();
        const { endpoint, method = 'GET', data } = body;

        if (!endpoint) {
            return new Response(JSON.stringify({ error: 'Missing endpoint parameter' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Build WooCommerce URL
        const wcUrl = `${WC_URL}/wp-json/wc/v3${endpoint}`;

        // Create Basic Auth header
        const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');

        // Prepare fetch options
        const fetchOptions = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            }
        };

        // Add body for POST/PUT/PATCH requests
        if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
            fetchOptions.body = JSON.stringify(data);
        }

        console.log(`WooCommerce request: ${method} ${wcUrl}`);

        // Make request to WooCommerce
        const wcResponse = await fetch(wcUrl, fetchOptions);
        const responseData = await wcResponse.json();

        // Return WooCommerce response
        return new Response(JSON.stringify(responseData), {
            status: wcResponse.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({
            error: error.message || 'Internal proxy error'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
};

export const config = {
    path: "/api/woo-proxy"
};
