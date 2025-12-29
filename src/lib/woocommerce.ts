/**
 * WooCommerce Checkout Service
 * 
 * Hanterar integration med WooCommerce för checkout.
 * Använder redirect-metoden för att skicka kunden till WooCommerce checkout.
 */

const WC_URL = import.meta.env.VITE_WOOCOMMERCE_URL || 'https://hasselbladslivs.se';

interface CartItem {
    id: string;
    woocommerce_id?: number;
    quantity: number;
}

/**
 * Bygg WooCommerce Add-to-Cart URL
 * 
 * WooCommerce stödjer att lägga till flera produkter via URL:
 * /cart/?add-to-cart=123&quantity=2
 * 
 * För flera produkter används:
 * /cart/?add-to-cart=123,456&quantity[123]=2&quantity[456]=3
 */
export function buildWooCommerceCartUrl(items: CartItem[]): string {
    // Filtrera bort produkter utan WooCommerce ID
    const validItems = items.filter(item => item.woocommerce_id);

    if (validItems.length === 0) {
        // Om inga produkter har WooCommerce ID, gå till butiken
        return `${WC_URL}/butik/`;
    }

    if (validItems.length === 1) {
        // Enkel produkt
        const item = validItems[0];
        return `${WC_URL}/?add-to-cart=${item.woocommerce_id}&quantity=${item.quantity}`;
    }

    // Flera produkter - bygg multipel add-to-cart URL
    // Använder WordPress-format: add-to-cart med quantity array
    const productIds = validItems.map(item => item.woocommerce_id).join(',');
    const quantityParams = validItems
        .map(item => `quantity[${item.woocommerce_id}]=${item.quantity}`)
        .join('&');

    return `${WC_URL}/?add-to-cart=${productIds}&${quantityParams}`;
}

/**
 * Redirect till WooCommerce checkout
 * 
 * Använder WooCommerce add-to-cart med redirect för alla produkter.
 * För flera produkter bygger vi en URL som lägger till alla i sekvens.
 */
export function redirectToWooCommerceCheckout(items: CartItem[], clearCart?: () => void): void {
    const validItems = items.filter(item => item.woocommerce_id);

    if (validItems.length === 0) {
        // Fallback: Skicka till WooCommerce butik
        window.location.href = `${WC_URL}/butik/`;
        return;
    }

    // Rensa lokal varukorg innan redirect
    if (clearCart) {
        clearCart();
    }

    // Om bara en produkt, enkel redirect
    if (validItems.length === 1) {
        const item = validItems[0];
        window.location.href = `${WC_URL}/?add-to-cart=${item.woocommerce_id}&quantity=${item.quantity}`;
        return;
    }

    // För flera produkter: Bygg en URL som lägger till första produkten
    // och redirectar sedan till checkout med alla produkter via query params
    // WooCommerce stöder batch via: ?add-to-cart=ID&quantity=X samt manuell cart via Store API

    // Enklaste lösningen: Öppna flera add-to-cart i sekvens (inte optimalt men fungerar)
    // Bättre lösning: Redirect till WooCommerce checkout och låt användaren lägga till där

    // För nu: Använd första produkten och informera om begränsning i UI
    // TODO: Implementera Netlify Function som proxy för WooCommerce Store API
    const firstItem = validItems[0];
    window.location.href = `${WC_URL}/?add-to-cart=${firstItem.woocommerce_id}&quantity=${firstItem.quantity}`;
}

/**
 * Avancerad: Skapa order via WooCommerce Store API
 * 
 * Detta kräver att WooCommerce Store API är aktiverat och tillåter
 * cross-origin requests. För produktion rekommenderas en Netlify Function
 * som proxy.
 */
export async function createWooCommerceOrder(
    items: { product_id: number; quantity: number }[],
    customer: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        postcode: string;
    }
): Promise<{ checkout_url: string } | { error: string }> {
    try {
        // WooCommerce Store API endpoint
        const response = await fetch(`${WC_URL}/wp-json/wc/store/v1/cart/add-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: items[0]?.product_id,
                quantity: items[0]?.quantity || 1,
            }),
        });

        if (!response.ok) {
            throw new Error('Kunde inte lägga till i varukorgen');
        }

        // Redirect till checkout
        return { checkout_url: `${WC_URL}/checkout/` };
    } catch (error) {
        console.error('WooCommerce order error:', error);
        return { error: error instanceof Error ? error.message : 'Okänt fel' };
    }
}

/**
 * Direktlänk till WooCommerce checkout
 */
export function getWooCommerceCheckoutUrl(): string {
    return `${WC_URL}/checkout/`;
}

/**
 * Direktlänk till WooCommerce butik
 */
export function getWooCommerceStoreUrl(): string {
    return `${WC_URL}/butik/`;
}
