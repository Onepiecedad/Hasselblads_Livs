# Hasselblads Livs — Utvecklingslogg

> **Syfte:** Hålla alla agenter och utvecklare uppdaterade om vad som gjorts och vad som är nästa steg.

---

## 📅 2026-01-03

### 🎨 DESIGN REFRESH — Brand Identity Update

Uppdaterade designsystemet för att matcha officiell varumärkesguide.

### ✅ Genomfört

#### 1. Primärfärg — Officiell Hasselblads-grön

- Bytte till exakt RGB(0, 106, 82) = HSL(166, 100%, 21%)
- Uppdaterade `--primary` och `--ring` i CSS-variabler

#### 2. Typografi — Overpass

- Bytte från Nunito Sans/Josefin Sans/Lato till **Overpass**
- Enligt typografiguiden: Overpass för all webtext
- Tog bort Great Vibes (dekorativ font)

#### 3. Header & Footer — Grön med vit text

- Bakgrund: `bg-primary/95` (grön med transparens)
- Text och ikoner: Vita (`text-white`)
- Logo: Vit symbol (original med CSS filter `brightness(0) invert(1)`)
- Footer: Matchande design utan copyright-rad

#### 4. Borttagna dekorativa rubriker

- "vår filosofi" (DeliverySection)
- "våra favoriter" (Home.tsx)
- "utforska butiken" (Home.tsx)
- "följ vår vardag" (InstagramFeed.tsx)
- Alla decorative-line element borttagna

#### 5. Scroll-to-Top — Mobil

- Ny komponent: `ScrollToTop.tsx`
- Flytande knapp i nedre högra hörnet
- Endast synlig på mobil (md:hidden)
- Dyker upp efter 400px scroll
- Mjuk animation och smooth scroll

#### 6. Layout — Bredare header/footer

- Tog bort `container mx-auto` för bredare layout
- Logo och info sitter mer åt vänster

### 🔧 Tekniska ändringar

- **2 commits** pushade till GitHub:
  - `284b19b` — UI Improvements: Green header/footer, white logo/text, and scroll-to-top button
  - `cc198d2` — Design system updates: new primary color, Overpass font, cleanup

### 📊 Påverkade filer

| Fil | Ändringar |
| --- | --------- |
| `src/index.css` | Ny primärfärg, Overpass font |
| `src/components/Navigation.tsx` | Grön header, vit logo/text |
| `src/components/Footer.tsx` | Grön footer, vit text, kompaktare |
| `src/components/ScrollToTop.tsx` | NY FIL - scroll-to-top knapp |
| `src/App.tsx` | Lade till ScrollToTop-komponent |
| `src/pages/Home.tsx` | Tog bort dekorativa rubriker |
| `src/components/sections/DeliverySection.tsx` | Tog bort "vår filosofi" |
| `src/components/sections/InstagramFeed.tsx` | Tog bort "följ vår vardag" |

---

## 📅 2026-01-02

### 🎨 DESIGNSTANDARD FASTSTÄLLD

**Home-sidan är nu referensstandard för hela webbplatsen.**

Alla andra sidor ska följa Home-sidans:

- **Typografi:** Great Vibes för dekorativa etiketter, system-sans för brödtext
- **Färgpalett:** Primary green (#2D4A3E), soft cream backgrounds, muted accents
- **Animationer:** Subtila hover-effekter, smooth transitions (300-500ms)
- **Layout:** Generös whitespace, max-w-7xl containers, responsive grid
- **Komponenter:** Rounded corners (2xl), soft shadows, parallax bakgrundselement
- **Känsla:** Premium, organisk, skandinavisk minimalism med värme

### ✅ Genomfört

#### 1. Hero-bildspel — Snabbare timing

- **Bildvisning:** 5 sekunder (tidigare 8 sekunder)
- **Fade-övergång:** 1.2 sekunder (tidigare 2 sekunder)
- Ger en mer dynamisk och engagerande upplevelse

#### 2. "Handplockat ur sortimentet" — Större kort

- Ökade container från `max-w-6xl` till `max-w-7xl`
- Ökade gap mellan kort: mobil 8, tablet 10, desktop 14
- Korten tar nu upp mer utrymme och syns bättre

#### 3. Cirkulär karusell — Justerat avstånd

- Ökade radius från 300px till 350px
- Bättre separation mellan kategori-korten

### 🔧 Tekniska ändringar

- **1 commit** pushad till GitHub:
  - `1223290` — Improve hero slideshow and card layouts

### 📊 Påverkade filer

| Fil | Ändringar |
| ----- | ----------- |
| `src/pages/Home.tsx` | Slideshow timing, container width, gaps, carousel radius |

---

## 📅 2025-12-31

### ✅ Genomfört

#### 1. Typografi — Dekorativa sektionsetiketter

- Återintroducerade **Great Vibes** font för sektionsetiketter
- Ökade storlek till `text-5xl md:text-7xl` för bättre proportion
- Påverkade sektioner: "våra favoriter", "utforska butiken", "vår filosofi", "följ vår vardag"

#### 2. Kategori-kort — Korrigerade etiketter

- Fixade felaktiga namn som inte matchade kortbilderna
- Bytte namn/bild-mappning för:
  - OST & CHARK
  - MEJERI & ÄGG
  - SKAFFERI
  - BRÖD
  - SÖTT & GOTT

#### 3. Hero-löv — Fixerad position

- Tog bort `animate-float` animation från det stora gröna lövet
- Lövet är nu statiskt istället för att flyta upp och ner

#### 4. Mobil-optimering

- **Header:** Visar nu "Hasselblads Livs" text på mobil (tidigare dold)
- **Parallax:** Dold på mobil (`hidden md:block`) för renare upplevelse
- Textjusteringar för bättre läsbarhet på små skärmar

#### 5. Sidlayout — Omorganiserad

- Flyttade **Sociala medier-sektionen** till botten av sidan
- Ny ordning: Hero → Vår filosofi → Våra favoriter → Kategorier → Sociala medier

#### 6. Footer — Kompaktare design

- Minskade padding från `py-16 md:py-24` till `py-8`
- Enrads-layout på desktop för kontaktinfo
- Mindre ikoner och marginaler
- Footer tar nu ~50% mindre plats

#### 7. WooCommerce Checkout — Buggfix

- Fixade hantering av flera artiklar vid checkout
- Använder nu `buildWooCommerceCartUrl` korrekt

#### 8. Routing — Refaktorering

- Refaktorerade `LegacyRedirects` från `<Routes>` till `useEffect`-hook
- Löste React-varning om nested routes

### 🔧 Tekniska ändringar

- **4 commits** pushade till GitHub:
  - `ca4f2c6` — Typography, category cards, and UI fixes
  - `9ac3069` — Mobile: Show brand name in header and hide parallax
  - `7beebf8` — Layout: Move social section to bottom, compact footer

### 📊 Påverkade filer

| Fil | Ändringar |
| ----- | ----------- |
| `src/index.css` | Great Vibes font återställd |
| `src/pages/Home.tsx` | Typografi, parallax, sektionsordning |
| `src/components/Navigation.tsx` | Mobil brand-text |
| `src/components/Footer.tsx` | Kompakt layout |
| `src/lib/categoryCards.ts` | Korrigerade namn/bild-mappning |
| `src/components/sections/DeliverySection.tsx` | Great Vibes typografi |
| `src/components/sections/InstagramFeed.tsx` | Great Vibes typografi |
| `src/lib/woocommerce.ts` | Multi-item checkout fix |
| `src/components/seo/LegacyRedirects.tsx` | useEffect refaktorering |

---

## 📅 2025-12-29

### ✅ Genomfört (2025-12-29)

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

### 🔧 Tekniska ändringar (2025-12-29)

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
