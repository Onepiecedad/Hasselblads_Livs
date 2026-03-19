<?php
/**
 * Multiköps-rabatt via cookie (target-total approach)
 *
 * The React frontend calculates the customer's expected total
 * (after multiköp deals) and passes it as a cookie. This snippet
 * computes the actual WooCommerce cart subtotal from individual
 * cart items (reliable at this hook point) and applies the
 * difference as a negative fee.
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

    // Compute subtotal from individual cart items
    // (cart->get_subtotal() is NOT reliable at this hook point)
    $subtotal = 0;
    foreach ($cart->get_cart() as $item) {
        $subtotal += floatval($item['line_subtotal']) + floatval($item['line_subtotal_tax']);
    }

    $discount = $subtotal - $target;

    if ($discount > 0.01) {
        $cart->add_fee('Multikops-rabatt', -$discount, false);
    }
});
