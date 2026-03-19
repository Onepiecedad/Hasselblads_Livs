import type { Context } from "@netlify/functions";
import https from "node:https";

const WORDPRESS_BACKEND_IP = process.env.WORDPRESS_BACKEND_IP || "199.16.172.188";
const WORDPRESS_HOST = process.env.WORDPRESS_HOST || "hasselbladslivs.se";

/**
 * WooCommerce Add-to-Cart Gateway
 * 
 * This function acts as a gateway between the React frontend and WooCommerce.
 * It receives product IDs and quantities, adds them to a WooCommerce cart
 * server-side, and then redirects the user directly to /betalning with the
 * correct WooCommerce session cookies set.
 * 
 * This solves the cross-origin session problem where the Netlify proxy
 * creates a separate server-side session that doesn't match the user's
 * browser session on WooCommerce.
 * 
 * URL: /.netlify/functions/wc-add-to-cart?items=ID:QTY,ID:QTY&delivery_note=...
 */

interface WcItem {
    id: number;
    quantity: number;
}

function createBridgeLog(bridgeAttemptId: string, step: string, extra: Record<string, unknown> = {}) {
    return {
        scope: "checkout_bridge_guest",
        bridgeAttemptId,
        step,
        ...extra,
    };
}

function buildDeliveryNoteCookie(deliveryNote: string): string {
    return `hbl_delivery_note=${encodeURIComponent(deliveryNote)}; Path=/; Max-Age=900; Secure; SameSite=Lax`;
}

function extractBrowserSessionCookies(cookies: string[]): string[] {
    return cookies
        .map(cookie => cookie.split(";")[0].trim())
        .filter((cookie) => {
            const [name] = cookie.split("=");
            return name.startsWith("wp_woocommerce_session") ||
                name === "woocommerce_items_in_cart" ||
                name === "woocommerce_cart_hash";
        });
}

/**
 * Add a single item to WooCommerce cart via server-side HTTP request.
 * Returns the session cookies from the response.
 */
function addItemToCart(
    item: WcItem,
    existingCookies: string[]
): Promise<{ cookies: string[]; success: boolean }> {
    return new Promise((resolve) => {
        const cookieHeader = existingCookies.join("; ");

        const options: https.RequestOptions = {
            hostname: WORDPRESS_BACKEND_IP,
            port: 443,
            path: `/?add-to-cart=${item.id}&quantity=${item.quantity}`,
            method: "GET",
            headers: {
                "Host": WORDPRESS_HOST,
                "User-Agent": "Mozilla/5.0 (compatible; HasselbladsCartGateway/1.0)",
                "Accept": "text/html",
                ...(cookieHeader ? { "Cookie": cookieHeader } : {}),
            },
            rejectUnauthorized: false,
        };

        const req = https.request(options, (res) => {
            const chunks: Buffer[] = [];
            res.on("data", (chunk: Buffer) => chunks.push(chunk));
            res.on("end", () => {
                // Extract set-cookie headers
                const setCookies = res.headers["set-cookie"] || [];
                const allCookies = [...existingCookies];

                // Parse new cookies and update/add them
                for (const setCookie of setCookies) {
                    const cookieName = setCookie.split("=")[0].trim();
                    const cookieValue = setCookie.split(";")[0].trim();

                    // Remove existing cookie with same name
                    const idx = allCookies.findIndex(c => c.startsWith(cookieName + "="));
                    if (idx >= 0) allCookies.splice(idx, 1);

                    allCookies.push(cookieValue);
                }

                const success = res.statusCode === 200 || res.statusCode === 302;
                resolve({ cookies: allCookies, success });
            });
        });

        req.on("error", (error) => {
            console.error(`Failed to add item ${item.id}:`, error.message);
            resolve({ cookies: existingCookies, success: false });
        });

        req.end();
    });
}


export default async (request: Request, _context: Context): Promise<Response> => {
    const url = new URL(request.url);

    // Parse items from query string: items=ID:QTY,ID:QTY,...
    const itemsParam = url.searchParams.get("items") || "";
    const deliveryNote = url.searchParams.get("delivery_note") || "";
    const discountParam = url.searchParams.get("discount") || "";
    const bridgeAttemptId = url.searchParams.get("bridge_attempt_id") || `guest-${Date.now().toString(36)}`;

    console.log("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "request_received", {
        itemsParam,
        discountParam,
        hasDeliveryNote: !!deliveryNote,
    }));

    if (!itemsParam) {
        console.error("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "request_invalid", {
            errorCode: "missing_items_param",
        }));
        return new Response(JSON.stringify({ error: "Missing items parameter" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Parse items
    const items: WcItem[] = itemsParam.split(",").map((itemStr) => {
        const [id, qty] = itemStr.split(":");
        return { id: parseInt(id), quantity: parseInt(qty) || 1 };
    }).filter(item => !isNaN(item.id));

    if (items.length === 0) {
        console.error("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "request_invalid", {
            errorCode: "no_valid_items",
        }));
        return new Response(JSON.stringify({ error: "No valid items" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    console.log("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "bridge_started", {
        itemCount: items.length,
    }));

    // Add items one by one, carrying session cookies forward
    let cookies: string[] = [];
    let successCount = 0;

    for (const item of items) {
        const result = await addItemToCart(item, cookies);
        cookies = result.cookies;
        if (result.success) {
            successCount++;
            console.log("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "cart_item_added", {
                productId: item.id,
                quantity: item.quantity,
            }));
        } else {
            console.warn("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "cart_item_failed", {
                productId: item.id,
                quantity: item.quantity,
                errorCode: "cart_item_add_failed",
            }));
        }
    }

    // Parse the multiköp discount — will be set as a cookie for the WordPress PHP hook
    const discount = parseFloat(discountParam);
    if (discount > 0) {
        console.log("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "multibuy_discount_cookie", { discount }));
    }

    console.log("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "cart_sync_complete", {
        addedItems: successCount,
        expectedItems: items.length,
    }));

    if (successCount !== items.length) {
        console.error("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "bridge_failed", {
            errorCode: "partial_cart_sync",
            addedItems: successCount,
            expectedItems: items.length,
        }));
        return new Response(JSON.stringify({
            error: "Failed to add the full cart to WooCommerce checkout session",
            error_code: "partial_cart_sync",
            added_items: successCount,
            expected_items: items.length,
            bridge_attempt_id: bridgeAttemptId,
        }), {
            status: 502,
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
    }

    // Build redirect URL to the dedicated WooCommerce final checkout route
    const redirectParams = new URLSearchParams();
    if (deliveryNote) redirectParams.set("delivery_note", deliveryNote);
    if (discount > 0) redirectParams.set("discount", discount.toFixed(2));
    const qs = redirectParams.toString();
    const redirectUrl = `/betalning${qs ? '?' + qs : ''}`;

    // Build Set-Cookie headers to pass WooCommerce session to the user's browser
    const sessionCookies = extractBrowserSessionCookies(cookies);
    if (sessionCookies.length === 0) {
        console.error("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "bridge_failed", {
            errorCode: "missing_session_cookies",
        }));
        return new Response(JSON.stringify({
            error: "WooCommerce session cookies were not established during checkout handoff",
            error_code: "missing_session_cookies",
            bridge_attempt_id: bridgeAttemptId,
        }), {
            status: 502,
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
    }

    const setCookieHeaders = sessionCookies.map((cookie) => `${cookie}; Path=/; Secure; SameSite=Lax`);
    if (!setCookieHeaders.some((cookie) => cookie.startsWith("wp_woocommerce_session"))) {
        console.error("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "bridge_failed", {
            errorCode: "missing_primary_wc_session_cookie",
        }));
        return new Response(JSON.stringify({
            error: "Missing primary WooCommerce session cookie during checkout handoff",
            error_code: "missing_primary_wc_session_cookie",
            bridge_attempt_id: bridgeAttemptId,
        }), {
            status: 502,
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
    }

    // Return a redirect response with cookies set
    const headers = new Headers();
    headers.set("Location", redirectUrl);
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

    // Set each cookie individually
    for (const setCookie of setCookieHeaders) {
        headers.append("Set-Cookie", setCookie);
    }
    if (deliveryNote) {
        headers.append("Set-Cookie", buildDeliveryNoteCookie(deliveryNote));
    }
    if (discount > 0) {
        headers.append("Set-Cookie", `hbl_multibuy_discount=${discount.toFixed(2)}; Path=/; Max-Age=900; Secure; SameSite=Lax`);
    }

    console.log("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "bridge_redirect_ready", {
        redirectUrl,
    }));

    return new Response(null, {
        status: 302,
        headers,
    });
};
