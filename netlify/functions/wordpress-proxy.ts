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

                    // Inject scripts into WooCommerce checkout pages
                    const isCheckoutPage = /^\/(kassa|kassan)(\/|$)/.test(targetPath);
                    const deliveryNote = url.searchParams.get("delivery_note");
                    const isHtml = /text\/html/i.test(contentType);

                    if (isCheckoutPage && isHtml) {
                        // 1. Stripe Swish bridge fix — inject EARLY, right after wcSettings is defined
                        // The woo-stripe-payment plugin creates wcStripeBlocks with empty maps.
                        // This script intercepts the creation and populates maps from wcSettings data.
                        const stripeBridgeScript = `
<script id="stripe-blocks-bridge">
(function(){
  // Wait for wcSettings to exist, then set a trap for wcStripeBlocks
  function tryPatch() {
    if (typeof wcSettings === 'undefined') return false;
    var data = (wcSettings.paymentMethodData || {});
    if (!data.stripe_swish && !data.stripe_cc) return false;

    // Helper: patch a map and fix Swish Payment Element issue
    function patchMap(map, srcData, isLocalPayment) {
      if (map && Object.keys(map).length === 0 && srcData) {
        Object.assign(map, srcData);
      }
      // Delete elementOptions for Swish — the Payment Element iframe
      // renders at 4px and breaks. Removing it forces the working
      // redirect-based flow instead.
      if (isLocalPayment && map && map.elementOptions) {
        delete map.elementOptions;
      }
    }

    // If wcStripeBlocks already exists, patch it directly
    if (typeof wcStripeBlocks !== 'undefined') {
      patchMap(wcStripeBlocks['wc-stripe-local-payment'], data.stripe_swish, true);
      patchMap(wcStripeBlocks['wc-stripe-credit-card'], data.stripe_cc, false);
      return true;
    }

    // wcStripeBlocks doesn't exist yet — intercept its creation via Object.defineProperty
    var realValue;
    Object.defineProperty(window, 'wcStripeBlocks', {
      configurable: true,
      get: function() { return realValue; },
      set: function(val) {
        realValue = val;
        // Patch each map as it gets populated
        setTimeout(function() {
          if (val) {
            patchMap(val['wc-stripe-local-payment'], data.stripe_swish, true);
            patchMap(val['wc-stripe-credit-card'], data.stripe_cc, false);
          }
        }, 0);
      }
    });
    return true;
  }

  // Try immediately
  if (!tryPatch()) {
    // Retry a few times if wcSettings isn't ready
    var attempts = 0;
    var timer = setInterval(function() {
      if (tryPatch() || ++attempts > 50) clearInterval(timer);
    }, 50);
  }
})();
</script>`;
                        // Inject right after wc-settings-js-before script (where wcSettings is defined)
                        const settingsScriptEnd = textBody.indexOf('</script>', textBody.indexOf('wc-settings-js-before'));
                        if (settingsScriptEnd !== -1) {
                            const insertAt = settingsScriptEnd + '</script>'.length;
                            textBody = textBody.substring(0, insertAt) + stripeBridgeScript + textBody.substring(insertAt);
                        } else if (textBody.includes("</head>")) {
                            // Fallback: inject before </head>
                            textBody = textBody.replace("</head>", stripeBridgeScript + "\n</head>");
                        }

                        // 2. Delivery-note pre-fill script (at end of body)
                        if (deliveryNote && textBody.includes("</body>")) {
                            const safeNote = deliveryNote
                                .replace(/\\/g, "\\\\")
                                .replace(/'/g, "\\'")
                                .replace(/\n/g, "\\n");
                            const deliveryScript = `
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
                            textBody = textBody.replace("</body>", deliveryScript + "\n</body>");
                        }
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
