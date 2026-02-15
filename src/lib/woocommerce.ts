/**
 * WooCommerce Checkout Service
 * 
 * Hanterar integration med WooCommerce för checkout.
 * Använder WooCommerce Store API för att lägga produkter i varukorgen
 * och sedan redirecta till /kassa.
 * 
 * Alla API-anrop går via Netlify proxy (netlify.toml → wordpress-proxy.ts)
 * för att undvika CORS-problem.
 */

// Use relative URLs → routes through Netlify proxy (avoids CORS)
// In production: /wp-json/* → netlify proxy → WordPress backend
// Fallback to direct URL only if explicitly set
const WC_URL = import.meta.env.VITE_WOOCOMMERCE_URL || '';

interface CartItem {
    id: string;
    woocommerce_id?: number;
    quantity: number;
}

/**
 * Lägg till en produkt i WooCommerce-varukorgen via Store API
 * 
 * WooCommerce Store API kräver att vi inkluderar credentials
 * för att behålla session/cookies.
 */
async function addToWooCommerceCart(productId: number, quantity: number): Promise<boolean> {
    try {
        const response = await fetch(`${WC_URL}/wp-json/wc/store/v1/cart/add-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Viktig: Behå session cookies
            body: JSON.stringify({
                id: productId,
                quantity: quantity,
            }),
        });

        if (!response.ok) {
            console.warn(`[WooCommerce] Kunde inte lägga till produkt ${productId}:`, response.statusText);
            return false;
        }

        console.log(`[WooCommerce] ✅ Lade till produkt ${productId} i varukorgen`);
        return true;
    } catch (error) {
        console.error('[WooCommerce] API-fel:', error);
        return false;
    }
}

/**
 * Lägg till alla produkter i WooCommerce-varukorgen via Store API
 * och redirecta till checkout
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

    console.log(`[WooCommerce] Lägger till ${validItems.length} produkter via Store API...`);

    // Försök lägga till via Store API
    let successCount = 0;
    for (const item of validItems) {
        if (item.woocommerce_id) {
            const success = await addToWooCommerceCart(item.woocommerce_id, item.quantity);
            if (success) successCount++;
        }
    }

    // Build query string for delivery note
    const noteParam = deliveryNote
        ? `?delivery_note=${encodeURIComponent(deliveryNote)}`
        : '';

    // Om Store API lyckades med minst en produkt, rensa lokal varukorg och redirecta
    if (successCount > 0) {
        console.log(`[WooCommerce] ✅ ${successCount}/${validItems.length} produkter tillagda via API`);
        if (clearLocalCart) clearLocalCart();
        // Redirect to WooCommerce checkout via proxy
        window.location.href = `${WC_URL || 'https://hasselbladslivs.se'}/kassa${noteParam}`;
        return;
    }

    // Fallback: Om Store API inte fungerar, använd URL-metoden via /varukorg/
    console.warn('[WooCommerce] Store API fungerade inte, använder URL-fallback via /varukorg/...');
    if (clearLocalCart) clearLocalCart();

    // Fallback: redirect to WooCommerce directly with add-to-cart params
    const firstItem = validItems[0];
    const fallbackUrl = WC_URL || 'https://hasselbladslivs.se';
    const noteQuery = deliveryNote
        ? `&delivery_note=${encodeURIComponent(deliveryNote)}`
        : '';
    window.location.href = `${fallbackUrl}/varukorg/?add-to-cart=${firstItem.woocommerce_id}&quantity=${firstItem.quantity}${noteQuery}`;
}

/**
 * Bygg WooCommerce Add-to-Cart URL (legacy, för fallback)
 * 
 * Bygger en URL som lägger till produkter via query params.
 * Notera: Detta lägger produkten i varukorgen men visar startsidan.
 */
export function buildWooCommerceCartUrl(items: CartItem[]): string {
    const validItems = items.filter(item => item.woocommerce_id);

    if (validItems.length === 0) {
        return `${WC_URL}/kassa`;
    }

    if (validItems.length === 1) {
        const item = validItems[0];
        return `${WC_URL}/?add-to-cart=${item.woocommerce_id}&quantity=${item.quantity}`;
    }

    // Flera produkter
    const productIds = validItems.map(item => item.woocommerce_id).join(',');
    const quantityParams = validItems
        .map(item => `quantity[${item.woocommerce_id}]=${item.quantity}`)
        .join('&');

    return `${WC_URL}/?add-to-cart=${productIds}&${quantityParams}`;
}

/**
 * Redirect till WooCommerce checkout (legacy)
 * 
 * @deprecated Använd addItemsAndRedirectToCheckout istället
 */
export function redirectToWooCommerceCheckout(items: CartItem[], clearCart?: () => void): void {
    const validItems = items.filter(item => item.woocommerce_id);

    if (validItems.length === 0) {
        console.warn('[WooCommerce] Produkter saknar woocommerce_id');
        window.location.href = `${WC_URL}/kassa`;
        return;
    }

    if (clearCart) clearCart();
    window.location.href = buildWooCommerceCartUrl(validItems);
}

/**
 * Direktlänk till WooCommerce checkout
 */
export function getWooCommerceCheckoutUrl(): string {
    return `${WC_URL}/kassa`;
}

/**
 * Direktlänk till WooCommerce butik
 */
export function getWooCommerceStoreUrl(): string {
    return `${WC_URL}/webbutik`;
}
