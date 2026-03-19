/**
 * WooCommerce Checkout Service
 * 
 * Hanterar integration med WooCommerce för checkout.
 * Använder Netlify serverless functions som gateway.
 * 
 * Alla API-anrop går via Netlify proxy (netlify.toml → wordpress-proxy.ts)
 * för att undvika CORS-problem.
 */

interface CartItem {
    id: string;
    name?: string;
    woocommerce_id?: number;
    quantity: number;
    price?: number;
    lineTotal?: number;
}

interface CheckoutGatewayErrorPayload {
    error?: string;
    error_code?: string;
    bridge_attempt_id?: string;
}

function getInvalidCheckoutItems(items: CartItem[]): CartItem[] {
    return items.filter(item => typeof item.woocommerce_id !== "number" || item.woocommerce_id <= 0);
}

function createBridgeAttemptId(prefix: "guest" | "auth"): string {
    const randomPart = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${Date.now().toString(36)}-${randomPart}`;
}

function primeCheckoutCookiesFromGatewayUrl(gatewayUrl: string): void {
    if (typeof document === "undefined") {
        return;
    }

    const url = new URL(gatewayUrl, window.location.origin);
    const discountParam = url.searchParams.get("discount");

    if (discountParam) {
        const discount = parseFloat(discountParam);
        if (discount > 0) {
            document.cookie = `hbl_multibuy_discount=${discount.toFixed(2)}; Path=/; Max-Age=900; SameSite=Lax; Secure`;
        }
    }
}

async function startCheckoutGateway(
    gatewayUrl: string,
    bridgeAttemptId: string,
    checkoutMode: "guest" | "auth"
): Promise<void> {
    console.log("[WooCommerceBridge]", {
        event: "checkout_handoff_started",
        bridgeAttemptId,
        checkoutMode,
    });

    const response = await fetch(gatewayUrl, {
        method: "GET",
        credentials: "same-origin",
        redirect: "manual",
        cache: "no-store",
    });

    // Opaque redirect: the browser received a 3xx but won't expose status/headers
    // to JavaScript. The gateway successfully added cart items and issued a redirect
    // to /betalning — treat this as success and navigate manually.
    if (response.type === "opaqueredirect") {
        const gUrl = new URL(gatewayUrl, window.location.origin);
        const deliveryNote = gUrl.searchParams.get("delivery_note");
        const discountParam = gUrl.searchParams.get("discount");
        const redirectParams = new URLSearchParams();
        if (deliveryNote) {
            redirectParams.set("delivery_note", deliveryNote);
        }
        if (discountParam) {
            redirectParams.set("discount", discountParam);
        }
        const redirectTarget = redirectParams.toString()
            ? `/betalning?${redirectParams.toString()}`
            : "/betalning";

        primeCheckoutCookiesFromGatewayUrl(gatewayUrl);

        console.log("[WooCommerceBridge]", {
            event: "checkout_handoff_opaque_redirect",
            bridgeAttemptId,
            checkoutMode,
            redirectTarget,
        });
        window.location.href = redirectTarget;
        return;
    }

    if (response.status >= 300 && response.status < 400) {
        const redirectUrl = response.headers.get("Location");

        if (!redirectUrl) {
            throw new Error("Övergången till betalning saknar giltig omdirigering.");
        }

        primeCheckoutCookiesFromGatewayUrl(gatewayUrl);

        console.log("[WooCommerceBridge]", {
            event: "checkout_handoff_redirect_ready",
            bridgeAttemptId,
            checkoutMode,
            redirectUrl,
        });
        window.location.href = redirectUrl;
        return;
    }

    let payload: CheckoutGatewayErrorPayload = {};

    try {
        payload = await response.json() as CheckoutGatewayErrorPayload;
    } catch {
        payload = {};
    }

    console.error("[WooCommerceBridge]", {
        event: "checkout_handoff_failed",
        bridgeAttemptId,
        checkoutMode,
        status: response.status,
        errorCode: payload.error_code || "unknown_gateway_error",
        serverAttemptId: payload.bridge_attempt_id || null,
        message: payload.error || "Övergången till betalning misslyckades innan betalningen kunde startas.",
    });

    throw new Error(payload.error || "Övergången till betalning misslyckades innan betalningen kunde startas.");
}

/**
 * Lägg till alla produkter i WooCommerce-varukorgen via server-side gateway
 * och redirecta till checkout
 * 
 * Använder /.netlify/functions/wc-add-to-cart som:
 * 1. Lägger till produkter server-side mot WordPress
 * 2. Fångar WooCommerce session-cookies
 * 3. Sätter cookies på användarens browser
 * 4. Redirectar till WooCommerce final checkout under /betalning
 */
function calculateMultiBuyDiscount(items: CartItem[]): number {
    let discount = 0;
    for (const item of items) {
        if (item.price != null && item.lineTotal != null && item.quantity > 0) {
            const fullPrice = item.price * item.quantity;
            if (fullPrice > item.lineTotal + 0.001) {
                discount += fullPrice - item.lineTotal;
            }
        }
    }
    return Math.round(discount * 100) / 100;
}

export async function addItemsAndRedirectToCheckout(
    items: CartItem[],
    clearLocalCart?: () => void,
    deliveryNote?: string
): Promise<void> {
    const invalidItems = getInvalidCheckoutItems(items);

    if (invalidItems.length > 0) {
        throw new Error("[WooCommerce] Checkout blocked: one or more cart lines are missing woocommerce_id");
    }

    const validItems = items.filter(item => item.woocommerce_id);

    if (validItems.length === 0) {
        console.warn('[WooCommerce] Inga produkter har woocommerce_id – visar checkout-sida');
        return;
    }

    console.log(`[WooCommerce] Lägger till ${validItems.length} produkter via gateway...`);
    const bridgeAttemptId = createBridgeAttemptId("guest");

    // Build items parameter: ID:QTY,ID:QTY,...
    const itemsParam = validItems
        .map(item => `${item.woocommerce_id}:${item.quantity}`)
        .join(',');

    // Calculate multiköp discount to pass to the gateway
    const discount = calculateMultiBuyDiscount(validItems);
    console.log(`[WooCommerce] Multiköp discount: ${discount} kr`, validItems.map(i => ({ name: i.name, price: i.price, qty: i.quantity, lineTotal: i.lineTotal })));

    // Build gateway URL
    let gatewayUrl = `/.netlify/functions/wc-add-to-cart?items=${encodeURIComponent(itemsParam)}`;
    if (deliveryNote) {
        gatewayUrl += `&delivery_note=${encodeURIComponent(deliveryNote)}`;
    }
    if (discount > 0) {
        gatewayUrl += `&discount=${encodeURIComponent(discount.toFixed(2))}`;
    }
    gatewayUrl += `&bridge_attempt_id=${encodeURIComponent(bridgeAttemptId)}`;

    await startCheckoutGateway(gatewayUrl, bridgeAttemptId, "guest");
}

/**
 * Autentiserad utcheckning som loggar in kunden i WordPress bakom kulisserna.
 * Om detta misslyckas faller vi tillbaka på gäst-checkout.
 */
export async function authenticateAndCheckout(
    items: CartItem[],
    token: string,
    clearLocalCart?: () => void,
    deliveryNote?: string
): Promise<void> {
    const invalidItems = getInvalidCheckoutItems(items);

    if (invalidItems.length > 0) {
        throw new Error("[WooCommerce] Checkout blocked: one or more cart lines are missing woocommerce_id");
    }

    const validItems = items.filter(item => item.woocommerce_id);

    if (validItems.length === 0) {
        console.warn('[WooCommerce] Inga produkter har woocommerce_id – visar checkout-sida');
        return;
    }

    console.log(`[WooCommerce] Autentiserar och lägger till ${validItems.length} produkter via checkout session...`);
    const bridgeAttemptId = createBridgeAttemptId("auth");

    // We will construct a GET request with query params for the Netlify function
    const itemsParam = validItems.map(item => `${item.woocommerce_id}:${item.quantity}`).join(',');

    // Calculate multiköp discount
    const discount = calculateMultiBuyDiscount(validItems);

    const params = new URLSearchParams();
    params.set('items', itemsParam);
    params.set('token', token);
    if (deliveryNote) params.set('delivery_note', deliveryNote);
    if (discount > 0) params.set('discount', discount.toFixed(2));
    params.set('bridge_attempt_id', bridgeAttemptId);

    const gatewayUrl = `/.netlify/functions/checkout-session?${params.toString()}`;

    console.log("[WooCommerceBridge]", {
        event: "authenticated_checkout_gateway_ready",
        bridgeAttemptId,
    });

    await startCheckoutGateway(gatewayUrl, bridgeAttemptId, "auth");
}
