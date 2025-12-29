# SPEC: Publicera/Avpublicera produkter

> **Mål:** Lägg till en "Publicerad"-switch på produkter så att man kan styra vilka som visas på hemsidan.

---

## 1. DATAMODELL

### Lägg till fält i `types.ts`

```typescript
// Lägg till i ProcessedProduct interface
is_published?: boolean;  // true = visas på hemsidan, false = dold
```

**Default:** Produkter utan fältet räknas som `false` (ej publicerad).

---

## 2. PRODUKTKORT — TOGGLE

### Uppdatera produktkortet i ProductLibrary

Lägg till en liten toggle/switch i hörnet av varje produktkort:

```typescript
// I produktkortets JSX, lägg till:
<button
  onClick={(e) => {
    e.stopPropagation();
    togglePublished(product.id, !product.is_published);
  }}
  className={`absolute top-2 left-2 p-1.5 rounded-full transition-colors ${
    product.is_published 
      ? 'bg-emerald-500 text-white' 
      : 'bg-gray-600 text-gray-400'
  }`}
  title={product.is_published ? 'Publicerad — klicka för att dölja' : 'Ej publicerad — klicka för att visa'}
>
  {product.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
</button>
```

Importera ikoner:
```typescript
import { Eye, EyeOff } from 'lucide-react';
```

---

## 3. STORE — ACTION

### Lägg till i `productStore.ts`

```typescript
// I store actions
togglePublished: (productId: string, isPublished: boolean) => void;

// Implementation
togglePublished: (productId, isPublished) => {
  set((state) => ({
    products: state.products.map((p) =>
      p.id === productId
        ? { ...p, is_published: isPublished }
        : p
    ),
  }));
  
  // Spara till Firebase
  get().saveProduct(productId);
},
```

---

## 4. PRODUKTDETALJ — TOGGLE

### Lägg till i ProductDetail.tsx

I header-sektionen, lägg till en tydlig toggle:

```typescript
<div className="flex items-center gap-3">
  <span className="text-sm text-gray-400">
    {product.is_published ? 'Publicerad på hemsidan' : 'Ej publicerad'}
  </span>
  <button
    onClick={() => togglePublished(product.id, !product.is_published)}
    className={`relative w-12 h-6 rounded-full transition-colors ${
      product.is_published ? 'bg-emerald-500' : 'bg-gray-600'
    }`}
  >
    <span
      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
        product.is_published ? 'left-7' : 'left-1'
      }`}
    />
  </button>
</div>
```

---

## 5. BATCH-PUBLICERING (VALFRITT)

### Lägg till knappar för att publicera/avpublicera flera

I ProductLibrary toolbar:

```typescript
<button
  onClick={() => publishSelected(true)}
  className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm"
>
  Publicera valda
</button>
<button
  onClick={() => publishSelected(false)}
  className="px-3 py-1.5 bg-gray-600 text-white rounded text-sm"
>
  Avpublicera valda
</button>
```

---

## 6. HEMSIDAN — UPPDATERA FILTER

### I `src/hooks/useProducts.ts` på hemsidan

Ändra query från:
```typescript
const q = query(productsRef, where('status', '==', 'completed'));
```

Till:
```typescript
const q = query(
  productsRef, 
  where('status', '==', 'completed'),
  where('is_published', '==', true)
);
```

**OBS:** Detta kräver ett compound index i Firestore. Firebase Console visar en länk för att skapa det om det saknas.

### Alternativ utan index (enklare)

Filtrera i koden istället:
```typescript
const productList = snapshot.docs
  .map(doc => ({ id: doc.id, ...doc.data() }))
  .filter((p: any) => p.status === 'completed' && p.is_published === true)
  .map((p: any) => transformProduct(p as PIMProduct));
```

---

## 7. MIGRERING AV BEFINTLIGA PRODUKTER

Produkter som redan har `status: completed` ska automatiskt bli publicerade:

```typescript
// Kör en gång för att sätta is_published på befintliga completed produkter
const migratePublishedStatus = async () => {
  const products = useProductStore.getState().products;
  
  for (const product of products) {
    if (product.status === 'completed' && product.is_published === undefined) {
      await updateProduct(product.id, { is_published: true });
    }
  }
};
```

---

## 8. VISUELL INDIKATOR I PRODUKTLISTAN

Visa tydligt vilka produkter som är publicerade:

```typescript
// Produktkort som inte är publicerade får en "dimmed" look
<div className={`relative ${!product.is_published ? 'opacity-50' : ''}`}>
  {/* produktkort-innehåll */}
</div>
```

---

## 9. VERIFIERA

### Checklista
- [ ] Toggle syns på produktkort
- [ ] Toggle syns i produktdetalj
- [ ] Klicka toggle → Firebase uppdateras
- [ ] Hemsidan visar endast `is_published: true`
- [ ] Befintliga completed-produkter migreras

---

## SAMMANFATTNING

| Var | Vad |
|-----|-----|
| PIM produktkort | Öga-ikon, grön = publicerad, grå = dold |
| PIM produktdetalj | Switch med text "Publicerad på hemsidan" |
| Firebase | `is_published: true/false` |
| Hemsidan | Filtrerar på `is_published === true` |
