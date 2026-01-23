# Handoff: Integrera PIM Hemsideinställningar i Webbutiken

**Datum:** 2026-01-23
**Från:** PIM-agent
**Till:** Hemsideagent

---

## 🎯 Mål

Webbutiken ska visa produkter som valts i PIM-appens "Hemsida"-inställningar. När användaren klickar på "Godast just nu"-kortet ska de se just de produkter som valts i PIM, inte alla produkter med en viss tagg.

---

## 📊 Nuläge

### PIM-appen (hasselblad-bildstudio.web.app)

- ✅ **Hemsida-vy skapad** - Användare kan välja produkter för varje funktionskort
- ✅ **Data sparas till Firebase** - `organizations/hasselblad_common/settings/homepage`
- ✅ **useFeaturedContent hook finns** redan i `Hasselblads_Livs/src/hooks/useFeaturedContent.ts`

### Webshoppen (hasselbladslivs.se)

- ❌ Funktionskorten filtrerar på taggar, inte på valda produkter
- ❌ `useFeaturedContent` hook finns men används inte i Webshop.tsx

---

## 🔧 Uppgift

### 1. Uppdatera Webshop.tsx

**Fil:** `Hasselblads_Livs/src/pages/Webshop.tsx`

Lägg till `useFeaturedContent` och filtrera produkter baserat på valt kort:

```tsx
import { useFeaturedContent, type FeatureCardId } from "@/hooks/useFeaturedContent";

// I komponenten:
const { getCardProducts, featureCards, isLoading: isFeaturedLoading } = useFeaturedContent();

// När ett fokuskort är valt:
const filteredProducts = useMemo(() => {
    let result = products;
    
    // Om ett fokuskort är valt, filtrera till dess produkter
    if (filters.tag && ['godast', 'nyheter', 'isasong', 'erbjudanden'].includes(filters.tag)) {
        const cardId = filters.tag as FeatureCardId;
        const cardProductIds = getCardProducts(cardId);
        
        if (cardProductIds.length > 0) {
            // Visa endast produkter valda i PIM
            result = result.filter(p => cardProductIds.includes(p.id));
        } else {
            // Fallback: Om inga produkter valda, visa tomma eller alla med taggen
            result = result.filter(p => p.tags.includes(cardId === 'godast' ? 'sasong' : cardId));
        }
    }
    
    // ... övriga filter
    return result;
}, [products, filters, getCardProducts]);
```

### 2. Koppla fokuskort-klick till rätt filter

I `FocusFilterCards.tsx` eller motsvarande, se till att när användaren klickar på "Godast just nu" så sätts `filters.tag = 'godast'`.

### 3. Mappning mellan kort-ID och tagg

| Kort-ID | Firebase-nyckel | Fallback-tagg |
|---------|-----------------|---------------|
| Godast just nu | `godast` | `sasong` |
| Säsongspremiärer & Nyheter | `nyheter` | `nyhet` |
| Varor i säsong | `isasong` | `sasong` |
| Erbjudanden | `erbjudanden` | `erbjudande` |

---

## 📁 Firebase-struktur

**Path:** `organizations/hasselblad_common/settings/homepage`

```typescript
interface HomepageSettings {
    featuredVideo: {
        type: 'url' | 'uploaded';
        url: string;
        activeCardId: FeatureCardId;
        updatedAt: Date;
        updatedBy: string;
    };
    featureCards: {
        godast: {
            id: 'godast';
            title: 'Godast just nu';
            productIds: string[];  // <-- DENNA ARRAY INNEHÅLLER VALDA PRODUKT-IDs
            isActive: boolean;
            updatedAt: Date;
        };
        nyheter: { ... };
        isasong: { ... };
        erbjudanden: { ... };
    };
    updatedAt: Date;
}
```

---

## ✅ Acceptanskriterier

1. [ ] När användare väljer produkt i PIM → Webbutiken visar den produkten under rätt kort
2. [ ] Om inga produkter valda i PIM → Fallback till tagg-baserad filtrering
3. [ ] Realtidsuppdatering (Firebase onSnapshot) fungerar

---

## 🔗 Relevanta filer

- `Hasselblads_Livs/src/hooks/useFeaturedContent.ts` - Hook för att läsa inställningar
- `Hasselblads_Livs/src/pages/Webshop.tsx` - Huvudsidan som behöver uppdateras
- `Hasselblads_Livs/src/components/shop/FocusFilterCards.tsx` - Fokuskort-komponenten
- `Hasselblads-PIM/types.ts` - TypeScript-typer för HomepageSettings

---

## 🧪 Testfall

1. I PIM: Välj "Blodapelsin Tarocco" för "Godast just nu"
2. I Webbutik: Klicka på "Godast just nu"
3. Förväntat: Endast "Blodapelsin Tarocco" visas
