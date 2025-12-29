# Hasselblads Livs — Utvecklingslogg

> **Syfte:** Hålla alla agenter och utvecklare uppdaterade om vad som gjorts och vad som är nästa steg.

---

## 📅 2025-12-29

### ✅ Genomfört

#### 1. PIM-appen deployad LIVE

- **URL:** [hasselblad-bildstudio.web.app](https://hasselblad-bildstudio.web.app)
- Hostad på Firebase Hosting
- Fullt fungerande produkthantering

#### 2. UI-förbättringar på hemsidan

##### Hero-sektion — Dynamiskt bildspel

- Ersatte statisk hero-bild med animerat bildspel
- **17 optimerade butiksbilder** i `public/hero-slideshow/`
- Bildstorlek reducerad från 10-21 MB → 0.5-1 MB per bild (~95% reduktion)
- Slide-from-right animation med 5 sekunders intervall

##### Sidfot — Ultra-minimalistisk design

- Ersatte 4-kolumns layout med 2-raders design
- **Rad 1:** Hasselblads Livs • 031-123 45 67 • Frejagatan 9, Mölndal + sociala ikoner
- **Rad 2:** © 2025 Hasselblads Livs

##### Social sektion — Facebook-flöde

- Ersatte höger bildkarusell med Facebook-flöde
- Speglar Instagram-flödets layout och funktionalitet

##### Kategorier — Förenklad rubrik

- Tog bort "eyebrow"-text och beskrivning
- Endast rubriken "Kategorier" visas nu

##### Ny kategori — KÖTT

- Lade till KÖTT som 9:e kategori-kort
- Genererade bild med Gemini (art nouveau-stil)

### 📊 Uppdaterad produktdata

- **1362 produkter** totalt i Firebase (tidigare 810)
- **129 produkter** att bearbeta
- **1177 produkter** väntande/granskade
- **54 produkter** med status `completed` (tidigare 34)
- **2 produkter** med fel

### 🔧 Tekniska ändringar

- **23 filer ändrade** (156 tillägg, 207 borttagningar)
- Commit: `9198e35` — pushad till GitHub
- Originalmappen `public/Butiken 2/` (276 MB) exkluderad via `.gitignore`

---

## 📅 2025-12-12

### Sessionssammanfattning

**Mål:** Koppla ihop PIM-appen, hemsidan och WooCommerce.

---

### ✅ Genomfört denna session

#### 1. SYSTEM_CONTEXT.md skapad

- Gemensam kunskapsfil för båda repos
- Arkitekturöversikt, dataflöde, produktschema
- Regler för AI-assistenter
- Lagd i roten på båda repos

#### 2. Hemsida → Firebase (Firestore)

- Bytte från hårdkodade produkter till Firebase-fetch
- Skapade `useProducts.ts` hook med realtidsdata
- Uppdaterade Firestore-regler för publik läsning av produkter
- Deployade till Netlify — **LIVE**

#### 3. PIM → WooCommerce synk

- Skapade API-nycklar i WooCommerce
- Byggde `woocommerceService.ts` — REST API-wrapper
- Byggde `syncToWooCommerce.ts` — synk-logik
- Lade till "Synka till WooCommerce"-knapp i Dashboard
- Testade — **32 produkter synkade**

#### 4. Publicera/Avpublicera-funktion

- Lade till `is_published` fält i datamodellen
- Toggle på produktkort (öga-ikon)
- Toggle i produktdetalj (switch)
- Hemsidan filtrerar på `is_published === true`
- Migrerade befintliga completed-produkter

#### 5. Bildvisning fixad

- PIM visar nu samma fallback som hemsidan
- Fallback-kedja: cloudinaryUrl → finalImageUrl → initialImages → csvData['Bilder']

---

### 📊 Nuvarande status

| System | Status | URL |
| -------- | -------- | ----- |
| PIM-appen | **LIVE** | hasselblad-bildstudio.web.app |
| Hemsidan | **LIVE** | hasselblads-livs.netlify.app |
| WooCommerce | **LIVE** | hasselbladslivs.se/wp-admin |
| Firebase | **LIVE** | hasselblad-bildstudio |

#### Produktdata

- **810 produkter** i Firebase totalt
- **34 produkter** med status `completed`
- **24 produkter** publicerade på hemsidan (`is_published: true`)
- **32 produkter** synkade till WooCommerce

---

### 🔧 Kända issues

1. **"0 kr" på vissa produkter** — prisfältet saknas eller fel format
2. **Dubbletter** — "Banan Eko Fairtrade" visas två gånger
3. **Kategorifiltrering** — inte fullt testad

---

### 📋 Nästa steg (prioritetsordning)

1. ~~**Deploya PIM till Firebase Hosting**~~ ✅ KLART
2. **Fixa 0 kr-priser** — identifiera och uppdatera produkter
3. **Ta bort dubbletter** — rensa i Firebase
4. **Berika fler produkter** — 54/1362 är klara
5. **Koppla checkout** — React-hemsida → WooCommerce kassa
6. **Konfigurera betalning** — Klarna/Swish i WooCommerce

---

### 🔗 Viktiga filer

| Fil | Repo | Syfte |
| ----- | ------ | ------- |
| `SYSTEM_CONTEXT.md` | Båda | Gemensam systemöversikt |
| `src/hooks/useProducts.ts` | Hemsida | Firebase-fetch för produkter |
| `src/services/woocommerceService.ts` | PIM | WooCommerce API |
| `src/services/syncToWooCommerce.ts` | PIM | Synk-logik |
| `src/components/WooCommerceSync.tsx` | PIM | Synk-knapp UI |

---

### 🔐 Credentials (referens)

- **Firebase:** hasselblad-bildstudio (Firestore)
- **WooCommerce API:** PIM-synk nyckel skapad 2025-12-12
- **Netlify:** hasselblads-livs.netlify.app

---

### 💡 Beslut tagna

1. **Firestore, inte Realtime Database** — PIM använder Firestore
2. **Headless WooCommerce** — React-frontend, WooC bara för kassa
3. **is_published för publicering** — separerat från status-fältet
4. **Filter i kod, inte Firestore query** — undviker compound index

---

## Tidigare sessioner

Ingen logg före 2025-12-12.

---

## Så använder du denna logg

**Efter varje session:** Lägg till datum, vad som gjordes, nya issues, uppdatera "Nästa steg".

**Format:**

```markdown
## 📅 YYYY-MM-DD

### ✅ Genomfört
- Punkt 1
- Punkt 2

### 🐛 Nya issues
- Issue 1

### 📋 Uppdaterade nästa steg
- Steg 1
```
