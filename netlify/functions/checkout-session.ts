import type { Context } from "@netlify/functions";
import https from "node:https";
import querystring from "node:querystring";

/**
 * WooCommerce Checkout Session Service
 * 
 * Verifies the Firebase user, fetches their WooCommerce customer ID,
 * resets their password to a secure temporary one, logs them into WordPress,
 * adds items to their cart, and returns the WordPress session cookies.
 */

const WORDPRESS_BACKEND_IP = process.env.WORDPRESS_BACKEND_IP || "199.16.172.188";
const WORDPRESS_HOST = process.env.WORDPRESS_HOST || "hasselbladslivs.se";
const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || "hasselblad-bildstudio";
const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const WC_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

interface WcItem {
    id: number;
    quantity: number;
}

// 1. Verify Firebase Token
async function verifyFirebaseToken(token: string): Promise<string | null> {
    try {
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.VITE_FIREBASE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: token }),
            }
        );
        const data = await response.json() as any;
        if (data.error || !data.users || data.users.length === 0) {
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
function makeWooCommerceRequest(path: string, method = 'GET', data: any = null): Promise<any> {
    return new Promise((resolve, reject) => {
        const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
        const options: https.RequestOptions = {
            hostname: WORDPRESS_BACKEND_IP,
            port: 443,
            path: path,
            method: method,
            headers: {
                'Authorization': `Basic ${auth}`,
                'Host': WORDPRESS_HOST,
                'Content-Type': 'application/json',
                'User-Agent': 'Netlify/CheckoutSession'
            },
            rejectUnauthorized: false
        };

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

        const options: https.RequestOptions = {
            hostname: WORDPRESS_BACKEND_IP,
            port: 443,
            path: '/wp-login.php',
            method: 'POST',
            headers: {
                'Host': WORDPRESS_HOST,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData).toString(),
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            },
            rejectUnauthorized: false
        };

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

        const options: https.RequestOptions = {
            hostname: WORDPRESS_BACKEND_IP,
            port: 443,
            path: `/?add-to-cart=${item.id}&quantity=${item.quantity}`,
            method: "GET",
            headers: {
                "Host": WORDPRESS_HOST,
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                "Accept": "text/html",
                ...(cookieHeader ? { "Cookie": cookieHeader } : {}),
            },
            rejectUnauthorized: false,
        };

        const req = https.request(options, (res) => {
            const chunks: Buffer[] = [];
            res.on("data", (chunk: Buffer) => chunks.push(chunk));
            res.on("end", () => {
                const setCookies = res.headers["set-cookie"] || [];
                const allCookies = [...existingCookies];

                for (const setCookie of setCookies) {
                    const cookieName = setCookie.split("=")[0].trim();
                    const cookieValue = setCookie.split(";")[0].trim();

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

    if (request.method === 'POST') {
        try {
            const body = await request.json();
            items = body.items || [];
            deliveryNote = body.deliveryNote || "";
            const authHeader = request.headers.get("Authorization");
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split("Bearer ")[1];
            }
        } catch (e) {
            return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
        }
    } else if (request.method === 'GET') {
        const itemsParam = url.searchParams.get("items") || "";
        deliveryNote = url.searchParams.get("delivery_note") || "";
        token = url.searchParams.get("token") || "";

        if (itemsParam) {
            items = itemsParam.split(",").map((itemStr) => {
                const [id, qty] = itemStr.split(":");
                return { id: parseInt(id), quantity: parseInt(qty) || 1 };
            }).filter(item => !isNaN(item.id));
        }
    } else {
        return new Response('Method Not Allowed', { status: 405 });
    }

    // 1. Verify User
    if (!token) {
        return new Response(JSON.stringify({ error: "Missing or invalid authorization token" }), { status: 401 });
    }

    try {
        const email = await verifyFirebaseToken(token);

        if (!email) {
            return new Response(JSON.stringify({ error: "Unauthorized / Invalid token" }), { status: 401 });
        }

        console.log(`[Checkout Session] Authenticated user: ${email}`);

        // 2. Fetch Customer ID
        const customerRes = await makeWooCommerceRequest(`/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`);

        if (!customerRes.data || customerRes.data.length === 0) {
            return new Response(JSON.stringify({ error: "WooCommerce customer not found" }), { status: 404 });
        }

        const customerId = customerRes.data[0].id;

        // 3. Reset Password to a Random Secure Value
        // Note: This does mean they can never use their WP password directly,
        // which is exactly what we want since we use Firebase for all manual auth.
        const tempPassword = "SecureWpLogin_" + Date.now() + "_" + Math.floor(Math.random() * 1000000) + "!";

        const updateRes = await makeWooCommerceRequest(`/wp-json/wc/v3/customers/${customerId}`, 'PUT', {
            password: tempPassword
        });

        if (updateRes.statusCode !== 200) {
            return new Response(JSON.stringify({ error: "Failed to update WooCommerce customer credentials" }), { status: 500 });
        }

        // 4. Log into WordPress to get session cookies
        let cookies = await loginToWordPress(email, tempPassword);
        const loggedIn = cookies.some(c => c.includes('wordpress_logged_in_'));

        if (!loggedIn) {
            return new Response(JSON.stringify({ error: "Failed to authenticate with WordPress backend" }), { status: 500 });
        }

        console.log(`[Checkout Session] Successfully started WP session for ${email}`);

        // 5. Add Items to Cart
        let successCount = 0;
        if (items && Array.isArray(items)) {
            for (const item of items) {
                const result = await addItemToCart(item, cookies);
                cookies = result.cookies;
                if (result.success) successCount++;
            }
        }

        // 6. Build final redirect URL
        const redirectParams = new URLSearchParams();
        if (deliveryNote) redirectParams.set("delivery_note", deliveryNote);
        if (items && successCount < items.length) redirectParams.set("partial", "1");

        // Add cache buster to prevent serving a cached checkout page from another user
        redirectParams.set("chash", Date.now().toString());

        const qs = redirectParams.toString();
        const redirectUrl = `/kassa${qs ? '?' + qs : ''}`; // Use relative URL to stay on domain

        // Return a successful JSON response, but set the cookies on the browser
        const headers = new Headers();
        headers.set("Content-Type", "application/json");

        // Pass relevant cookies to browser (domain/path will take effect)
        for (const cookie of cookies) {
            const name = cookie.split("=")[0];
            if (
                name.startsWith("wordpress_logged_in_") ||
                name.startsWith("wordpress_sec_") ||
                name.startsWith("wp_woocommerce_session") ||
                name === "woocommerce_items_in_cart" ||
                name === "woocommerce_cart_hash"
            ) {
                // Ensure cookies work cross-path if redirecting
                // We strip the original Domain/Path and set our own to be safe.
                const cookieValue = cookie.split(';')[0];
                headers.append("Set-Cookie", `${cookieValue}; Path=/; Secure; SameSite=Lax`);
            }
        }

        // If it was a GET request (direct navigation), do a 302 Redirect
        if (request.method === 'GET') {
            headers.set("Location", `https://${WORDPRESS_HOST}${redirectUrl}`);
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
    } catch (error: any) {
        console.error("Checkout session error:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
};
