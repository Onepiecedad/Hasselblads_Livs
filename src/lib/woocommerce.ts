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
    woocommerce_id?: number;
    quantity: number;
}

/**
 * Lägg till alla produkter i WooCommerce-varukorgen via server-side gateway
 * och redirecta till checkout
 * 
 * Använder /.netlify/functions/wc-add-to-cart som:
 * 1. Lägger till produkter server-side mot WordPress
 * 2. Fångar WooCommerce session-cookies
 * 3. Sätter cookies på användarens browser
 * 4. Redirectar till /kassa
 */
export async function addItemsAndRedirectToCheckout(
    items: CartItem[],
    clearLocalCart?: () => void,
    deliveryNote?: string
): Promise<void> {
    const validItems = items.filter(item => item.woocommerce_id);

    if (validItems.length === 0) {
        console.warn('[WooCommerce] Inga produkter har woocommerce_id – visar checkout-sida');
        // Let Checkout.tsx handle the missing_ids state with helpful UI
        return;
    }

    console.log(`[WooCommerce] Lägger till ${validItems.length} produkter via gateway...`);

    // Build items parameter: ID:QTY,ID:QTY,...
    const itemsParam = validItems
        .map(item => `${item.woocommerce_id}:${item.quantity}`)
        .join(',');

    // Build gateway URL
    let gatewayUrl = `/.netlify/functions/wc-add-to-cart?items=${encodeURIComponent(itemsParam)}`;
    if (deliveryNote) {
        gatewayUrl += `&delivery_note=${encodeURIComponent(deliveryNote)}`;
    }

    if (clearLocalCart) clearLocalCart();

    // Redirect to the gateway function which will:
    // 1. Add items to WooCommerce cart server-side
    // 2. Set WC session cookies on the user's browser
    // 3. Redirect to /kassa
    window.location.href = gatewayUrl;
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
    const validItems = items.filter(item => item.woocommerce_id);

    if (validItems.length === 0) {
        console.warn('[WooCommerce] Inga produkter har woocommerce_id – visar checkout-sida');
        return;
    }

    console.log(`[WooCommerce] Autentiserar och lägger till ${validItems.length} produkter via checkout session...`);

    // We will construct a GET request with query params for the Netlify function
    const itemsParam = validItems.map(item => `${item.woocommerce_id}:${item.quantity}`).join(',');

    const params = new URLSearchParams();
    params.set('items', itemsParam);
    params.set('token', token);
    if (deliveryNote) params.set('delivery_note', deliveryNote);

    const gatewayUrl = `/.netlify/functions/checkout-session?${params.toString()}`;

    // Local cart is cleared when we successfully leave the site
    if (clearLocalCart) {
        clearLocalCart();
    }

    console.log(`[WooCommerce] Redirecting to authenticated checkout gateway: ${gatewayUrl}`);

    // Redirect directly to the checkout-session endpoint
    // This causes a top-level navigation, where the serverless function acts as
    // a gateway, sets the cookies directly in the browser, and then 302 redirects to /kassa.
    window.location.href = gatewayUrl;
}
