/**
* Hide navigation menu on WooCommerce checkout page
*
* Removes the Flatsome theme navigation links (Webbutik, Hemleverans, Utvalt, Butiken)
* and all header icons EXCEPT the cart icon on the checkout page.
*
* Add this to: WordPress → Appearance → Customize → Additional CSS
* Or paste the CSS portion into Flatsome → Advanced → Custom CSS
*/

/* ── CSS to add in WordPress Customizer → Additional CSS ── */

/* Hide the main navigation links on checkout */
.woocommerce-checkout .header-nav.nav-center {
display: none !important;
}

/* Hide all icons in the right nav EXCEPT the cart */
.woocommerce-checkout .header-nav.nav-right > li:not(.cart-item) {
display: none !important;
}

/* Also hide on mobile checkout */
.woocommerce-checkout .mobile-nav {
display: none !important;
}

/* Hide the mobile menu toggle (hamburger) on checkout */
.woocommerce-checkout .nav-icon.has-icon {
display: none !important;
}