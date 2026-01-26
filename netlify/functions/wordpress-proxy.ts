import type { Context, Config } from "@netlify/functions";
import https from "node:https";

/**
 * WordPress/WooCommerce API Proxy Function
 * 
 * Proxies requests to the WordPress backend at Pressable.
 * Uses rejectUnauthorized: false to bypass SSL certificate mismatch.
 */

const WORDPRESS_BACKEND_IP = "199.16.172.188";
const WORDPRESS_HOST = "hasselbladslivs.se";

export default async (request: Request, context: Context): Promise<Response> => {
    const url = new URL(request.url);

    // Extract the actual WordPress path from the redirect
    // The path comes in as /.netlify/functions/wordpress-proxy/wp-json/...
    const wpPathMatch = url.pathname.match(/\/.netlify\/functions\/wordpress-proxy(\/.*)/);
    const targetPath = wpPathMatch ? wpPathMatch[1] : url.pathname;

    // Build headers
    const headers: Record<string, string> = {
        "Host": WORDPRESS_HOST,
        "X-Forwarded-Host": WORDPRESS_HOST,
        "X-Forwarded-Proto": "https",
    };

    // Forward content-type
    const contentType = request.headers.get("content-type");
    if (contentType) headers["Content-Type"] = contentType;

    // Forward authorization headers
    const auth = request.headers.get("authorization");
    if (auth) headers["Authorization"] = auth;

    const mcpKey = request.headers.get("x-mcp-api-key");
    if (mcpKey) headers["X-MCP-API-Key"] = mcpKey;

    // Get request body for non-GET requests
    let body: string | undefined;
    if (request.method !== "GET" && request.method !== "HEAD") {
        try {
            body = await request.text();
        } catch {
            body = undefined;
        }
    }

    return new Promise((resolve) => {
        const options: https.RequestOptions = {
            hostname: WORDPRESS_BACKEND_IP,
            port: 443,
            path: targetPath + url.search,
            method: request.method,
            headers: headers,
            rejectUnauthorized: false, // Skip SSL verification for Pressable's mismatched cert
        };

        const proxyReq = https.request(options, (proxyRes) => {
            const chunks: Buffer[] = [];
            proxyRes.on("data", (chunk: Buffer) => chunks.push(chunk));
            proxyRes.on("end", () => {
                const responseBuffer = Buffer.concat(chunks);
                const responseHeaders: Record<string, string> = {};

                for (const [key, value] of Object.entries(proxyRes.headers)) {
                    if (value && typeof value === "string") {
                        responseHeaders[key] = value;
                    }
                }

                // Remove problematic headers
                delete responseHeaders["transfer-encoding"];
                delete responseHeaders["connection"];

                // Check if this is a binary response (images, fonts, etc.)
                const contentType = proxyRes.headers["content-type"] || "";
                const isBinary = /^(image|audio|video|font|application\/octet-stream|application\/pdf|application\/zip)/i.test(contentType);

                if (isBinary) {
                    // Return binary data as-is (as Uint8Array)
                    resolve(new Response(responseBuffer, {
                        status: proxyRes.statusCode || 200,
                        headers: responseHeaders,
                    }));
                } else {
                    // Return text-based content (HTML, JSON, CSS, JS)
                    resolve(new Response(responseBuffer.toString("utf-8"), {
                        status: proxyRes.statusCode || 200,
                        headers: responseHeaders,
                    }));
                }
            });
        });

        proxyReq.on("error", (error: Error) => {
            console.error("WordPress proxy error:", error);
            resolve(new Response(JSON.stringify({
                error: "Failed to connect to WordPress backend",
                details: error.message,
            }), {
                status: 502,
                headers: { "Content-Type": "application/json" },
            }));
        });

        if (body) proxyReq.write(body);
        proxyReq.end();
    });
};
