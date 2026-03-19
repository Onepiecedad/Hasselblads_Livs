<?php
/**
 * Multiköps-rabatt via cookie (target-total approach).
 *
 * React skickar target-totalpriset (inkl. moms) via cookie hbl_multibuy_target.
 * PHP beräknar ex-moms rabatt och sätter taxable=true så WooCommerce visar rätt belopp.
 *
 * Varför ex-moms + taxable: WooCommerce behandlar add_fee-belopp som exklusive moms.
 * Om vi skickar 6.80 (inkl. moms) med taxable=false, visar WC det som 6.80*1.12=7.62.
 * Genom att beräkna ex-moms-delen och sätta taxable=true, lägger WC tillbaka momsen
 * korrekt och slutpriset stämmer.
 */
add_action('woocommerce_cart_calculate_fees', function ($cart) {
    if (is_admin() && !defined('DOING_AJAX') && !defined('REST_REQUEST')) {
        return;
    }

    $target = isset($_COOKIE['hbl_multibuy_target'])
        ? floatval($_COOKIE['hbl_multibuy_target'])
        : 0;

    if ($target < 0.01) {
        return;
    }

    // Calculate ex-tax and tax totals from cart items
    $subtotal_ex  = 0;
    $subtotal_tax = 0;
    foreach ($cart->get_cart() as $item) {
        $subtotal_ex  += floatval($item['line_subtotal']);
        $subtotal_tax += floatval($item['line_subtotal_tax']);
    }
    $subtotal_inc = $subtotal_ex + $subtotal_tax;

    // Inc-tax discount (what we want to reduce the total by)
    $discount_inc = $subtotal_inc - $target;
    if ($discount_inc < 0.01) {
        return;
    }

    // Convert to ex-tax discount proportionally (avoids hard-coding tax rate)
    $ratio = ($subtotal_inc > 0) ? ($subtotal_ex / $subtotal_inc) : 1;
    $discount_ex = round($discount_inc * $ratio, 2);

    // taxable=true → WooCommerce adds tax back, display ≈ discount_inc
    $cart->add_fee('Multikops-rabatt', -$discount_ex, true);
});
