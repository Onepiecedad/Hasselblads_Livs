<?php
/**
 * Multiköps-rabatt via cookie (target-total approach)
 *
 * The React frontend calculates the customer's expected total
 * (after multiköp deals) and passes it as a cookie. This snippet
 * compares that target against WooCommerce's actual cart subtotal
 * and applies the difference as a negative fee (discount).
 *
 * This avoids price-mismatch issues between PIM and WooCommerce.
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

    // Get the actual WooCommerce cart subtotal (excl. fees, incl. tax)
    $subtotal = floatval($cart->get_subtotal()) + floatval($cart->get_subtotal_tax());

    $discount = $subtotal - $target;

    if ($discount > 0.01) {
        $cart->add_fee('Multiköps-rabatt', -$discount, false);
    }
});
