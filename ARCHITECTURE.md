# Hasselblads Livs – Arkitekturdokumentation

> **Syfte:** Ge en AI-assistent fullständig förståelse för hur webbutiken är strukturerad och hur den ska integreras med extern produkthantering (PIM).

---

## 🏪 Projektöversikt

**Hasselblads Livs** är en webbplats för en livsmedelsbutik i Mölndal med fokus på frukt, grönsaker och delikatesser. Sajten inkluderar:

- **Webbutik** med produktkatalog, filtrering och varukorg
- **Hemleverans**-information
- **Butikssida** med öppettider och karta
- **Säsongssida** med aktuella produkter
- **Kundservice** med kontaktformulär

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | TailwindCSS + shadcn/ui |
| Routing | React Router v6 |
| State | React Context (varukorg) |
| Hosting | Netlify |
| Icons | Lucide React |

---

## 📁 Mappstruktur

```
src/
├── App.tsx              # Routing & providers
├── main.tsx             # Entry point
├── index.css            # CSS-variabler (tema)
│
├── pages/               # Sidkomponenter
│   ├── Home.tsx
│   ├── Webshop.tsx      # ⭐ Huvudsida för produkter
│   ├── Checkout.tsx     # ⭐ Kassaflöde
│   ├── Store.tsx
│   ├── Delivery.tsx
│   ├── Season.tsx
│   ├── About.tsx
│   ├── CustomerService.tsx
│   └── NotFound.tsx
│
├── components/
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   ├── shop/            # ⭐ WEBSHOP-KOMPONENTER
│   │   ├── ProductCard.tsx
│   │   ├── MiniCartDrawer.tsx
│   │   ├── QuickViewModal.tsx
│   │   ├── FilterChips.tsx
│   │   └── SortDropdown.tsx
│   ├── sections/        # Återanvändbara sektioner
│   └── ui/              # shadcn/ui komponenter
│
├── context/
│   └── CartContext.tsx  # ⭐ Global varukorg-state
│
├── lib/
│   ├── products.ts      # ⭐ Produkttyper & data
│   ├── categoryCards.ts # Kategori-bilder
│   └── utils.ts
│
├── hooks/
│   ├── use-toast.ts
│   ├── use-mobile.tsx
│   └── usePageMetadata.ts
│
└── layouts/
    └── RootLayout.tsx
```

---

## ⭐ KRITISKA FILER FÖR PIM-INTEGRATION

### 1. Produkttyper (`src/lib/products.ts`)

```typescript
export type ProductCategory = "frukt" | "gronsaker" | "mejeri" | "skafferi";

export type ProductTag = "sasong" | "erbjudande" | "nyhet" | "klassiker";

export type Product = {
  id: string;           // Unik identifierare (slug-format, t.ex. "apple-eko")
  name: string;         // Produktnamn
  description: string;  // Kort beskrivning
  category: ProductCategory;
  tags: ProductTag[];   // Kan ha flera taggar
  price: number;        // Pris i SEK (heltal)
  unit: string;         // Enhet (t.ex. "/kg", "/500 g", "/st")
  origin: {
    country: string;    // "Sverige", "Spanien", etc.
    flag: string;       // Emoji-flagga "🇸🇪"
  };
  image: string;        // URL till produktbild
};
```

**Tillgängliga filter:**
```typescript
export const categories = [
  { label: "Alla", value: "alla" },
  { label: "Frukt", value: "frukt" },
  { label: "Grönsaker", value: "gronsaker" },
  { label: "Mejeri", value: "mejeri" },
  { label: "Skafferi", value: "skafferi" },
];

export const tagFilters = [
  { label: "Säsong & Erbjudanden", value: "sasong-och-erbjudanden", tag: "sasong" },
  { label: "Erbjudanden", value: "erbjudanden", tag: "erbjudande" },
  { label: "Nyheter", value: "nyheter", tag: "nyhet" },
  { label: "Klassiker", value: "klassiker", tag: "klassiker" },
];

export const sortOptions = [
  { label: "Mest populära", value: "popular" },
  { label: "Pris – lägst först", value: "price-asc" },
  { label: "Pris – högst först", value: "price-desc" },
  { label: "Namn A–Ö", value: "name-asc" },
];
```

---

### 2. Varukorg (`src/context/CartContext.tsx`)

```typescript
export type CartItem = {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;  // 1-99
};

// Tillgängliga metoder via useCart():
interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  subtotal: number;      // Summa exkl. frakt
  shippingFee: number;   // 39 kr om < 600 kr, annars 0
  total: number;         // subtotal + shippingFee
  
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setOpen: (isOpen: boolean) => void;
}
```

**Fraktregler:**
- Gratis frakt vid beställning ≥ 600 kr
- Annars 39 kr fraktavgift

---

### 3. Kategorikort (`src/lib/categoryCards.ts`)

```typescript
export type CategoryCardData = {
  name: string;           // "FRUKT GRÖNT"
  description: string;    // Kort beskrivning
  image: string;          // Bildimport
  href: string;           // Länk, t.ex. "/webbutik?kategori=frukt"
  filterValue?: string;   // Matchande kategori-value
  titleLines: string[];   // För layout: ["FRUKT", "GRÖNT"]
};
```

**Nuvarande kategorier:**
1. Frukt & Grönt
2. Mejeri & Ägg
3. Skafferi
4. Sött & Gott
5. Ost & Chark
6. Bröd
7. Nötter & Torkad frukt
8. Snacks & Dryck

---

## 🎨 Designsystem (Tailwind)

### Färgvariabler (CSS custom properties i `index.css`)

```css
--primary       /* Primär grön */
--secondary     /* Sekundär färg */
--background    /* Bakgrund */
--foreground    /* Text */
--muted         /* Dämpad bakgrund */
--accent        /* Accent */
--peach, --cream, --pink, --sky, --teal  /* Pasteller */
```

### Typsnitt
- **Sans-serif:** Inter (rubriker, UI)
- **Lato:** Alternativt typsnitt

---

## 🔗 Routes (från `App.tsx`)

| Path | Komponent | Beskrivning |
|------|-----------|-------------|
| `/` | `Home` | Startsida |
| `/webbutik` | `Webshop` | Produktkatalog |
| `/hemleverans` | `Delivery` | Leveransinformation |
| `/butiken` | `Store` | Fysisk butik |
| `/om-oss` | `About` | Om företaget |
| `/säsong` | `Season` | Säsongsprodukter |
| `/kundservice` | `CustomerService` | Kontakt & FAQ |
| `/kassa` | `Checkout` | Kassaflöde |
| `*` | `NotFound` | 404-sida |

---

## 🔌 Integrationsplan för PIM-appen

### Nuvarande läge
- Produkter är **hårdkodade** i `src/lib/products.ts`
- Ingen databas eller API

### Förslag för integration

1. **API-endpoint** som returnerar produkter i `Product[]`-format
2. **Netlify Functions** (`netlify/functions/`) för serverless API
3. Ersätt hårdkodad `products` med hook som hämtar från API:
   ```typescript
   const { data: products, isLoading } = useQuery({
     queryKey: ['products'],
     queryFn: () => fetch('/api/products').then(r => r.json())
   });
   ```

### Viktiga API-kontraktsformat

**GET /api/products**
```json
[
  {
    "id": "apple-eko",
    "name": "Ekologiska äpplen Aroma",
    "description": "Knapriga svenska äpplen...",
    "category": "frukt",
    "tags": ["sasong"],
    "price": 42,
    "unit": "/kg",
    "origin": { "country": "Sverige", "flag": "🇸🇪" },
    "image": "https://..."
  }
]
```

---

## 📦 Beroenden (viktiga)

```json
{
  "@tanstack/react-query": "^5.x",   // Data fetching
  "react-router-dom": "^6.x",        // Routing
  "lucide-react": "^0.462.0",        // Ikoner
  "sonner": "^1.x",                  // Toast-notiser
  "zod": "^3.x"                      // Validering
}
```

---

## ✅ Sammanfattning för AI-integration

| Vad | Fil | Syfte |
|-----|-----|-------|
| Produkttyp | `lib/products.ts` | Definiera schema för produkter |
| Varukorgslogik | `context/CartContext.tsx` | State management för köp |
| Webshop UI | `pages/Webshop.tsx` | Filtrering, sökning, rendering |
| Produktkort | `components/shop/ProductCard.tsx` | UI för enskild produkt |
| Snabbvisning | `components/shop/QuickViewModal.tsx` | Modal för produktdetaljer |
| Kundvagn | `components/shop/MiniCartDrawer.tsx` | Sidopanel för varukorg |
| Kategorier | `lib/categoryCards.ts` | Kategoribeskrivningar |
