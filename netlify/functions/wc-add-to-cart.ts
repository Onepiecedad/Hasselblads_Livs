import type { Context } from "@netlify/functions";
import https from "node:https";

/**
 * WooCommerce Add-to-Cart Gateway
 * 
 * This function acts as a gateway between the React frontend and WooCommerce.
 * It receives product IDs and quantities, adds them to a WooCommerce cart
 * server-side, and then redirects the user directly to /kassa with the
 * correct WooCommerce session cookies set.
 * 
 * This solves the cross-origin session problem where the Netlify proxy
 * creates a separate server-side session that doesn't match the user's
 * browser session on WooCommerce.
 * 
 * URL: /.netlify/functions/wc-add-to-cart?items=ID:QTY,ID:QTY&delivery_note=...
 */

const WORDPRESS_BACKEND_IP = "199.16.172.188";
const WORDPRESS_HOST = "hasselbladslivs.se";

interface WcItem {
    id: number;
    quantity: number;
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

    if (!itemsParam) {
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
        return new Response(JSON.stringify({ error: "No valid items" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    console.log(`[wc-add-to-cart] Adding ${items.length} items to WooCommerce cart...`);

    // Add items one by one, carrying session cookies forward
    let cookies: string[] = [];
    let successCount = 0;

    for (const item of items) {
        const result = await addItemToCart(item, cookies);
        cookies = result.cookies;
        if (result.success) {
            successCount++;
            console.log(`  ✅ Added product ${item.id} x${item.quantity}`);
        } else {
            console.warn(`  ❌ Failed to add product ${item.id}`);
        }
    }

    console.log(`[wc-add-to-cart] ${successCount}/${items.length} items added`);

    if (successCount === 0) {
        return new Response(JSON.stringify({ error: "Failed to add any items" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Build redirect URL to /kassa
    const redirectParams = new URLSearchParams();
    if (deliveryNote) redirectParams.set("delivery_note", deliveryNote);
    if (successCount < items.length) redirectParams.set("partial", "1");
    const qs = redirectParams.toString();
    const redirectUrl = `https://${WORDPRESS_HOST}/kassa${qs ? '?' + qs : ''}`;

    // Build Set-Cookie headers to pass WooCommerce session to the user's browser
    const setCookieHeaders: string[] = [];
    for (const cookie of cookies) {
        const [name] = cookie.split("=");
        // Only forward WooCommerce session cookies
        if (name.startsWith("wp_woocommerce_session") ||
            name === "woocommerce_items_in_cart" ||
            name === "woocommerce_cart_hash") {
            setCookieHeaders.push(`${cookie}; Path=/; Secure; SameSite=Lax`);
        }
    }

    // Return a redirect response with cookies set
    const headers = new Headers();
    headers.set("Location", redirectUrl);
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

    // Set each cookie individually
    for (const setCookie of setCookieHeaders) {
        headers.append("Set-Cookie", setCookie);
    }

    return new Response(null, {
        status: 302,
        headers,
    });
};
