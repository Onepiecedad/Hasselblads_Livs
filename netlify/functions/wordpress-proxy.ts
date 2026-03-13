import type { Context, Config } from "@netlify/functions";
import https from "node:https";
import { matchDeliveryAddress } from "../../src/lib/deliveryAreas";

/**
 * WordPress/WooCommerce API Proxy Function
 * 
 * Proxies requests to the WordPress backend at Pressable.
 * Uses rejectUnauthorized: false to bypass SSL certificate mismatch.
 */

const WORDPRESS_BACKEND_IP = process.env.WORDPRESS_BACKEND_IP || "199.16.172.188";
const WORDPRESS_HOST = process.env.WORDPRESS_HOST || "hasselbladslivs.se";

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = part.trim().split("=");
    if (rawName === name) {
      const rawValue = rawValueParts.join("=");
      try {
        return decodeURIComponent(rawValue);
      } catch {
        return rawValue;
      }
    }
  }

  return null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default async (request: Request, context: Context): Promise<Response> => {
  // Handle CORS preflight (OPTIONS) requests for Store API custom headers
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Nonce, Cart-Token, X-WP-Nonce, X-WC-Store-API-Nonce, X-HTTP-Method-Override, Authorization, Cookie",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const url = new URL(request.url);

  // Extract the actual WordPress path from the redirect
  // The path comes in as /.netlify/functions/wordpress-proxy/wp-json/...
  const wpPathMatch = url.pathname.match(/\/.netlify\/functions\/wordpress-proxy(\/.*)/);
  let targetPath = wpPathMatch ? wpPathMatch[1] : url.pathname;

  // Path alias map: Netlify-facing paths → WordPress-facing paths.
  // Netlify functions receive the ORIGINAL request URL (before _redirects rewriting),
  // so /betalning arrives as-is but WordPress's checkout page slug is /kassan/.
  const PATH_ALIASES: Record<string, string> = {
    "/betalning": "/kassan",
  };
  const aliasMatch = Object.keys(PATH_ALIASES).find(alias =>
    targetPath === alias || targetPath.startsWith(alias + "/")
  );
  if (aliasMatch) {
    targetPath = targetPath.replace(aliasMatch, PATH_ALIASES[aliasMatch]);
  }

  // Build headers
  const headers: Record<string, string> = {
    "Host": WORDPRESS_HOST,
    "X-Forwarded-Host": WORDPRESS_HOST,
    "X-Forwarded-Proto": "https",
    "X-Forwarded-For": request.headers.get("x-forwarded-for") || request.headers.get("x-nf-client-connection-ip") || "127.0.0.1",
  };

  // Forward User-Agent (critical: Pressable blocks requests without it)
  const userAgent = request.headers.get("user-agent");
  headers["User-Agent"] = userAgent || "Mozilla/5.0 (compatible; HasselbladsProxy/1.0)";

  // Forward Accept headers
  const accept = request.headers.get("accept");
  if (accept) headers["Accept"] = accept;
  const acceptLang = request.headers.get("accept-language");
  if (acceptLang) headers["Accept-Language"] = acceptLang;

  // Forward content-type
  const contentType = request.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  // Forward cookies (critical for WooCommerce sessions)
  const cookies = request.headers.get("cookie");
  if (cookies) headers["Cookie"] = cookies;

  // Forward authorization headers
  const auth = request.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;

  const mcpKey = request.headers.get("x-mcp-api-key");
  if (mcpKey) headers["X-MCP-API-Key"] = mcpKey;

  // Forward WooCommerce Store API nonce
  const nonce = request.headers.get("nonce");
  if (nonce) headers["Nonce"] = nonce;
  const cartToken = request.headers.get("cart-token");
  if (cartToken) headers["Cart-Token"] = cartToken;

  // Forward X-WP-Nonce (WordPress REST API session nonce — critical for authenticated requests)
  const wpNonce = request.headers.get("x-wp-nonce");
  if (wpNonce) headers["X-WP-Nonce"] = wpNonce;

  // Forward X-WC-Store-API-Nonce (WooCommerce Store API specific nonce)
  const wcStoreNonce = request.headers.get("x-wc-store-api-nonce");
  if (wcStoreNonce) headers["X-WC-Store-API-Nonce"] = wcStoreNonce;

  // Forward X-HTTP-Method-Override (used by WC Blocks for PUT/PATCH via POST)
  const methodOverride = request.headers.get("x-http-method-override");
  if (methodOverride) headers["X-HTTP-Method-Override"] = methodOverride;

  // Forward all Stripe headers (critical for Stripe webhooks, e.g., Stripe-Signature)
  for (const [key, value] of request.headers.entries()) {
    if (key.toLowerCase().startsWith("stripe-")) {
      headers[key] = value;
    }
  }

  // Get request body for non-GET requests
  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      body = await request.text();
    } catch {
      body = undefined;
    }
  }

  // Server-side fix: For checkout POST requests, ensure the shipping address
  // passes the WooCommerce delivery zone validation plugin.
  // The plugin requires the shipping address to be one of the approved streets.
  // Pickup orders get a spoofed valid street, and delivery orders get their
  // address_1 normalized to the same canonical street match React accepts.
  const isCheckoutPost = request.method === "POST" && targetPath.includes("/wc/store/v1/checkout");
  if (isCheckoutPost && body) {
    try {
      const checkoutData = JSON.parse(body);
      const shippingAddr = checkoutData?.shipping_address;
      if (shippingAddr) {
        // Detect pickup order: first_name contains "Hämta" or address is placeholder.
        const isPickupOrder = (
          shippingAddr.first_name?.includes("Hämta") ||
          shippingAddr.address_1 === "Hasselblads Livs" ||
          shippingAddr.address_1 === "Hämtas i butik" ||
          shippingAddr.address_1 === "Frejagatan 9"
        );

        if (isPickupOrder) {
          // Replace with a valid street from the delivery zone whitelist.
          checkoutData.shipping_address = {
            ...shippingAddr,
            first_name: "Hämta",
            last_name: "I butik",
            address_1: "Blomstervägen 1",
            city: "Kullavik",
            postcode: "42943",
            country: "SE",
          };
          body = JSON.stringify(checkoutData);
        } else if (typeof shippingAddr.address_1 === "string") {
          const streetMatch = matchDeliveryAddress(shippingAddr.address_1);
          if (streetMatch && shippingAddr.address_1 !== streetMatch.street) {
            checkoutData.shipping_address = {
              ...shippingAddr,
              // Use the canonical approved street name that WooCommerce validates against.
              address_1: streetMatch.street,
            };
            body = JSON.stringify(checkoutData);
          }
        }
      }
    } catch {
      // If JSON parse fails, leave body unchanged
    }
  }

  return new Promise((resolve) => {
    const options: https.RequestOptions = {
      hostname: WORDPRESS_BACKEND_IP,
      port: 443,
      path: targetPath + url.search,
      method: request.method,
      headers: headers,
      rejectUnauthorized: false, // Skip SSL verification for Pressable's mismatched cert
    };

    const proxyReq = https.request(options, (proxyRes) => {
      // Clear the timeout once we start receiving a response
      proxyReq.setTimeout(0);
      const chunks: Buffer[] = [];
      proxyRes.on("data", (chunk: Buffer) => chunks.push(chunk));
      proxyRes.on("end", () => {
        const responseBuffer = Buffer.concat(chunks);

        // Use Headers object to properly handle multi-value headers (Set-Cookie)
        const responseHeaders = new Headers();

        // Collect Set-Cookie headers separately — they MUST NOT be comma-joined
        const setCookies: string[] = [];

        for (const [key, value] of Object.entries(proxyRes.headers)) {
          if (!value) continue;
          const lowerKey = key.toLowerCase();

          // Skip problematic headers
          if (lowerKey === "transfer-encoding" || lowerKey === "connection") continue;

          if (lowerKey === "set-cookie") {
            // Set-Cookie must be appended individually
            const cookies = Array.isArray(value) ? value : [value];
            for (const cookie of cookies) {
              // Fix domain in cookies to match the proxy domain
              const fixedCookie = cookie.replace(
                /domain=[^;]*/gi,
                `domain=hasselbladslivs.se`
              );
              setCookies.push(fixedCookie);
            }
          } else if (Array.isArray(value)) {
            responseHeaders.set(key, value.join(", "));
          } else if (typeof value === "string") {
            // Rewrite Location headers to prevent redirect loops:
            // WordPress redirects to /kassan/ or /kassa/ but Netlify's
            // external-facing path is /betalning/. Without this rewrite,
            // WP → /kassan/ → Netlify 301 → /betalning/ → proxy → /kassan/ → loop
            if (lowerKey === "location") {
              let location = value;
              // Strip absolute WordPress URLs to relative paths
              location = location.replace(/^https?:\/\/hasselbladslivs\.se/, "");
              // Rewrite /kassan/ and /kassa/ paths to /betalning/
              location = location.replace(/^\/(kassan|kassa)(\/|$)/, "/betalning$2");
              responseHeaders.set(key, location);
            } else {
              responseHeaders.set(key, value);
            }
          }
        }

        // Append each Set-Cookie individually (critical for browser parsing)
        for (const cookie of setCookies) {
          responseHeaders.append("Set-Cookie", cookie);
        }

        // Expose Store API headers to the browser (nonce, cart-token)
        responseHeaders.set("access-control-expose-headers", "Nonce, Cart-Token, X-WC-Store-API-Nonce, X-WP-Nonce");
        // CORS: allow the frontend origin
        responseHeaders.set("access-control-allow-origin", request.headers.get("origin") || "*");
        responseHeaders.set("access-control-allow-credentials", "true");
        responseHeaders.set("access-control-allow-headers", "Content-Type, Nonce, Cart-Token, X-WP-Nonce, X-WC-Store-API-Nonce, X-HTTP-Method-Override, Authorization, Cookie");

        // Cache static assets from WordPress (images, fonts, CSS/JS bundles)
        const isStaticAsset = /^\/wp-content\/.+\.(js|css|woff2?|ttf|eot|svg|png|jpe?g|gif|webp|ico)$/i.test(targetPath);
        if (isStaticAsset && !responseHeaders.has("cache-control")) {
          responseHeaders.set("cache-control", "public, max-age=31536000, immutable");
        }

        // Check if this is a binary response (images, fonts, etc.)
        const contentType = proxyRes.headers["content-type"] || "";
        const isBinary = /^(image|audio|video|font|application\/octet-stream|application\/pdf|application\/zip)/i.test(contentType);

        if (isBinary) {
          // Return binary data as-is (as Uint8Array)
          resolve(new Response(responseBuffer, {
            status: proxyRes.statusCode || 200,
            headers: responseHeaders,
          }));
        } else {
          // Return text-based content (HTML, JSON, CSS, JS)
          let textBody = responseBuffer.toString("utf-8");

          // Inject scripts into WooCommerce checkout pages
          // targetPath is already resolved via PATH_ALIASES (e.g. /betalning → /kassan/)
          const isCheckoutPage = /^\/(kassa|kassan|betalning)(\/|$)/.test(targetPath);
          const deliveryNoteFromQuery = url.searchParams.get("delivery_note");
          const deliveryNoteFromCookie = getCookieValue(request.headers.get("cookie"), "hbl_delivery_note");
          const deliveryNote = deliveryNoteFromQuery || deliveryNoteFromCookie;
          const usedDeliveryNoteCookie = !deliveryNoteFromQuery && !!deliveryNoteFromCookie;
          const isHtml = /text\/html/i.test(contentType);

          if (isCheckoutPage && isHtml) {
            // 1. Stripe Swish bridge fix — inject EARLY, right after wcSettings is defined
            // The woo-stripe-payment plugin creates wcStripeBlocks with empty maps.
            // This script intercepts the creation and populates maps from wcSettings data.
            const stripeBridgeScript = `
<script id="stripe-blocks-bridge">
(function(){
  // Wait for wcSettings to exist, then set a trap for wcStripeBlocks
  function tryPatch() {
    if (typeof wcSettings === 'undefined') return false;
    var data = (wcSettings.paymentMethodData || {});
    if (!data.stripe_swish && !data.stripe_cc) return false;

    // Helper: patch a map and fix Swish Payment Element issue
    function patchMap(map, srcData, isLocalPayment) {
      if (map && Object.keys(map).length === 0 && srcData) {
        Object.assign(map, srcData);
      }
      // Delete elementOptions for Swish — the Payment Element iframe
      // renders at 4px and breaks. Removing it forces the working
      // redirect-based flow instead.
      if (isLocalPayment && map && map.elementOptions) {
        delete map.elementOptions;
      }
    }

    // If wcStripeBlocks already exists, patch it directly
    if (typeof wcStripeBlocks !== 'undefined') {
      patchMap(wcStripeBlocks['wc-stripe-local-payment'], data.stripe_swish, true);
      patchMap(wcStripeBlocks['wc-stripe-credit-card'], data.stripe_cc, false);
      return true;
    }

    // wcStripeBlocks doesn't exist yet — intercept its creation via Object.defineProperty
    var realValue;
    Object.defineProperty(window, 'wcStripeBlocks', {
      configurable: true,
      get: function() { return realValue; },
      set: function(val) {
        realValue = val;
        // Patch each map as it gets populated
        setTimeout(function() {
          if (val) {
            patchMap(val['wc-stripe-local-payment'], data.stripe_swish, true);
            patchMap(val['wc-stripe-credit-card'], data.stripe_cc, false);
          }
        }, 0);
      }
    });
    return true;
  }

  // Try immediately
  if (!tryPatch()) {
    // Retry a few times if wcSettings isn't ready
    var attempts = 0;
    var timer = setInterval(function() {
      if (tryPatch() || ++attempts > 50) clearInterval(timer);
    }, 50);
  }
})();
</script>`;
            // Hide Swish payment method — not configured correctly yet
            const hideSwishStyle = `
<style id="hide-swish">
  /* Hide Swish payment method until properly configured */
  [id*="stripe_swish"],
  label[for*="stripe_swish"],
  .wc-block-components-radio-control-accordion-option:has([id*="stripe_swish"]) {
    display: none !important;
  }
</style>`;

            // Inject right after wc-settings-js-before script (where wcSettings is defined)
            const settingsScriptEnd = textBody.indexOf('</script>', textBody.indexOf('wc-settings-js-before'));
            if (settingsScriptEnd !== -1) {
              const insertAt = settingsScriptEnd + '</script>'.length;
              textBody = textBody.substring(0, insertAt) + stripeBridgeScript + textBody.substring(insertAt);
            } else if (textBody.includes("</head>")) {
              // Fallback: inject before </head>
              textBody = textBody.replace("</head>", stripeBridgeScript + "\n</head>");
            }

            // Inject hide-swish CSS into <head>
            if (textBody.includes("</head>")) {
              textBody = textBody.replace("</head>", hideSwishStyle + "\n</head>");
            }

            const helperStyle = `
<style id="hbl-checkout-helper-style">
  #hbl-checkout-helper-root {
    max-width: 760px;
    margin: 16px auto;
    padding: 0 16px;
    display: grid;
    gap: 12px;
    position: relative;
    z-index: 20;
  }
  .hbl-checkout-box {
    border-radius: 16px;
    padding: 16px;
  }
  #hbl-precheckout-context {
    border: 1px solid rgba(15, 23, 42, 0.12);
    background: rgba(248, 250, 252, 0.94);
  }
  #hbl-checkout-nav-notice {
    border: 1px solid rgba(59, 130, 246, 0.18);
    background: rgba(239, 246, 255, 0.92);
  }
  #hbl-multibuy-context {
    border: 1px solid rgba(249, 115, 22, 0.25);
    background: rgba(255, 237, 213, 0.5);
  }
  .hbl-checkout-box h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }
  .hbl-checkout-box p,
  .hbl-checkout-box li {
    font-size: 14px;
    color: rgba(15, 23, 42, 0.92);
  }
  .hbl-checkout-box ul {
    margin: 0;
    padding-left: 18px;
  }
  .hbl-checkout-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .hbl-checkout-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 14px;
    border-radius: 9999px;
    text-decoration: none;
    font-weight: 600;
  }
  .hbl-checkout-action-primary {
    background: #0f172a;
    color: #fff;
  }
  .hbl-checkout-action-secondary {
    border: 1px solid rgba(15, 23, 42, 0.14);
    color: #0f172a;
    background: #fff;
  }
  /* Hide classic WooCommerce order notes */
  body.hbl-has-precheckout-note #order_comments_field {
    display: none !important;
  }
  /* Hide WC Blocks order notes — target all known wrapper classes */
  body.hbl-has-precheckout-note .wc-block-checkout__add-note,
  body.hbl-has-precheckout-note .wc-block-components-checkout-step--order-notes,
  body.hbl-has-precheckout-note [class*="add-note"],
  body.hbl-has-precheckout-note [class*="order-note"] {
    display: none !important;
  }
  /* Fallback: hide the checkbox + textarea directly */
  body.hbl-has-precheckout-note .wc-block-components-checkbox:has(.wc-block-components-checkbox__label[for*="checkbox-control"]) {
    display: none !important;
  }
  body.hbl-has-precheckout-note textarea.wc-block-components-textarea {
    display: none !important;
  }
</style>`;

            if (textBody.includes("</head>")) {
              textBody = textBody.replace("</head>", helperStyle + "\n</head>");
            }

            const helperSections: string[] = [];
            helperSections.push(`
<section id="hbl-checkout-nav-notice" class="hbl-checkout-box">
  <h3>Tillbaka till din beställning</h3>
  <p>Om du vill ändra varukorgen eller fortsätta handla, använd länkarna här. Din React-varukorg ligger kvar tills en order är genomförd.</p>
  <div class="hbl-checkout-actions">
    <a class="hbl-checkout-action hbl-checkout-action-primary" href="/kassa">Tillbaka till kassan</a>
    <a class="hbl-checkout-action hbl-checkout-action-secondary" href="/webbutik">Fortsätt handla</a>
  </div>
</section>`);

            if (deliveryNote) {
              const noteLines = deliveryNote
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);
              const customerCommentLine = noteLines.find((line) => line.startsWith("💬 Kommentar:"));
              const customerComment = customerCommentLine
                ? customerCommentLine.replace(/^💬 Kommentar:\s*/, "")
                : "";
              const deliveryContextLines = noteLines.filter((line) =>
                !line.startsWith("🧾 Sammanfattning från pre-checkout:") &&
                !line.startsWith("• ") &&
                !line.startsWith("💬 Kommentar:")
              );
              const multiBuyLines = noteLines.filter((line) =>
                line.startsWith("• ") && /(?:^|\|\s)\d+\s*för\s*\d+/i.test(line)
              );

              const deliveryContextHtml = deliveryContextLines.length > 0
                ? `<ul>${deliveryContextLines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`
                : "";
              const customerCommentHtml = customerComment
                ? `
  <div style="margin-top:${deliveryContextLines.length > 0 ? "12px" : "0"};">
    <p style="font-size:13px;font-weight:600;margin:0 0 6px 0;color:rgba(51,65,85,1);">Din kommentar</p>
    <p style="margin:0;white-space:pre-wrap;">${escapeHtml(customerComment)}</p>
  </div>`
                : "";

              helperSections.push(`
<section id="hbl-precheckout-context" class="hbl-checkout-box">
  <h3>Uppgifter från pre-checkout</h3>
  <p style="margin:0 0 10px 0;color:rgba(71,85,105,1);">Kommentar och leveransuppgifter lades in i React-kassan innan du skickades hit.</p>
  ${deliveryContextHtml}
  ${customerCommentHtml}
  <p style="font-size:12px;margin:12px 0 0 0;color:rgba(100,116,139,1);">Behöver du ändra kommentaren gör du det i React-kassan innan betalning.</p>
</section>`);

              if (multiBuyLines.length > 0) {
                helperSections.push(`
<section id="hbl-multibuy-context" class="hbl-checkout-box">
  <h3>Multiköp från pre-checkout</h3>
  <p style="margin:0 0 10px 0;color:rgba(87,83,78,1);">Följande kampanjrader visades i React-kassan innan handoff:</p>
  <ul>${multiBuyLines.map((line) => `<li>${escapeHtml(line.replace(/^•\s*/, ""))}</li>`).join("")}</ul>
  <p style="font-size:12px;margin:10px 0 0 0;color:rgba(120,113,108,1);">Denna ruta bevarar multiköpskontext från pre-checkout. Slutligt WooCommerce-pris styrs fortfarande av WooCommerce.</p>
</section>`);
              }
            }

            const helperMarkup = `<div id="hbl-checkout-helper-root">${helperSections.join("\n")}</div>`;
            textBody = textBody.replace(/<body([^>]*)>/i, `<body$1${deliveryNote ? ' class="hbl-has-precheckout-note"' : ''}>${helperMarkup}`);

            // 2. Delivery-note pre-fill script (at end of body)
            //    WooCommerce Blocks checkout hides the textarea behind a checkbox
            //    labelled "Lägg till en anteckning till din beställning".
            //    We must: click the checkbox → wait for React to render the textarea
            //    → fill it using the native setter (React-compatible).
             if (deliveryNote && textBody.includes("</body>")) {
              const safeNote = JSON.stringify(deliveryNote);
              const deliveryScript = `
<script id="hbl-delivery-note-prefill">
(function(){
  var note = ${safeNote};
  var maxAttempts = 40;
  var attempts = 0;

  function setReactValue(el, value) {
    var setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function hideNoteUI() {
    // Hide the checkbox wrapper that contains "anteckning"
    var checkboxes = document.querySelectorAll('.wc-block-components-checkbox__input');
    checkboxes.forEach(function(cb) {
      var wrapper = cb.closest('.wc-block-components-checkbox');
      if (wrapper) {
        var label = wrapper.querySelector('.wc-block-components-checkbox__label');
        if (label && label.textContent && label.textContent.indexOf('anteckning') !== -1) {
          wrapper.style.display = 'none';
          // Also hide parent step/container if it wraps only the note
          var step = cb.closest('.wc-block-components-checkout-step');
          if (step) step.style.display = 'none';
        }
      }
    });
    // Hide the textarea
    var ta = document.querySelector('textarea.wc-block-components-textarea');
    if (ta) {
      ta.style.display = 'none';
      // Also hide parent container of the textarea
      var taParent = ta.parentElement;
      if (taParent) taParent.style.display = 'none';
    }
  }

  function fill() {
    attempts++;
    // 1. Try the classic WooCommerce ID first (shortcode-based checkout)
    var classic = document.getElementById('order_comments');
    if (classic) {
      setReactValue(classic, note);
      hideNoteUI();
      return;
    }

    // 2. WooCommerce Blocks: find the checkbox that reveals the textarea
    var checkboxes = document.querySelectorAll('.wc-block-components-checkbox__input');
    var noteCheckbox = null;
    checkboxes.forEach(function(cb) {
      var wrapper = cb.closest('.wc-block-components-checkbox');
      if (wrapper) {
        var label = wrapper.querySelector('.wc-block-components-checkbox__label');
        if (label && label.textContent && label.textContent.indexOf('anteckning') !== -1) {
          noteCheckbox = cb;
        }
      }
    });

    // 3. Click the checkbox if it exists and is not checked
    if (noteCheckbox && !noteCheckbox.checked) {
      noteCheckbox.click();
      // Wait for React to render the textarea after checkbox state change
      setTimeout(fillTextarea, 300);
      return;
    }

    // 4. Checkbox is already checked or not found, try to fill textarea directly
    fillTextarea();
  }

  function fillTextarea() {
    var ta = document.querySelector('textarea.wc-block-components-textarea');
    if (!ta) {
      // Also try the classic ID as fallback
      ta = document.getElementById('order_comments');
    }
    if (ta) {
      setReactValue(ta, note);
      // Hide the note UI after filling
      setTimeout(hideNoteUI, 100);
    } else if (attempts < maxAttempts) {
      setTimeout(fill, 500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(fill, 500); });
  } else {
    setTimeout(fill, 500);
  }

  // Also observe DOM for late-rendered note UI and hide it
  var hideObserver = new MutationObserver(function() { hideNoteUI(); });
  var observeTarget = document.documentElement;
  if (document.body) observeTarget = document.body;
  hideObserver.observe(observeTarget, { childList: true, subtree: true });
  // Stop observing after 30 seconds to avoid performance impact
  setTimeout(function() { hideObserver.disconnect(); }, 30000);
})();
</script>`;
              textBody = textBody.replace("</body>", deliveryScript + "\n</body>");
            }

            if (textBody.includes("</body>")) {
              const checkoutNavScript = `
<script id="hbl-checkout-navigation-guard">
(function(){
  function rewriteHref(anchor, nextHref) {
    if (!anchor || anchor.dataset.hblNavPatched === '1') {
      return;
    }
    anchor.setAttribute('href', nextHref);
    anchor.dataset.hblNavPatched = '1';
  }

  function ensureNotice() {
    return !!document.getElementById('hbl-checkout-nav-notice');
  }

  function patchLinks() {
    document.querySelectorAll('a[href]').forEach(function(anchor) {
      var href = anchor.getAttribute('href') || '';
      if (/^\\/(varukorg|cart)(\\/|$)/.test(href)) {
        rewriteHref(anchor, '/kassa');
      }
    });
  }

  function init() {
    patchLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  var observer = new MutationObserver(function() {
    patchLinks();
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
</script>`;
              textBody = textBody.replace("</body>", checkoutNavScript + "\n</body>");
            }

            // 3. Pickup mode: hide address fields & auto-select free shipping
            if (deliveryNote && deliveryNote.includes('Hämta i butik') && textBody.includes("</head>")) {
              const pickupStyle = `
<style id="pickup-hide-address">
  /* Immediately hide shipping address section for pickup orders */
  .wc-block-checkout__shipping-fields,
  .wp-block-woocommerce-checkout-shipping-address-block {
    display: none !important;
    height: 0 !important;
    overflow: hidden !important;
  }
</style>`;
              textBody = textBody.replace("</head>", pickupStyle + "\n</head>");

              const pickupScript = `
<script id="pickup-address-hide">
(function(){
  // Auto-select pickup shipping, hide address fields, and select Swish payment
  function setup() {
    // 1. Auto-select free_shipping (pickup) radio — pick the first one
    var radios = document.querySelectorAll('.wc-block-components-radio-control__input');
    radios.forEach(function(r) {
      if (r.id && r.id.indexOf('free_shipping') !== -1 && !r.checked) {
        r.click();
      }
    });

    // 2. Auto-select Swish payment method (avoids Stripe Element initialization errors)
    var paymentRadios = document.querySelectorAll('.wc-block-components-radio-control__input');
    paymentRadios.forEach(function(r) {
      if (r.id && r.id.indexOf('stripe_swish') !== -1 && !r.checked) {
        r.click();
      }
    });

    // 3. Pre-fill required address fields with store address (hidden, for server validation)
    var fills = {
      'shipping-first_name': 'Hämta',
      'shipping-last_name': 'I butik',
      'shipping-address_1': 'Blomstervägen 1',
      'shipping-postcode': '42943',
      'shipping-city': 'Kullavik'
    };
    Object.keys(fills).forEach(function(id) {
      var el = document.getElementById(id);
      if (el && !el.value) {
        var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(el, fills[id]);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // 4. Ensure the address section stays hidden
    var addressSection = document.querySelector('.wc-block-checkout__shipping-fields');
    if (addressSection) addressSection.style.display = 'none';
  }

  // 5. MutationObserver: suppress ALL error banners for pickup & keep fields hidden
  function observe() {
    var observer = new MutationObserver(function() {
      // Hide ALL error banners (address, Stripe, billing) - pickup has pre-filled data
      document.querySelectorAll('.wc-block-components-notice-banner.is-error').forEach(function(banner) {
        var text = banner.innerText || '';
        if (text.indexOf('adress') !== -1 || text.indexOf('address') !== -1 ||
            text.indexOf('Leveransadress') !== -1 || text.indexOf('saknas') !== -1 ||
            text.indexOf('gatuadress') !== -1 || text.indexOf('postnummer') !== -1 ||
            text.indexOf('retrieve data') !== -1 || text.indexOf('Element') !== -1 ||
            text.indexOf('payment method') !== -1 || text.indexOf('billing') !== -1 ||
            text.indexOf('Stripe') !== -1 || text.indexOf('betalkort') !== -1) {
          banner.style.display = 'none';
        }
      });
      // Hide field-level validation errors in the (hidden) address section
      document.querySelectorAll('.wc-block-checkout__shipping-fields .wc-block-components-validation-error').forEach(function(err) {
        err.style.display = 'none';
      });
      // Keep address section hidden (React may re-render)
      var s = document.querySelector('.wc-block-checkout__shipping-fields');
      if (s) s.style.display = 'none';
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Run setup when DOM is ready, then start observing
  function init() {
    setup();
    observe();
    // Re-run setup after a delay (WooCommerce Blocks loads async)
    setTimeout(setup, 1000);
    setTimeout(setup, 3000);
    setTimeout(setup, 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>`;
              textBody = textBody.replace("</body>", pickupScript + "\n</body>");
            }

            if (usedDeliveryNoteCookie) {
              responseHeaders.append("Set-Cookie", "hbl_delivery_note=; Path=/; Max-Age=0; Secure; SameSite=Lax");
            }
          }

          resolve(new Response(textBody, {
            status: proxyRes.statusCode || 200,
            headers: responseHeaders,
          }));
        }
      });
    });

    // 15s timeout — prevents indefinite hangs when WordPress is unresponsive
    proxyReq.setTimeout(15_000, () => {
      proxyReq.destroy(new Error("Upstream request timed out after 15s"));
    });

    proxyReq.on("error", (error: Error) => {
      console.error("WordPress proxy error:", error);
      const isTimeout = error.message.includes("timed out");
      resolve(new Response(JSON.stringify({
        error: isTimeout ? "WordPress backend timed out" : "Failed to connect to WordPress backend",
        details: error.message,
      }), {
        status: isTimeout ? 504 : 502,
        headers: { "Content-Type": "application/json" },
      }));
    });

    if (body) proxyReq.write(body);
    proxyReq.end();
  });
};
