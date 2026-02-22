<?php
/**
 * Hasselblads Livs – Checkout Modifier
 *
 * 1. Läser delivery_note från URL-parameter och fyller i
 *    WooCommerce "Orderanteckningar"-fältet (#order_comments).
 * 2. Tömmer alltid fältet för e-postadress (#billing_email) när
 *    kassan laddas (även om användaren är inloggad).
 * 3. Tvingar "Hämta i butik" (local_pickup) som standardval 
 *    för frakt om det finns tillgängligt.
 * 4. Döljer navigationsmenyn på kassasidan för ett renare utseende.
 *
 * Lägg till via: WordPress Admin → Code Snippets plugin
 * eller i temat: functions.php
 */

// Del 1: JavaScript för orderanteckning och tömning av e-postfältet
add_action('wp_footer', function () {
    if (!is_checkout())
        return;
    ?>
    <script>
        document.addEventListener("DOMContentLoaded", functio n () {
            // ----- Orderanteckningar prefill -----
            var params = new URLSearchParams(window.location.search);
            var note = params.get('delivery_note');
            if (note) {
                var field = document.getElementById('order_comments');
                if (field) {
                    field.value = decodeURIComponent(note);
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                    // Expandera notes-sektionen om den är kollapsad
                    var toggle = document.querySelector('.woocommerce-additional-fields__field-wrapper');
                    if (toggle) toggle.style.display = 'block';
                }
            }

            // ----- Töm e-postfältet -----
            // Vi använder en liten timeout för att låta autocompletes / pre-fills köra klart först
            setTimeout(functi on () {
                var emailField = document.getElementById('billing_email');
                if (emailField) {
                    emailField.value = '';
                    emailField.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, 300);
        });
    </script>
    <?php
});

// Del 2: Tvinga 'Hämta i butik' (local_pickup) som förvalt fraktalternativ
add_filter('woocommerce_shipping_packages', function ($packages) {
    // Endast i kassan och om det finns paket
    if (is_admin() || !is_checkout() || empty($packages)) {
        return $packages;
    }

    $package = $packages[0];

    // Om inga fraktalternativ är tillgängliga, avbryt
    if (empty($package['rates'])) {
        return $packages;
    }

    $local_pickup_rate_id = '';

    // Leta efter 'local_pickup' bland de tillgängliga alternativen
    foreach ($package['rates'] as $rate_id => $rate) {
        // Kontrollera om metoden är local_pickup
        if ('local_pickup' === $rate->method_id) {
            $local_pickup_rate_id = $rate_id;
            break;
        }
    }

    // Om vi hittade Hämta i butik, sätt det som förvalt val för det här paketet
    if (!empty($local_pickup_rate_id)) {
        // Töm tidigare val session sessions
        WC()->session->set('chosen_shipping_methods', array($local_pickup_rate_id));
    }

    return $packages;
}, 100);

// Del 3: Dölj navigationsmenyn på kassasidan (Flatsome Theme)
add_action('wp_head', function () {
    if (is_checkout() && !is_order_received_page()) {
        echo '<style>
            /* Dölj huvudmenyn i header */
            .header-nav,
            .header-bottom,
            .header-main .nav,
            .header-main .nav-center,
            .header-main .nav-right,
            .header-main .flex-col.hide-for-medium {
                display: none !important;
            }
        </style>';
    }
});
