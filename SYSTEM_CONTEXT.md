# Hasselblads Livs — Systemkontext

> **Syfte:** Ge AI-assistenter fullständig förståelse för hela systemet, oavsett vilken del de arbetar med.

**Senast uppdaterad:** 11 december 2025

---

## 🎯 SYSTEMÖVERSIKT

Hasselblads Livs är en livsmedelsbutik i Mölndal. Systemet består av två delar som ska kopplas samman:

```text
┌─────────────────────────────────────────────────────────────┐
│                    HASSELBLADS LIVS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐      ┌─────────────────────────┐  │
│  │   HASSELBLADS PIM   │      │   HASSELBLADS HEMSIDA   │  │
│  │   (Admin/Backoffice)│      │   (Kundvänd webbutik)   │  │
│  │                     │      │                         │  │
│  │  • Produkthantering │      │  • Produktkatalog       │  │
│  │  • Excel-import     │      │  • Varukorg & checkout  │  │
│  │  • AI-bildgenerering│      │  • Filtrering & sök     │  │
│  │  • WooCommerce-synk │      │  • Hemleverans-info     │  │
│  └──────────┬──────────┘      └────────────┬────────────┘  │
│             │                              │                │
│             │         ┌────────┐           │                │
│             └────────►│Firebase│◄──────────┘                │
│                       │  (RT)  │                            │
│                       └───┬────┘                            │
│                           │                                 │
│                    ┌──────▼──────┐                          │
│                    │ WooCommerce │                          │
│                    │  (Checkout) │                          │
│                    └─────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 REPOS & TECH STACKS

### Hasselblads-PIM (Admin)

- **Repo:** github.com/Onepiecedad/Hasselblads-PIM
- **Hosting:** Firebase Hosting
- **Stack:** React 19, TypeScript, Vite, Zustand, Tailwind CSS (emerald-dark)
- **Databas:** Firebase Realtime Database
- **Bilder:** Cloudinary
- **AI:** Google Gemini (bildsök, bildgenerering, copywriting)

### Hasselblads_Livs (Hemsida)

- **Repo:** github.com/Onepiecedad/Hasselblads_Livs
- **Hosting:** Netlify
- **Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **State:** React Context (varukorg)
- **Routing:** React Router v6

---

## 🔗 DATAFLÖDE

```text
Excel-listor (Anette & Axel)
        │
        ▼
┌───────────────┐
│  PIM-APPEN    │ ◄── Manuell redigering, AI-generering
│  (Firebase)   │
└───────┬───────┘
        │
        ▼ Synk (kommande)
┌───────────────┐
│  WooCommerce  │ ◄── Kassa, betalning, orderhantering
└───────┬───────┘
        │
        ▼ API
┌───────────────┐
│   HEMSIDAN    │ ◄── Produktvisning, varukorg
│   (Netlify)   │
└───────────────┘
```

**Ägarskap:**

- **PIM äger:** All produktdata (namn, pris, bilder, beskrivningar, kategorier)
- **WooCommerce äger:** Checkout, betalning, ordrar, lagersynk
- **Hemsidan äger:** UI/UX, varukorg-state, kundupplevelse

---

## 📐 GEMENSAMT PRODUKTSCHEMA

Detta är det kanoniska schemat som båda systemen ska följa:

```typescript
// SHARED_TYPES.ts — Kopiera till båda repos

/**
 * Kärnprodukt — minimum för att visa i webshop
 */
interface Product {
  id: string;                    // Unik slug, t.ex. "apple-eko"
  name: string;                  // Visningsnamn
  description: string;           // Kort beskrivning
  category: ProductCategory;     // Huvudkategori
  subcategory?: string;          // Underkategori
  tags: ProductTag[];            // Taggar för filtrering
  price: number;                 // Pris i SEK (heltal)
  salePrice?: number;            // Rabatterat pris
  unit: string;                  // "/kg", "/st", "/500g"
  origin: {
    country: string;             // "Sverige"
    flag: string;                // "🇸🇪"
  };
  image: string;                 // Primär bild-URL (Cloudinary)
  inStock: boolean;              // Lagerstatus
}

/**
 * Kategorier — samma i PIM och hemsida
 */
type ProductCategory = 
  | "frukt"
  | "gronsaker"
  | "mejeri"
  | "chark"
  | "ost"
  | "skafferi"
  | "brod"
  | "snacks"
  | "dryck";

/**
 * Taggar — för filtrering och marknadsföring
 */
type ProductTag = 
  | "sasong"       // Säsongsprodukt
  | "erbjudande"   // Rea/kampanj
  | "nyhet"        // Ny produkt
  | "eko"          // Ekologisk
  | "svenskt"      // Svenskt ursprung
  | "klassiker";   // Populär favorit

/**
 * Utökad produkt — endast i PIM (admin-data)
 */
interface PIMProduct extends Product {
  // Identifiering
  hasselblad_id?: string;        // Internt ID "HB-0001"
  sku?: string;                  // Artikelnummer från Excel
  woocommerce_id?: number;       // WooC produkt-ID
  
  // Bildhantering
  imageSource?: 'csv' | 'search' | 'generated' | 'edited';
  cloudinaryUrl?: string;
  originalSearchResultUrl?: string;
  
  // Metadata
  source?: 'anette' | 'axel' | 'manual' | 'legacy';
  fingerprint?: string;          // För matchning vid import
  vat_class?: number;            // Momsklass
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'skipped' | 'failed';
  synced_at?: string;            // Senaste WooC-synk
  is_archived?: boolean;
}

/**
 * Varukorg — endast på hemsidan
 */
interface CartItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;              // 1-99
}
```

---

## 🎨 DESIGNPRINCIPER

### Färger (gemensamma)

```css
/* PIM använder emerald-dark tema */
--pim-primary: #065f46;          /* Emerald-800 */

/* Hemsidan använder liknande grön palett */
--web-primary: var(--primary);   /* Definierad i index.css */
```

### Produktkort

Produktkort i hemsidan ska visa:

- Produktbild (16:9 eller 1:1)
- Namn
- Pris + enhet
- Ursprungsflagga
- "Lägg till"-knapp

PIM-appens produktkort visar samma + admin-info (status, bildkälla, etc.)

---

## 🔌 API-KONTRAKT

### Firebase → Hemsida (realtid)

```typescript
// Path: /organizations/hasselblad_common/projects/default/products
// Lyssna med onValue() för realtidsuppdateringar

// Transformation PIM → Hemsida:
function toWebProduct(pimProduct: PIMProduct): Product {
  return {
    id: pimProduct.id,
    name: pimProduct.display_name || pimProduct.product_name,
    description: pimProduct.description || '',
    category: mapCategory(pimProduct.main_category),
    tags: parseTags(pimProduct.csvData?.['Symbol']),
    price: pimProduct.price || 0,
    salePrice: pimProduct.sale_price,
    unit: pimProduct.csvData?.['Kg/st'] || '/st',
    origin: {
      country: pimProduct.origin_country || 'Okänt',
      flag: getFlag(pimProduct.origin_country)
    },
    image: pimProduct.cloudinaryUrl || pimProduct.finalImageUrl || '/placeholder.jpg',
    inStock: pimProduct.stock_status !== 'outofstock'
  };
}
```

### PIM → WooCommerce (synk)

```typescript
// Endpoint: POST /wp-json/wc/v3/products/batch
// Auth: Consumer Key + Consumer Secret

interface WooCommerceProduct {
  name: string;
  sku: string;
  regular_price: string;
  sale_price?: string;
  description: string;
  categories: { id: number }[];
  images: { src: string }[];
  stock_status: 'instock' | 'outofstock';
  meta_data?: { key: string; value: string }[];
}
```

---

## 📋 KATEGORI-MAPPNING

| PIM (main_category)      | Hemsida (ProductCategory) | WooCommerce |
|--------------------------|---------------------------|-------------|
| Frukt                    | frukt                     | TBD         |
| Grönt / Grönsaker        | gronsaker                 | TBD         |
| Mejeri                   | mejeri                    | TBD         |
| Chark                    | chark                     | TBD         |
| Ost                      | ost                       | TBD         |
| Kolonial / Skafferi      | skafferi                  | TBD         |
| Bröd                     | brod                      | TBD         |
| Snacks                   | snacks                    | TBD         |
| Dryck / Drycker          | dryck                     | TBD         |

---

## ✅ STATUS & NÄSTA STEG

### PIM-appen

| Klart | Nästa |
| ------- | ------- |
| ✅ Excel-import med kolumnmappning | 🔲 WooCommerce API-synk (fas 4) |
| ✅ Produktmatchning (SKU + fingerprint) | 🔲 Historik & rollback |
| ✅ Golden Record-regler | 🔲 Förhandsgranskning "som kund" |
| ✅ AI-bildgenerering | |
| ✅ Cloudinary-uppladdning | |

### Hemsidan

| Klart | Nästa |
| ------- | ------- |
| ✅ Startsida med hero + kategorikort | 🔲 Byt hårdkodade produkter mot Firebase |
| ✅ Varukorg med Context | 🔲 Webshop-sida med produktgrid |
| ✅ Routing | 🔲 Filtrering & sökning |
| ✅ shadcn/ui komponenter | 🔲 Checkout-koppling mot WooC |

---

## ⚠️ REGLER FÖR AI-ASSISTENTER

```text
KRITISKT — LÄS DETTA FÖRST:

1. ÄNDRA INTE befintliga fält eller typer utan explicit instruktion
2. BEVARA alltid befintlig funktionalitet
3. NYA fält ska vara optional (?) så befintlig data fungerar
4. FRÅGA om du är osäker istället för att anta
5. GÖR ENDAST det som specificeras — inget "extra"
6. KOORDINERA med den andra delen av systemet via detta dokument

PIM-specifikt:
- Firebase-data i produktion får ALDRIG förstöras
- Axel har manuellt bearbetat bilder/beskrivningar — skydda dessa

Hemsida-specifikt:
- Produkter är hårdkodade i src/lib/products.ts (ska bytas ut)
- shadcn/ui används — följ dess patterns
- Netlify Functions för eventuellt API-lager
```

---

## 📞 KONTAKT

- **Joakim** — Utvecklare, äger båda repos
- **Axel** — Kund, Hasselblads Livs, produktdata (frukt & grönt)
- **Anette** — Produktdata (chark, mejeri, kolonial)
