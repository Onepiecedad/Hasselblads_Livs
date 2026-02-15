<?php
/**
 * Hasselblads Livs – Delivery Note Pre-fill
 *
 * Läser delivery_note från URL-parameter och fyller i
 * WooCommerce "Orderanteckningar"-fältet (#order_comments).
 *
 * Lägg till via: WordPress Admin → Code Snippets plugin
 * eller i temat: functions.php
 */
add_action('wp_footer', function () {
    if (!is_checkout()) return;
    ?>
    <script>
    (function() {
        var params = new URLSearchParams(window.location.search);
        var note = params.get('delivery_note');
        if (note) {
            var field = document.getElementById('order_comments');
            if (field) {
                field.value = decodeURIComponent(note);
                field.dispatchEvent(new Event('change', { bubbles: true }));
                // Expand the notes section if it's collapsed
                var toggle = document.querySelector('.woocommerce-additional-fields__field-wrapper');
                if (toggle) toggle.style.display = 'block';
            }
        }
    })();
    </script>
    <?php
});
