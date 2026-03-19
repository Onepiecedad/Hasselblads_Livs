import type { Context } from "@netlify/functions";
import type { LookupOneOptions } from "node:dns";
import https from "node:https";
import querystring from "node:querystring";

/**
 * WooCommerce Checkout Session Service
 * 
 * Verifies the Firebase user, fetches their WooCommerce customer ID,
 * resets their password to a secure temporary one, logs them into WordPress,
 * adds items to their cart, and returns the WordPress session cookies.
 */

const WORDPRESS_BACKEND_IP = process.env.WORDPRESS_BACKEND_IP;
const WORDPRESS_HOST = process.env.WORDPRESS_HOST || "hasselbladslivs.se";
const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || "hasselblad-bildstudio";
const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY;
const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const WC_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

interface WcItem {
    id: number;
    quantity: number;
}

interface FirebaseLookupResponse {
    error?: {
        message?: string;
    };
    users?: Array<{
        email?: string;
    }>;
}

type WooCommerceResponseData = string | number | boolean | null | Record<string, unknown> | Array<Record<string, unknown>>;

interface WooCommerceResponse {
    statusCode?: number;
    data: WooCommerceResponseData;
}

function createWordPressRequestOptions(
    path: string,
    method: "GET" | "POST" | "PUT",
    headers: Record<string, string>
): https.RequestOptions {
    return {
        hostname: WORDPRESS_HOST,
        port: 443,
        path,
        method,
        headers,
        ...(WORDPRESS_BACKEND_IP
            ? {
                lookup: (
                    hostname: string,
                    options: LookupOneOptions,
                    callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void
                ) => callback(null, WORDPRESS_BACKEND_IP, options.family === 6 ? 6 : 4),
            }
            : {}),
    };
}

function createBridgeLog(bridgeAttemptId: string, step: string, extra: Record<string, unknown> = {}) {
    return {
        scope: "checkout_bridge_auth",
        bridgeAttemptId,
        step,
        ...extra,
    };
}

function buildDeliveryNoteCookie(deliveryNote: string): string {
    return `hbl_delivery_note=${encodeURIComponent(deliveryNote)}; Path=/; Max-Age=900; Secure; SameSite=Lax`;
}

function extractBridgeCookies(cookies: string[]): string[] {
    return cookies.filter((cookie) => {
        const name = cookie.split("=")[0];
        return name.startsWith("wordpress_logged_in_") ||
            name.startsWith("wordpress_sec_") ||
            name.startsWith("wp_woocommerce_session") ||
            name === "woocommerce_items_in_cart" ||
            name === "woocommerce_cart_hash";
    });
}

// 1. Verify Firebase Token
async function verifyFirebaseToken(token: string): Promise<string | null> {
    if (!FIREBASE_API_KEY) {
        console.error("Missing Firebase API key in function environment");
        return null;
    }

    try {
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: token }),
            }
        );
        const data = await response.json() as FirebaseLookupResponse;
        if (data.error || !data.users || data.users.length === 0 || !data.users[0]?.email) {
            console.error("Firebase auth error:", data.error);
            return null;
        }
        return data.users[0].email;
    } catch (error) {
        console.error("Error verifying Firebase token:", error);
        return null;
    }
}

// 2. Make WooCommerce REST API Request
function makeWooCommerceRequest(
    path: string,
    method: "GET" | "PUT" = "GET",
    data: Record<string, unknown> | null = null
): Promise<WooCommerceResponse> {
    return new Promise((resolve, reject) => {
        const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
        const options = createWordPressRequestOptions(path, method, {
                'Authorization': `Basic ${auth}`,
                'Host': WORDPRESS_HOST,
                'Content-Type': 'application/json',
                'User-Agent': 'Netlify/CheckoutSession'
            });

        if (data) {
            const bodyStr = JSON.stringify(data);
            options.headers!['Content-Length'] = Buffer.byteLength(bodyStr).toString();
        }

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                let parsed;
                try {
                    parsed = JSON.parse(responseData);
                } catch (e) {
                    parsed = responseData;
                }
                resolve({ statusCode: res.statusCode, data: parsed });
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// 3. Log into WordPress to get cookies
function loginToWordPress(username: string, password: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const postData = querystring.stringify({
            'log': username,
            'pwd': password,
            'wp-submit': 'Log In',
            'redirect_to': 'https://hasselbladslivs.se/',
            'testcookie': '1'
        });

        const options = createWordPressRequestOptions('/wp-login.php', 'POST', {
                'Host': WORDPRESS_HOST,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData).toString(),
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            });

        const req = https.request(options, (res) => {
            const cookies = res.headers['set-cookie'] || [];
            resolve(cookies);
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// 4. Add items to WooCommerce Cart using the session cookies
function addItemToCart(
    item: WcItem,
    existingCookies: string[]
): Promise<{ cookies: string[]; success: boolean }> {
    return new Promise((resolve) => {
        const cookieHeader = existingCookies.map(c => c.split(';')[0]).join("; ");

        const options = createWordPressRequestOptions(
            `/?add-to-cart=${item.id}&quantity=${item.quantity}`,
            "GET",
            {
                "Host": WORDPRESS_HOST,
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                "Accept": "text/html",
                ...(cookieHeader ? { "Cookie": cookieHeader } : {}),
            }
        );

        const req = https.request(options, (res) => {
            const chunks: Buffer[] = [];
            res.on("data", (chunk: Buffer) => chunks.push(chunk));
            res.on("end", () => {
                const setCookies = res.headers["set-cookie"] || [];
                const allCookies = [...existingCookies];

                for (const setCookie of setCookies) {
                    const cookieName = setCookie.split("=")[0].trim();

                    const idx = allCookies.findIndex(c => c.startsWith(cookieName + "="));
                    if (idx >= 0) {
                        allCookies[idx] = setCookie; // keep full cookie with attributes
                    } else {
                        allCookies.push(setCookie);
                    }
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

    // Support both GET (direct navigation for cookie saving) and POST
    let items: WcItem[] = [];
    let deliveryNote = "";
    let token = "";
    let multibuyTargetParam = "";
    let bridgeAttemptId = url.searchParams.get("bridge_attempt_id") || `auth-${Date.now().toString(36)}`;

    if (request.method === 'POST') {
        try {
            const body = await request.json() as Record<string, unknown>;
            items = (body.items as WcItem[]) || [];
            deliveryNote = (body.deliveryNote as string) || "";
            multibuyTargetParam = String(body.multibuy_target || "");
            bridgeAttemptId = (body.bridgeAttemptId as string) || bridgeAttemptId;
            const authHeader = request.headers.get("Authorization");
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split("Bearer ")[1];
            }
        } catch (e) {
            console.error("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "request_invalid", {
                errorCode: "invalid_json_body",
            }));
            return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
        }
    } else if (request.method === 'GET') {
        const itemsParam = url.searchParams.get("items") || "";
        deliveryNote = url.searchParams.get("delivery_note") || "";
        token = url.searchParams.get("token") || "";
        multibuyTargetParam = url.searchParams.get("multibuy_target") || "";
        bridgeAttemptId = url.searchParams.get("bridge_attempt_id") || bridgeAttemptId;

        if (itemsParam) {
            items = itemsParam.split(",").map((itemStr) => {
                const [id, qty] = itemStr.split(":");
                return { id: parseInt(id), quantity: parseInt(qty) || 1 };
            }).filter(item => !isNaN(item.id));
        }
    } else {
        return new Response('Method Not Allowed', { status: 405 });
    }

    console.log("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "bridge_started", {
        method: request.method,
        itemCount: items.length,
    }));

    // 1. Verify User
    if (!token) {
        console.error("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "bridge_failed", {
            errorCode: "missing_auth_token",
        }));
        return new Response(JSON.stringify({
            error: "Missing or invalid authorization token",
            error_code: "missing_auth_token",
            bridge_attempt_id: bridgeAttemptId,
        }), { status: 401 });
    }

    try {
        const email = await verifyFirebaseToken(token);

        if (!email) {
            console.error("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "bridge_failed", {
                errorCode: "invalid_auth_token",
            }));
            return new Response(JSON.stringify({
                error: "Unauthorized / Invalid token",
                error_code: "invalid_auth_token",
                bridge_attempt_id: bridgeAttemptId,
            }), { status: 401 });
        }

        console.log("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "firebase_verified", {
            customerFound: true,
        }));

        // 2. Fetch Customer ID
        const customerRes = await makeWooCommerceRequest(`/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`);

        if (!customerRes.data || customerRes.data.length === 0) {
            console.error("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "bridge_failed", {
                errorCode: "woocommerce_customer_not_found",
            }));
            return new Response(JSON.stringify({
                error: "WooCommerce customer not found",
                error_code: "woocommerce_customer_not_found",
                bridge_attempt_id: bridgeAttemptId,
            }), { status: 404 });
        }

        const customers = Array.isArray(customerRes.data) ? customerRes.data : [];
        const customerId = typeof customers[0]?.id === "number" ? customers[0].id : null;
        if (!customerId) {
            console.error("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "bridge_failed", {
                errorCode: "woocommerce_customer_missing_id",
            }));
            return new Response(JSON.stringify({
                error: "WooCommerce customer record is missing an ID",
                error_code: "woocommerce_customer_missing_id",
                bridge_attempt_id: bridgeAttemptId,
            }), { status: 502 });
        }

        // 3. Reset Password to a Random Secure Value
        // Note: This does mean they can never use their WP password directly,
        // which is exactly what we want since we use Firebase for all manual auth.
        const tempPassword = "SecureWpLogin_" + Date.now() + "_" + Math.floor(Math.random() * 1000000) + "!";

        const updateRes = await makeWooCommerceRequest(`/wp-json/wc/v3/customers/${customerId}`, 'PUT', {
            password: tempPassword
        });

        if (updateRes.statusCode !== 200) {
            console.error("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "bridge_failed", {
                errorCode: "customer_credentials_update_failed",
                customerId,
                statusCode: updateRes.statusCode,
            }));
            return new Response(JSON.stringify({
                error: "Failed to update WooCommerce customer credentials",
                error_code: "customer_credentials_update_failed",
                bridge_attempt_id: bridgeAttemptId,
            }), { status: 500 });
        }

        // 4. Log into WordPress to get session cookies
        let cookies = await loginToWordPress(email, tempPassword);
        const loggedIn = cookies.some(c => c.includes('wordpress_logged_in_'));

        if (!loggedIn) {
            console.error("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "bridge_failed", {
                errorCode: "wordpress_login_failed",
            }));
            return new Response(JSON.stringify({
                error: "Failed to authenticate with WordPress backend",
                error_code: "wordpress_login_failed",
                bridge_attempt_id: bridgeAttemptId,
            }), { status: 500 });
        }

        console.log("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "wordpress_session_ready", {
            customerId,
        }));

        // 5. Add Items to Cart
        let successCount = 0;
        if (items && Array.isArray(items)) {
            for (const item of items) {
                const result = await addItemToCart(item, cookies);
                cookies = result.cookies;
                if (result.success) successCount++;
            }
        }

        // Parse the multiköp target total — will be set as a cookie for the WordPress PHP hook
        const multibuyTarget = parseFloat(multibuyTargetParam);
        if (multibuyTarget > 0) {
            console.log("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "multibuy_target_cookie", { multibuyTarget }));
        }

        // 6. Build final redirect URL
        const redirectParams = new URLSearchParams();
        if (deliveryNote) redirectParams.set("delivery_note", deliveryNote);
        // Add cache buster to prevent serving a cached checkout page from another user
        redirectParams.set("chash", Date.now().toString());

        const qs = redirectParams.toString();
        const redirectUrl = `/betalning${qs ? '?' + qs : ''}`; // Use relative URL to stay on domain

        if (items && successCount !== items.length) {
            console.error("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "bridge_failed", {
                errorCode: "partial_cart_sync",
                addedItems: successCount,
                expectedItems: items.length,
            }));
            return new Response(JSON.stringify({
                error: "Failed to add the full cart to the authenticated WooCommerce session",
                error_code: "partial_cart_sync",
                added_items: successCount,
                expected_items: items.length,
                bridge_attempt_id: bridgeAttemptId,
            }), {
                status: 502,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store, no-cache, must-revalidate",
                },
            });
        }

        const bridgeCookies = extractBridgeCookies(cookies);
        if (!bridgeCookies.some((cookie) => cookie.startsWith("wordpress_logged_in_"))) {
            console.error("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "bridge_failed", {
                errorCode: "missing_wordpress_session_cookie",
            }));
            return new Response(JSON.stringify({
                error: "Authenticated WordPress session cookie was not established",
                error_code: "missing_wordpress_session_cookie",
                bridge_attempt_id: bridgeAttemptId,
            }), {
                status: 502,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store, no-cache, must-revalidate",
                },
            });
        }
        if (!bridgeCookies.some((cookie) => cookie.startsWith("wp_woocommerce_session"))) {
            console.error("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "bridge_failed", {
                errorCode: "missing_wc_session_cookie",
            }));
            return new Response(JSON.stringify({
                error: "WooCommerce session cookie was not established",
                error_code: "missing_wc_session_cookie",
                bridge_attempt_id: bridgeAttemptId,
            }), {
                status: 502,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store, no-cache, must-revalidate",
                },
            });
        }

        // Return a successful JSON response, but set the cookies on the browser
        const headers = new Headers();
        headers.set("Content-Type", "application/json");

        // Pass relevant cookies to browser (domain/path will take effect)
        for (const cookie of bridgeCookies) {
            // Ensure cookies work cross-path if redirecting
            // We strip the original Domain/Path and set our own to be safe.
            const cookieValue = cookie.split(';')[0];
            headers.append("Set-Cookie", `${cookieValue}; Path=/; Secure; SameSite=Lax`);
        }
        if (deliveryNote) {
            headers.append("Set-Cookie", buildDeliveryNoteCookie(deliveryNote));
        }
        if (multibuyTarget > 0) {
            headers.append("Set-Cookie", `hbl_multibuy_target=${multibuyTarget.toFixed(2)}; Path=/; Max-Age=900; Secure; SameSite=Lax`);
        }

        console.log("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "bridge_redirect_ready", {
            redirectUrl,
        }));

        // If it was a GET request (direct navigation), do a 302 Redirect
        if (request.method === 'GET') {
            headers.set("Location", redirectUrl);
            headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
            return new Response(null, {
                status: 302,
                headers,
            });
        }

        return new Response(JSON.stringify({ success: true, redirectUrl }), {
            status: 200,
            headers,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[CheckoutBridge]", createBridgeLog(bridgeAttemptId, "bridge_failed", {
            errorCode: "internal_server_error",
            message,
        }));
        return new Response(JSON.stringify({
            error: "Internal server error",
            error_code: "internal_server_error",
            bridge_attempt_id: bridgeAttemptId,
        }), { status: 500 });
    }
};
