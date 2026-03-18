<?php
/**
 * Hasselblads Livs – Multiköps-rabatt via avgift
 *
 * Läser cookien "hbl_multibuy_discount" som sätts av Netlify gateway
 * vid checkout-handoff. Om den innehåller ett positivt belopp (t.ex. "0.80")
 * läggs en negativ avgift ("Multiköps-rabatt") till på varukorgen.
 *
 * Cookien rensar sig själv efter att ordern lagts (session-cookie utan max-age,
 * eller med kort max-age satt av gatewayen).
 *
 * Lägg till via: WordPress Admin → Code Snippets plugin
 */

add_action('woocommerce_cart_calculate_fees', function ($cart) {
    if (is_admin() && !defined('DOING_AJAX')) {
        return;
    }

    $discount = isset($_COOKIE['hbl_multibuy_discount'])
        ? floatval($_COOKIE['hbl_multibuy_discount'])
        : 0;

    if ($discount > 0.001) {
        // Negativ avgift = rabatt
        $cart->add_fee('Multiköps-rabatt', -$discount, true);
    }
});
