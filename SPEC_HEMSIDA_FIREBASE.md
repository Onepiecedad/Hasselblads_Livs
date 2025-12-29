# SPEC: Koppla Webshop mot Firebase

> **Mål:** Byt ut hårdkodade produkter mot realtidsdata från Firebase. Visa endast produkter med `status === 'completed'`.

---

## 1. FIREBASE-KONFIGURATION

### Installera beroenden
```bash
npm install firebase
```

### Skapa `src/lib/firebase.ts`
```typescript
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
```

### Miljövariabler (`.env`)
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=https://[PROJECT_ID].firebaseio.com
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

**OBS:** Hämta dessa värden från PIM-appens `firebaseConfig.ts` — samma projekt.

---

## 2. SKAPA PRODUCT HOOK

### Skapa `src/hooks/useProducts.ts`
```typescript
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/products';

// Firebase-path för produkter
const PRODUCTS_PATH = 'organizations/hasselblad_common/projects/default/products';

// PIM-produktens struktur (förenklad)
interface PIMProduct {
  id: string;
  product_name: string;
  display_name?: string;
  description?: string;
  brand?: string;
  price?: number;
  sale_price?: number;
  main_category?: string;
  sub_category?: string;
  origin_country?: string;
  finalImageUrl?: string;
  cloudinaryUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'skipped' | 'failed';
  csvData?: Record<string, string>;
}

// Mappa ursprungsland till flagga
const FLAG_MAP: Record<string, string> = {
  'Sverige': '🇸🇪',
  'Spanien': '🇪🇸',
  'Italien': '🇮🇹',
  'Frankrike': '🇫🇷',
  'Nederländerna': '🇳🇱',
  'Tyskland': '🇩🇪',
  'Danmark': '🇩🇰',
  'Norge': '🇳🇴',
  'Finland': '🇫🇮',
  'Grekland': '🇬🇷',
  'Portugal': '🇵🇹',
  'Belgien': '🇧🇪',
  'Polen': '🇵🇱',
  'USA': '🇺🇸',
  'Brasilien': '🇧🇷',
  'Chile': '🇨🇱',
  'Argentina': '🇦🇷',
  'Sydafrika': '🇿🇦',
  'Marocko': '🇲🇦',
  'Israel': '🇮🇱',
  'Turkiet': '🇹🇷',
};

// Mappa PIM-kategori till hemsidans kategori
function mapCategory(pimCategory?: string): Product['category'] {
  if (!pimCategory) return 'skafferi';
  
  const normalized = pimCategory.toLowerCase().trim();
  
  if (normalized.includes('frukt')) return 'frukt';
  if (normalized.includes('grönt') || normalized.includes('grönsak')) return 'gronsaker';
  if (normalized.includes('mejeri')) return 'mejeri';
  if (normalized.includes('skafferi') || normalized.includes('kolonial')) return 'skafferi';
  
  return 'skafferi'; // Default
}

// Parsa taggar från CSV-data
function parseTags(symbolField?: string): Product['tags'] {
  if (!symbolField) return [];
  
  const tags: Product['tags'] = [];
  const normalized = symbolField.toLowerCase();
  
  if (normalized.includes('eko')) tags.push('sasong'); // Använd 'sasong' för eko tills vidare
  if (normalized.includes('nyhet')) tags.push('nyhet');
  
  return tags;
}

// Parsa enhet från CSV-data
function parseUnit(kgSt?: string): string {
  if (!kgSt) return '/st';
  
  const normalized = kgSt.toLowerCase().trim();
  if (normalized === 'kg' || normalized.includes('kilo')) return '/kg';
  if (normalized.includes('500')) return '/500g';
  if (normalized.includes('250')) return '/250g';
  
  return '/st';
}

// Transformera PIM-produkt till hemsidans format
function transformProduct(pim: PIMProduct): Product {
  const country = pim.origin_country || pim.csvData?.['Etiketter land'] || '';
  
  return {
    id: pim.id,
    name: pim.display_name || pim.product_name,
    description: pim.description || '',
    category: mapCategory(pim.main_category || pim.csvData?.['Huvudkategori']),
    tags: parseTags(pim.csvData?.['Symbol (Eko, FT etc)']),
    price: pim.price ?? parseFloat(pim.csvData?.['Ordinarie pris'] || '0'),
    unit: parseUnit(pim.csvData?.['Kg/st']),
    origin: {
      country: country || 'Okänt',
      flag: FLAG_MAP[country] || '🌍'
    },
    image: pim.cloudinaryUrl || pim.finalImageUrl || '/placeholder-product.jpg'
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const productsRef = ref(db, PRODUCTS_PATH);
    
    const unsubscribe = onValue(
      productsRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          
          if (!data) {
            setProducts([]);
            setIsLoading(false);
            return;
          }

          // Konvertera objekt till array och filtrera på completed
          const productList: Product[] = Object.values(data)
            .filter((p: any) => p.status === 'completed')
            .map((p: any) => transformProduct(p as PIMProduct));

          setProducts(productList);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to parse products'));
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { products, isLoading, error };
}
```

---

## 3. UPPDATERA WEBSHOP-SIDAN

### Ändra `src/pages/Webshop.tsx`

**Före:**
```typescript
import { products } from '@/lib/products';
```

**Efter:**
```typescript
import { useProducts } from '@/hooks/useProducts';

export default function Webshop() {
  const { products, isLoading, error } = useProducts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Kunde inte ladda produkter. Försök igen senare.</p>
      </div>
    );
  }

  // Resten av komponenten förblir oförändrad
  // products-variabeln kommer nu från Firebase istället för hårdkodad fil
  
  // ... befintlig filtrering, rendering etc.
}
```

---

## 4. BEHÅLL HÅRDKODAD DATA SOM FALLBACK

Radera INTE `src/lib/products.ts` ännu. Behåll den som referens och fallback. Du kan använda den för:
- Typedefinitioner (`Product`, `ProductCategory`, etc.)
- Filter-options (`categories`, `tagFilters`, `sortOptions`)
- Fallback om Firebase är nere

---

## 5. VERIFIERA

### Checklista
- [ ] Firebase-config finns i `.env`
- [ ] `npm run dev` startar utan fel
- [ ] Webshop visar produkter från Firebase
- [ ] Endast `status: 'completed'` visas
- [ ] Bilder laddar (Cloudinary-URLs)
- [ ] Filtrering på kategori fungerar
- [ ] Sök fungerar

### Debug
Om inga produkter visas:
1. Kolla browser console för Firebase-fel
2. Verifiera att `PRODUCTS_PATH` matchar Firebase-strukturen
3. Kolla att det finns produkter med `status: 'completed'` i Firebase

---

## 6. NÄSTA STEG (GÖR INTE ÄN)

- Lägg till `salePrice`-hantering för erbjudanden
- Implementera "Erbjudande"-tagg baserat på `sale_price`
- Sökning som inkluderar beskrivning och varumärke
- Caching med React Query för bättre prestanda
