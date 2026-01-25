import type { Context } from "@netlify/edge-functions";

/**
 * WordPress/WooCommerce API Proxy Edge Function
 * 
 * Proxies requests from /wp-json/* to the WordPress backend at Pressable.
 * This enables the WooCommerce REST API and MCP to work through Netlify.
 */

const WORDPRESS_BACKEND_IP = "199.16.172.188";
const WORDPRESS_HOST = "hasselbladslivs.se";

export default async (request: Request, context: Context): Promise<Response> => {
    const url = new URL(request.url);

    // Build the target URL for WordPress backend
    const targetUrl = `https://${WORDPRESS_BACKEND_IP}${url.pathname}${url.search}`;

    // Clone the original request headers
    const headers = new Headers(request.headers);

    // Override Host header to match what WordPress expects
    headers.set("Host", WORDPRESS_HOST);
    headers.set("X-Forwarded-Host", WORDPRESS_HOST);
    headers.set("X-Forwarded-Proto", "https");

    try {
        // Forward the request to WordPress
        const proxyResponse = await fetch(targetUrl, {
            method: request.method,
            headers: headers,
            body: request.method !== "GET" && request.method !== "HEAD"
                ? await request.text()
                : undefined,
        });

        // Clone response headers
        const responseHeaders = new Headers(proxyResponse.headers);

        // Remove headers that might cause issues
        responseHeaders.delete("transfer-encoding");

        return new Response(proxyResponse.body, {
            status: proxyResponse.status,
            statusText: proxyResponse.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error("WordPress proxy error:", error);
        return new Response(JSON.stringify({
            error: "Failed to connect to WordPress backend",
            details: error instanceof Error ? error.message : "Unknown error"
        }), {
            status: 502,
            headers: { "Content-Type": "application/json" },
        });
    }
};

export const config = {
    path: ["/wp-json/*", "/wp-admin/*", "/checkout/*"],
};
