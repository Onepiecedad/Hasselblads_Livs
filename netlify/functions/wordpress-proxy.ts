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
    // Handle CORS preflight (OPTIONS) requests for Store API custom headers
    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Nonce, Cart-Token, X-WP-Nonce, X-WC-Store-API-Nonce, X-HTTP-Method-Override, Authorization, Cookie",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "86400",
            },
        });
    }

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
        "X-Forwarded-For": request.headers.get("x-forwarded-for") || request.headers.get("x-nf-client-connection-ip") || "127.0.0.1",
    };

    // Forward User-Agent (critical: Pressable blocks requests without it)
    const userAgent = request.headers.get("user-agent");
    headers["User-Agent"] = userAgent || "Mozilla/5.0 (compatible; HasselbladsProxy/1.0)";

    // Forward Accept headers
    const accept = request.headers.get("accept");
    if (accept) headers["Accept"] = accept;
    const acceptLang = request.headers.get("accept-language");
    if (acceptLang) headers["Accept-Language"] = acceptLang;

    // Forward content-type
    const contentType = request.headers.get("content-type");
    if (contentType) headers["Content-Type"] = contentType;

    // Forward cookies (critical for WooCommerce sessions)
    const cookies = request.headers.get("cookie");
    if (cookies) headers["Cookie"] = cookies;

    // Forward authorization headers
    const auth = request.headers.get("authorization");
    if (auth) headers["Authorization"] = auth;

    const mcpKey = request.headers.get("x-mcp-api-key");
    if (mcpKey) headers["X-MCP-API-Key"] = mcpKey;

    // Forward WooCommerce Store API nonce
    const nonce = request.headers.get("nonce");
    if (nonce) headers["Nonce"] = nonce;
    const cartToken = request.headers.get("cart-token");
    if (cartToken) headers["Cart-Token"] = cartToken;

    // Forward X-WP-Nonce (WordPress REST API session nonce — critical for authenticated requests)
    const wpNonce = request.headers.get("x-wp-nonce");
    if (wpNonce) headers["X-WP-Nonce"] = wpNonce;

    // Forward X-WC-Store-API-Nonce (WooCommerce Store API specific nonce)
    const wcStoreNonce = request.headers.get("x-wc-store-api-nonce");
    if (wcStoreNonce) headers["X-WC-Store-API-Nonce"] = wcStoreNonce;

    // Forward X-HTTP-Method-Override (used by WC Blocks for PUT/PATCH via POST)
    const methodOverride = request.headers.get("x-http-method-override");
    if (methodOverride) headers["X-HTTP-Method-Override"] = methodOverride;

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

                // Use Headers object to properly handle multi-value headers (Set-Cookie)
                const responseHeaders = new Headers();

                // Collect Set-Cookie headers separately — they MUST NOT be comma-joined
                const setCookies: string[] = [];

                for (const [key, value] of Object.entries(proxyRes.headers)) {
                    if (!value) continue;
                    const lowerKey = key.toLowerCase();

                    // Skip problematic headers
                    if (lowerKey === "transfer-encoding" || lowerKey === "connection") continue;

                    if (lowerKey === "set-cookie") {
                        // Set-Cookie must be appended individually
                        const cookies = Array.isArray(value) ? value : [value];
                        for (const cookie of cookies) {
                            // Fix domain in cookies to match the proxy domain
                            const fixedCookie = cookie.replace(
                                /domain=[^;]*/gi,
                                `domain=hasselbladslivs.se`
                            );
                            setCookies.push(fixedCookie);
                        }
                    } else if (Array.isArray(value)) {
                        responseHeaders.set(key, value.join(", "));
                    } else if (typeof value === "string") {
                        responseHeaders.set(key, value);
                    }
                }

                // Append each Set-Cookie individually (critical for browser parsing)
                for (const cookie of setCookies) {
                    responseHeaders.append("Set-Cookie", cookie);
                }

                // Expose Store API headers to the browser (nonce, cart-token)
                responseHeaders.set("access-control-expose-headers", "Nonce, Cart-Token, X-WC-Store-API-Nonce, X-WP-Nonce");
                // CORS: allow the frontend origin
                responseHeaders.set("access-control-allow-origin", request.headers.get("origin") || "*");
                responseHeaders.set("access-control-allow-credentials", "true");
                responseHeaders.set("access-control-allow-headers", "Content-Type, Nonce, Cart-Token, X-WP-Nonce, X-WC-Store-API-Nonce, X-HTTP-Method-Override, Authorization, Cookie");

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
                    let textBody = responseBuffer.toString("utf-8");

                    // Inject delivery-note script into WooCommerce checkout pages
                    const isCheckoutPage = /^\/(kassa|kassan)(\/|$)/.test(targetPath);
                    const deliveryNote = url.searchParams.get("delivery_note");
                    const isHtml = /text\/html/i.test(contentType);

                    if (isCheckoutPage && deliveryNote && isHtml && textBody.includes("</body>")) {
                        const safeNote = deliveryNote
                            .replace(/\\/g, "\\\\")
                            .replace(/'/g, "\\'")
                            .replace(/\n/g, "\\n");
                        const injectScript = `
<script>
(function(){
  var note = decodeURIComponent('${safeNote}');
  function fill() {
    var f = document.getElementById('order_comments');
    if (f) { f.value = note; f.dispatchEvent(new Event('change',{bubbles:true})); }
    else { setTimeout(fill, 500); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill);
  else fill();
})();
</script>`;
                        textBody = textBody.replace("</body>", injectScript + "\n</body>");
                    }

                    resolve(new Response(textBody, {
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
