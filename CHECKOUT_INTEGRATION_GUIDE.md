# Checkout Integration Guide — För Webshop-agenten

> **Dokument skapat:** 2026-01-26  
> **Syfte:** Instruktioner för att felsöka och lösa checkout-problem relaterade till `woocommerce_id`

---

## 🚨 Problemsammanfattning

Checkout-flödet på `hasselbladslivs.se` kräver att varje produkt i Firestore har ett `woocommerce_id`. Om detta fält saknas kan webshopen inte omdirigera kunden till WooCommerce-kassan för betalning.

**Symptom:**

- Användaren ser "Vi uppdaterar vår webbutik" (amber varningssida)
- Konsolen loggar: `[Checkout] Produkter saknar woocommerce_id: [...]`
- Checkout-redirect misslyckas eller ger 404

---

## 🏗️ Arkitektur-kontext

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   PIM-appen     │────▶│    Firebase     │◀────│   Webshopen     │
│  (Bildstudio)   │     │   (Firestore)   │     │ (hasselbladslivs)
└────────┬────────┘     └─────────────────┘     └────────┬────────┘
         │                                               │
         │  1. Synkar produkt                            │ 2. Läser produkt
         │  2. Får woocommerce_id                        │ 3. Bygger cart-URL
         │  3. Sparar ID till Firestore                  │ 4. Redirectar till WC
         │                                               │
         └───────────────────┬───────────────────────────┘
                             ▼
                    ┌─────────────────┐
                    │   WooCommerce   │
                    │    (Backend)    │
                    └─────────────────┘
```

### Viktiga sökvägar i Firebase

- **Produkter:** `organizations/hasselblad_common/projects/default/products`
- **Hemsida-inställningar:** `organizations/hasselblad_common/settings/homepage`

---

## ✅ Vad som REDAN fungerar (bekräftat)

Följande är **korrekt implementerat** i webshop-koden:

| Fil | Funktion | Status |
|-----|----------|--------|
| `src/lib/woocommerce.ts` | `buildWooCommerceCartUrl()` — filtrerar produkter utan ID | ✅ |
| `src/lib/woocommerce.ts` | `redirectToWooCommerceCheckout()` — hanterar redirect | ✅ |
| `src/pages/Checkout.tsx` | Varningssida vid saknade ID:n | ✅ |
| `src/context/CartContext.tsx` | Inkluderar `woocommerce_id` i `CartItem` | ✅ |
| `src/hooks/useProducts.ts` | Mappar `woocommerce_id` från Firestore | ✅ |

**Slutsats:** Problemet ligger INTE i webshop-koden, utan i att produktdata i Firestore saknar `woocommerce_id`.

---

## 🔧 Felsökningsguide för Webshop-agenten

### 1. Diagnostik — Identifiera produkter utan ID

Lägg till följande logg i `src/pages/Checkout.tsx` (om inte redan finns):

```typescript
useEffect(() => {
  if (items.length > 0) {
    const missing = items.filter(item => !item.woocommerce_id);
    if (missing.length > 0) {
      console.warn('[Checkout] Produkter saknar woocommerce_id:', 
        missing.map(m => ({ id: m.id, name: m.name }))
      );
    }
  }
}, [items]);
```

### 2. Verifiera datamappning i `useProducts.ts`

Säkerställ att `woocommerce_id` mappas korrekt:

```typescript
// I produktmappningen (vanligtvis i useProducts.ts eller liknande)
const product: Product = {
  id: doc.id,
  name: data.display_name || data.product_name,
  price: data.price,
  // ... övriga fält
  woocommerce_id: data.woocommerce_id,  // ← Kritiskt fält
};
```

### 3. Verifiera att CartContext bevarar ID:t

I `addItem` funktionen i `CartContext.tsx`:

```typescript
const addItem = (product: Product, quantity: number = 1) => {
  // Logga för att verifiera att ID följer med
  console.log('[Cart] Adding product with woocommerce_id:', product.woocommerce_id);
  
  // ... befintlig logik
};
```

---

## 🎯 Lösning — Åtgärder för att fixa problemet

### Lösningen finns i PIM-appen, INTE i webshop-koden

**Steg-för-steg:**

1. **Öppna PIM-appen:** <https://hasselblads-pim.netlify.app>
2. **Logga in** med Firebase-autentisering
3. **Identifiera produkter utan ID:**
   - Gå till produktlistan
   - Produkter med ✅ kundvagnsikon har `woocommerce_id`
   - Produkter utan denna ikon saknar ID
4. **Synka enskild produkt:**
   - Öppna produkten
   - Klicka "Spara & Stäng"
   - Detta triggar automatisk synk till WooCommerce
   - WooCommerce returnerar ett ID som sparas till Firestore
5. **Bulk-synk (om många produkter saknar ID):**
   - Gå till "Data & Export" i PIM
   - Klicka på "Synka/Uppdatera"
   - Vänta tills processen är klar

### Verifiering efter synk

1. Öppna Firebase Console: <https://console.firebase.google.com/project/hasselblad-bildstudio/firestore>
2. Navigera till `organizations/hasselblad_common/projects/default/products`
3. Välj en produkt och verifiera att fältet `woocommerce_id` finns och har ett numeriskt värde

---

## 📊 Vanliga felscenarier

| Scenario | Symptom | Orsak | Lösning |
|----------|---------|-------|---------|
| Ny produkt | Checkout fail | Produkten är skapad men inte synkad | Synka via PIM |
| Gammal produkt | Checkout fail | Synk misslyckades tidigare (name-based matching bug) | Synka om via PIM |
| Import från CSV | Checkout fail | CSV-import sätter inte `woocommerce_id` | Kör bulk-synk i PIM |
| Alla produkter | Checkout fail | Fel Firestore-path i webshop | Kontrollera att `useProducts.ts` pekar på `projects/default/products` |

---

## 🔗 Tekniska referenser

### WooCommerce Cart URL Format

```
https://hasselbladslivs.se/?add-to-cart=ID1,ID2&quantity[ID1]=X&quantity[ID2]=Y
```

### Firestore Product Schema (relevanta fält)

```typescript
interface Product {
  id: string;                    // Firebase document ID (t.ex. "HB-0001")
  product_name: string;
  display_name: string;
  price: number;
  is_published: boolean;
  status: 'pending' | 'completed';
  woocommerce_id?: number;       // ← Sätts av PIM vid synk till WooCommerce
  // ... övriga fält
}
```

### Console Logs att leta efter

- `[Checkout] Produkter saknar woocommerce_id:` — Lista på berörda produkter
- `[WooSync] ✅ Synced product` — Bekräftelse från PIM att synk lyckades
- `[Firebase] ✅ Product saved` — Bekräftelse att ID sparats

---

## 📞 Eskalering

Om synkroniseringen inte fungerar trots att du följt stegen ovan:

1. Kontrollera att PIM-appens miljövariabler är korrekta:
   - `VITE_WOOCOMMERCE_URL`
   - `VITE_WOOCOMMERCE_CONSUMER_KEY`
   - `VITE_WOOCOMMERCE_CONSUMER_SECRET`

2. Kontrollera att WooCommerce REST API är tillgängligt:

   ```bash
   curl -s -I "https://hasselbladslivs.se/wp-json/wc/v3/products?per_page=1" \
     -u "CK:CS" | grep -i x-wp-total
   ```

3. Kontakta PIM-agenten för djupare felsökning av synk-logiken.

---

## 📝 Sammanfattning

| Ansvar | Åtgärd |
|--------|--------|
| **PIM-appen** | Synka produkter och spara `woocommerce_id` till Firestore |
| **Webshopen** | Läsa `woocommerce_id` och bygga redirect-URL |
| **Administratör** | Trigga synk via PIM när nya produkter skapas |

**Checkout-problemet löses genom att synka om produkter i PIM-appen, inte genom ändringar i webshop-koden.**
