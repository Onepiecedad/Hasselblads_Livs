# 🎬 Implementeringsplan: Hemsideinställningar

**Skapad:** 2026-01-23  
**Status:** Planering  
**Uppskattad tid:** 6-8 timmar

---

## 📋 Projektöversikt

### Bakgrund

Axel behöver kunna uppdatera hemsidans "Aktuellt"-sektion och de fyra funktionskorten ("Handplockat") utan att behöva ändra kod eller göra en ny deploy. Lösningen ska vara mobilvänlig så att uppdateringar kan göras direkt från telefonen.

### Mål

1. **Video-hantering**: Ladda upp video eller klistra in URL (Instagram, YouTube, etc.)
2. **Aktivt kort**: Koppla videon till ett av de 4 funktionskorten
3. **Produktval**: Välja vilka produkter som visas för respektive funktionskort
4. **Realtidsuppdatering**: Ändringar syns direkt på hemsidan utan deploy

---

## 🏗️ Arkitektur

### Systemöversikt

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   PIM-appen     │ →   │    Firebase     │ ←   │   Hemsidan      │
│   (Admin)       │     │    Firestore    │     │   (Kunder)      │
│                 │     │                 │     │                 │
│ Hemsideinställ- │     │ /settings/      │     │ Visar video +   │
│ ningar-vy       │     │ homepage        │     │ filtrerar prod. │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│   Cloudinary    │                           │   Webbutik      │
│   (Video-lagr.) │                           │   (?focus=X)    │
└─────────────────┘                           └─────────────────┘
```

### Datamodell (Firebase Firestore)

**Sökväg:** `organizations/hasselblad_common/settings/homepage`

```typescript
interface HomepageSettings {
  // Aktuellt-video
  featuredVideo: {
    type: 'url' | 'uploaded';
    url: string;                    // Instagram-länk eller Cloudinary-URL
    thumbnailUrl?: string;          // Tumnagel för preview
    activeCardId: FeatureCardId;    // Vilket kort videon hänvisar till
    updatedAt: Timestamp;
    updatedBy: string;              // Användar-email
  };

  // De 4 funktionskorten
  featureCards: {
    godast: FeatureCard;
    nyheter: FeatureCard;
    isasong: FeatureCard;
    erbjudanden: FeatureCard;
  };

  updatedAt: Timestamp;
}

interface FeatureCard {
  id: FeatureCardId;
  title: string;
  productIds: string[];           // Lista med produkt-IDs
  isActive: boolean;              // Sant om detta kort är "aktivt"
  updatedAt: Timestamp;
}

type FeatureCardId = 'godast' | 'nyheter' | 'isasong' | 'erbjudanden';
```

---

## 📝 Implementeringssteg

### Fas 1: Firebase & Grundstruktur (1-2 tim)

#### 1.1 Skapa Firestore-dokumentstruktur

- [ ] Definiera TypeScript-types i `types.ts`
- [ ] Skapa initialt dokument i Firestore
- [ ] Uppdatera Firestore-regler för läs/skriv-behörighet

**Filer att skapa/ändra:**

```
/types.ts                         # Lägg till HomepageSettings-types
/firestore.rules                  # Uppdatera regler
```

#### 1.2 Skapa PIM-app hooks

- [ ] `useHomepageSettings.ts` — Hook för att läsa/skriva inställningar

**Filer att skapa:**

```
/hooks/useHomepageSettings.ts
```

---

### Fas 2: PIM-app — Hemsideinställningar-vy (3-4 tim)

#### 2.1 Skapa huvudkomponent

- [ ] Ny vy: `HomepageSettingsView.tsx`
- [ ] Lägg till i navigationsmenyn
- [ ] Responsiv layout (mobilvänlig)

**Filer att skapa:**

```
/components/HomepageSettingsView.tsx
```

#### 2.2 Video-sektion

- [ ] Toggle mellan URL och Ladda upp
- [ ] URL-input med validering (Instagram, YouTube, etc.)
- [ ] Video-uppladdning till Cloudinary
- [ ] Video-preview
- [ ] Dropdown för aktivt kort

**Komponenter:**

```tsx
<VideoSourceToggle />       // URL eller Ladda upp
<VideoUrlInput />           // För Instagram/YouTube-länkar
<VideoUploader />           // Cloudinary-uppladdning
<VideoPreview />            // Visa nuvarande video
<ActiveCardSelector />      // Välj vilket kort videon gäller
```

#### 2.3 Funktionskort-sektion

- [ ] 4 kortkomponenter med produktväljare
- [ ] Multi-select för produkter (sökbar lista)
- [ ] Visuell indikator för aktivt kort
- [ ] Spara-knapp per kort eller global

**Komponenter:**

```tsx
<FeatureCardEditor cardId="godast" />
<FeatureCardEditor cardId="nyheter" />
<FeatureCardEditor cardId="isasong" />
<FeatureCardEditor cardId="erbjudanden" />

<ProductMultiSelect />      // Återanvändbar produktväljare
```

#### 2.4 Navigation och integration

- [ ] Lägg till "Hemsida" i NavigationMenu.tsx
- [ ] Route i App.tsx

---

### Fas 3: Hemsidan — Läsa inställningar (1-2 tim)

#### 3.1 Skapa hook för hemsideinställningar

- [ ] `useFeaturedContent.ts` — Lyssnar på Firebase i realtid

**Filer att skapa:**

```
/Hasselblads_Livs/src/hooks/useFeaturedContent.ts
```

#### 3.2 Uppdatera Aktuellt-sektion

- [ ] Modifiera eller byt ut `InstagramFeed.tsx`
- [ ] Visa video från Firebase
- [ ] Länka till rätt funktionskort

**Filer att ändra:**

```
/Hasselblads_Livs/src/components/sections/InstagramFeed.tsx  
  → Byt namn till FeaturedContent.tsx eller uppdatera
```

#### 3.3 Uppdatera funktionskort

- [ ] Korten ska länka till webbutik med rätt filter
- [ ] Visuell highlight på aktivt kort (valfritt)

**Filer att ändra:**

```
/Hasselblads_Livs/src/pages/Home.tsx
```

---

### Fas 4: Webbutik — Produktfiltrering (1 tim)

#### 4.1 Läs filter från URL

- [ ] Parsa `?focus=godast` parametern
- [ ] Hämta produktlistan från Firebase

#### 4.2 Visa rätt produkter

- [ ] Filtrera produktlistan baserat på kortets productIds
- [ ] Fallback till alla produkter om listan är tom

**Filer att ändra:**

```
/Hasselblads_Livs/src/pages/Webshop.tsx
/Hasselblads_Livs/src/hooks/useProducts.ts
```

---

### Fas 5: Test & Optimering (1 tim)

- [ ] Testa video-uppladdning från mobil
- [ ] Testa URL-inmatning (Instagram, YouTube)
- [ ] Verifiera realtidsuppdatering på hemsidan
- [ ] Testa produktfiltrering i webbutiken
- [ ] Responsivitet på mobil och desktop

---

## 📁 Filöversikt

### Nya filer

| Fil | Beskrivning |
|-----|-------------|
| `/hooks/useHomepageSettings.ts` | Hook för Firebase-kommunikation |
| `/components/HomepageSettingsView.tsx` | Huvudvy för inställningar |
| `/components/homepage/VideoSection.tsx` | Video-hantering UI |
| `/components/homepage/FeatureCardEditor.tsx` | Redigera funktionskort |
| `/components/homepage/ProductMultiSelect.tsx` | Produktväljare |
| `/Hasselblads_Livs/src/hooks/useFeaturedContent.ts` | Läsa inställningar på hemsidan |

### Ändrade filer

| Fil | Ändring |
|-----|---------|
| `/types.ts` | Lägg till HomepageSettings-types |
| `/firestore.rules` | Lägg till regler för settings/homepage |
| `/components/NavigationMenu.tsx` | Lägg till "Hemsida"-länk |
| `/App.tsx` | Lägg till route för inställningar |
| `/Hasselblads_Livs/src/pages/Home.tsx` | Använd dynamiskt innehåll |
| `/Hasselblads_Livs/src/pages/Webshop.tsx` | Lägg till focus-filtrering |

---

## 🔧 Tekniska detaljer

### Video-hantering

**Instagram Embed:**

```tsx
// Instagram Reel-URL → Embed
const getInstagramEmbed = (url: string) => {
  const reelId = url.match(/reel\/([A-Za-z0-9_-]+)/)?.[1];
  return `https://www.instagram.com/reel/${reelId}/embed`;
};
```

**Cloudinary Video Upload:**

```tsx
// Använd befintlig Cloudinary-integration
// Ladda upp till folder: "hasselblad/homepage/"
```

### Produktväljare

```tsx
// Hämta alla publicerade produkter
const { products } = useProductStore();
const publishedProducts = products.filter(p => p.is_published);

// Multi-select med sök
<ProductMultiSelect
  selectedIds={card.productIds}
  onChange={(ids) => updateCard(cardId, { productIds: ids })}
/>
```

### Realtidsuppdatering

```tsx
// Hemsidan lyssnar med onSnapshot
onSnapshot(
  doc(db, 'organizations/hasselblad_common/settings/homepage'),
  (snapshot) => {
    setSettings(snapshot.data() as HomepageSettings);
  }
);
```

---

## ✅ Acceptanskriterier

### Video

- [ ] Kan klistra in Instagram/YouTube-länk
- [ ] Kan ladda upp video från telefon
- [ ] Videon visas på hemsidan inom 5 sekunder efter spara
- [ ] Kan välja vilket funktionskort videon gäller

### Funktionskort

- [ ] Kan lägga till/ta bort produkter för varje kort
- [ ] Sökbar produktlista
- [ ] Visuell preview av valda produkter
- [ ] Ändringar sparas korrekt

### Hemsida

- [ ] Visar korrekt video
- [ ] Korten länkar till rätt produkter
- [ ] Aktivt kort har visuell markering (valfritt)

### Webbutik

- [ ] `?focus=godast` visar rätt produkter
- [ ] Fallback till alla om inga produkter är valda

---

## 🚀 Nästa steg

1. **Granska planen** — Godkänn eller föreslå ändringar
2. **Starta Fas 1** — Firebase-struktur och types
3. **Iterera** — Bygga och testa stegvis

---

*Uppdaterad: 2026-01-23*
