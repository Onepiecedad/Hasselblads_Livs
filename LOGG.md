# Hasselblads Livs — Utvecklingslogg

> **Syfte:** Hålla alla agenter och utvecklare uppdaterade om vad som gjorts och vad som är nästa steg.

---

## 📅 2026-01-29

### 🚀 Prestandaoptimering — Bilder & Code Splitting

Omfattande optimering för att förbättra laddningstider och responsivitet.

### ✅ Genomfört

#### 1. Bildoptimering — WebP-konvertering

- **Hero slideshow:** Konverterade 17 bilder från JPG till WebP (kvalitet 80)
- **Resultat:** 15 MB → 5.5 MB (**63% minskning**)
- **Största vinsten:** `gemini-hero.jpg` (3.8 MB → ~500 KB)
- Konverterade även `category-kott.png` till WebP för konsistens

#### 2. Lazy Slideshow Rendering

- **Före:** Alla 11 bilder renderades i DOM samtidigt med `loading="eager"`
- **Efter:** Endast 3 bilder (aktuell + föregående + nästa) renderas
- **Resultat:** 73% färre DOM-nodes, snabbare initial load

```tsx
// Endast ladda bilder som är synliga eller snart synliga
if (!isActive && !isPrevious && !isNext) return null;
```

#### 3. Code Splitting med React.lazy()

- **Före:** 820 KB monolitisk JavaScript-bundle
- **Efter:** Uppdelad i separata chunks som laddas on-demand

| Bundle | Storlek |
|--------|---------|
| `index.js` (core) | 384 KB |
| `Home.js` | 18 KB |
| `Webshop.js` | 60 KB |
| `About.js` | 4 KB |
| `Checkout.js` | 5 KB |

**Main bundle reduktion: 53%**

#### 4. Komponent-memoization

- Lade till `React.memo` på `ProductCard` för att undvika onödiga re-renders vid filter/scroll

### 📊 Resultat

| Mått | Före | Efter | Förbättring |
|------|------|-------|-------------|
| Hero-bilder | 15 MB | 5.5 MB | 63% mindre |
| Main JS bundle | 820 KB | 384 KB | 53% mindre |
| DOM-bilder (slideshow) | 11 st | 3 st | 73% färre |

### 🔧 Tekniska ändringar

| Fil | Ändring |
|-----|---------|
| `src/pages/Home.tsx` | WebP-bilder, lazy slideshow rendering |
| `src/App.tsx` | React.lazy() för alla routes, Suspense boundary |
| `src/components/shop/ProductCard.tsx` | React.memo wrapper |
| `src/lib/categoryCards.ts` | WebP import for category-kott |
| `public/hero-slideshow/*.webp` | 17 nya WebP-bilder |

### 💡 Nästa steg (valfritt)

1. Optimera `categoryCards`-bundlen (335 KB) — flytta bilder till public
2. React.memo på fler komponenter (FilterCards)
3. Virtualisering för produktlistan vid 100+ produkter

---

## 📅 2026-01-25

### 🔧 WooCommerce MCP Integration & WordPress API Proxy

Fixade WooCommerce MCP-integration så att AI-assistenter kan hantera produkter och ordrar direkt. Lösningen krävde en serverless proxy-funktion på Netlify.

### ✅ Genomfört

#### 1. `/etc/hosts` — Lokalt DNS-problem

- **Symptom:** Användaren såg gamla WordPress-sidan istället för nya React-appen på `hasselbladslivs.se`
- **Orsak:** Lokala `/etc/hosts`-filen hade manuell mappning till WordPress-IP (`199.16.172.188`)
- **Åtgärd:** Rensade hosts-filen från hasselbladslivs-rader
- **Resultat:** Domänen pekar nu korrekt på Netlify (`75.2.60.5`)

#### 2. WooCommerce MCP — Konfigurationsfix

- **Problem:** MCP-servern kunde inte ansluta till WooCommerce
- **Orsak 1:** URL i `mcp_config.json` saknade fullständig sökväg
- **Åtgärd:** Ändrade från `https://hasselbladslivs.se` till `https://hasselbladslivs.se/wp-json/woocommerce/mcp`
- **Orsak 2:** Netlify-proxyn vidarebefordrade inte `/wp-json/*` till WordPress
- **Resultat:** MCP-initalisering returnerar nu korrekt JSON-RPC-svar

#### 3. Netlify WordPress Proxy — Serverless Function

- **Problem:** Netlify `[[redirects]]` med `headers` fungerade inte för externa proxies
- **Orsak:** SSL-certifikat på Pressable (`199.16.172.188`) är utfärdat för `pressable.com`, inte `hasselbladslivs.se`
- **Lösning:** Skapade serverless function med Node.js `https` och `rejectUnauthorized: false`

**Ny fil:** `netlify/functions/wordpress-proxy.ts`

```typescript
// Proxar /wp-json/* och /wp-admin/* till Pressable WordPress-backend
// Använder rejectUnauthorized: false för att hantera SSL-mismatch
```

#### 4. `_redirects` — Ordning spelar roll

- **Problem:** SPA catch-all (`/* /index.html 200`) stod först och fångade alla requests
- **Åtgärd:** Lade till WordPress-proxy redirects FÖRE SPA-fallback:

```
/wp-json/*  /.netlify/functions/wordpress-proxy/wp-json/:splat  200
/wp-admin/* /.netlify/functions/wordpress-proxy/wp-admin/:splat 200
/*          /index.html   200
```

### 🔧 Tekniska ändringar

| Fil | Ändring |
|-----|---------|
| `~/.gemini/antigravity/mcp_config.json` | Uppdaterad WP_API_URL till fullständig MCP-endpoint |
| `/etc/hosts` | Rensad från hasselbladslivs-mappningar |
| `netlify/functions/wordpress-proxy.ts` | NY FIL — Serverless proxy med SSL-bypass |
| `public/_redirects` | Lade till WordPress proxy-redirects före SPA-fallback |
| `netlify.toml` | Uppdaterad kommentar om proxy-arkitektur |
| `package.json` | Installerade `@netlify/functions` |

### 📊 Resultat

| System | Status |
|--------|--------|
| `hasselbladslivs.se` → Netlify React-app | ✅ Fungerar |
| `hasselbladslivs.se/wp-json/*` → WordPress API | ✅ Proxas korrekt |
| `hasselbladslivs.se/wp-admin/*` → WordPress Admin | ✅ Proxas korrekt |
| WooCommerce MCP | ✅ Fungerar för AI-assistenter |
| WooCommerce REST API | ✅ Tillgängligt via proxy |

### 💡 Lärdomar

- **Netlify `[[redirects]]` med headers** stödjer INTE proxy till externa IP-adresser med custom headers på alla planer
- **Ordning i `_redirects`** är kritisk — första träffen vinner
- **SSL-certifikat mismatch** kräver serverless function med `rejectUnauthorized: false`
- **`/etc/hosts`** kan override DNS och orsaka förvirrande beteende

### 🔗 MCP-konfiguration för andra agenter

```json
{
  "woocommerce": {
    "command": "npx",
    "args": ["-y", "@automattic/mcp-wordpress-remote@latest"],
    "env": {
      "WP_API_URL": "https://hasselbladslivs.se/wp-json/woocommerce/mcp",
      "CUSTOM_HEADERS": "{\"X-MCP-API-Key\": \"ck_xxx:cs_xxx\"}"
    }
  }
}
```

---

## 📅 2026-01-23

### ✅ PIM Hemsida-inställningar — Integration Verifierad

Verifierat att webbutikens funktionskort ("Handplockat") nu korrekt visar produkter som valts i PIM-appens Hemsida-vy.

#### Vad som fungerar

| Funktion | Status |
|----------|--------|
| Klick på "Godast just nu" → Visar PIM-valda produkter | ✅ Fungerar |
| Fallback till tagg-filtrering om inga produkter valda | ✅ Implementerat |
| Realtidsuppdatering via Firebase onSnapshot | ✅ Implementerat |

#### Teknisk Implementation

- **Hook:** `useFeaturedContent.ts` — Prenumererar på `organizations/hasselblad_common/settings/homepage`
- **Filtrering:** `Webshop.tsx` rad 204-220 — Använder `getCardProducts()` för att hämta PIM-valda produkter
- **Mappning:** `focusCards.ts` — Definierar filterValue och fallbackTag för varje kort

#### Testresultat

- **Kort:** "Godast just nu" (`?tag=godast`)
- **Visade produkter:** Blodapelsin Dracula (59 kr/kg), Blodapelsin Tarocco (99 kr/kg)
- **Källa:** PIM-appens Hemsida-inställningar

#### Uppdaterade filer

| Fil | Ändring |
|-----|---------|
| `public/HEMSIDA_FUNKTIONSKORT_INTEGRATION.md` | Markerat alla acceptanskriterier som avklarade |

---

### 🎨 Instagram Embed — Dölj Header/Footer

Fixade Instagram-inbäddningen i "Aktuellt"-sektionen för att endast visa videoinnehållet utan Instagrams UI-element.

### ✅ Genomfört

#### 1. Problem identifierat

- **Symptom:** Instagram-embeds visade profilbild, användarnamn (header) samt likes, kommentarer och "View more on Instagram" (footer)
- **Utmaning:** Instagram tillåter inte styling av iframe-innehåll via CSS (cross-origin security)
- **Lösning:** Kombinerad `clip-path` + pseudo-element overlay

#### 2. Teknisk lösning

```css
.scaled-social-media-wrapper {
    overflow: hidden;
    clip-path: inset(0 0 0 0);
}

.scaled-social-media-wrapper::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 160px;
    background: var(--color-background);
    z-index: 10;
}
```

- **Clip-path:** Möjliggör att pseudo-element renderas korrekt trots `overflow: hidden`
- **Pseudo-element:** 160px hög overlay som täcker footern
- **Header:** Redan dold via negativ `top`-positionering av iframe

#### 3. Resultat

| **Före** | **Efter** |
|----------|-----------|
| ❌ Header synlig (profilbild, användarnamn) | ✅ Header helt dold |
| ❌ Footer synlig (likes, kommentarer, "View more") | ✅ Footer helt dold |
| ❌ Distraherande Instagram UI | ✅ Rent, professionellt utseende |

### 🔧 Tekniska ändringar

| Fil | Ändringar |
|-----|-----------|
| `src/index.css` | Lade till `clip-path` och `::after` pseudo-element för `.scaled-social-media-wrapper` |

### 💡 Lärdomar

- **Cross-origin iframes** kan inte stylas direkt — kräver kreativa lösningar som clipping/overlays
- **CSS `clip-path: inset(0 0 0 0)`** behövs för att pseudo-elements ska renderas ovanpå `overflow: hidden` containers
- **Negativ positionering** av iframe är effektivt för att dölja headers

---

## 📅 2026-01-15 (Kvällspass)

### 🎨 Webshop Redesign — Art Nouveau & Parallax

Omfattande uppdatering av webbshoppens design för att matcha hemsidans "Art Nouveau"-estetik och eleganta känsla.

### ✅ Genomfört

#### 1. Atmosfärisk Design

- **Parallax-effekt:** Implementerat samma mjuka parallax-system som startsidan med flytande "orbs" och löv som rör sig vid scrollning.
- **Grain-effekt:** Lade till den karaktäristiska korniga texturen och den varma bakgrundsfärgen `#fdfcf9`.
- **Typografi:** Uppdaterat rubriker och brödtext med mjukare, mer elegant typografi och justerad letter-spacing.

#### 2. Förbättrade Produktkort

- **"Svävande" design:** Tog bort hårda kantlinjer (borders) och ersatte med mjuka skuggor och en semitransparent glaseffekt (`backdrop-blur-sm`).
- **Bildhantering:** Löste problem där produktbilder beskars felaktigt genom att byta till `object-contain` och lägga till padding (`p-4`). Nu syns hela produkten snyggt inramad.
- **Interaktion:** Mjukare hover-effekter både på kortet (lyft + skugga) och på "Lägg i varukorg"-knappen.

#### 3. Förfinad UX/UI

- **Filter & Sök:** Moderniserade filter-chips och sökfält med rundade hörn och en renare, mindre "app-liknande" design.
- **Responsivitet:** Verifierat och finjusterat layouten för mobilvy (390px) för att säkerställa att upplevelsen är lika premium på små skärmar.

### 🔧 Tekniska ändringar

- **Filer uppdaterade:**
  - `src/pages/Webshop.tsx`: Huvudlayout, parallax-logik, grain-effekt.
  - `src/components/shop/ProductCard.tsx`: Ny kortdesign, bildfixar.
  - `src/components/shop/FilterChips.tsx`: Ny styling för filterknappar.

#### 4. Buggfixar & Features

- **Sortering:** Fixade sorteringsproblemet där svenska tecken (Å, Ä, Ö) inte respekterades. Bytt till `Intl.Collator` för korrekt svensk alfabetisk ordning (A-Ö).
- **Scroll-to-Top:** Implementerat en ny, elegant "Back to Top"-knapp med glasmorphism-design. Den är nu synlig på alla enheter (både mobil och desktop) och dyker upp mjukt när man scrollat ner.
- **Mobil Grid:** Uppdaterat webshoppens layout på mobil till **2 kolumner** (istället för 1) för bättre överblick. Anpassat produktkorten med mindre textstorlek och padding för att passa den nya layouten utan att kännas trånga.

---

## 📅 2026-01-15

### 🔥 Kritisk Fix — Webshop Nere

Webshoppen slutade visa produkter med felmeddelandet "Kunde inte ladda produkter. Missing or insufficient permissions."

### ✅ Genomfört

#### 1. Identifierade problemet

- **Symptom:** Webshopen visade "Missing or insufficient permissions" på både localhost och produktion
- **Orsak:** Firestore-reglerna krävde autentisering (`request.auth != null`) för att läsa produkter, men webshop-besökare är oinloggade
- **Analys:** Reglerna hade troligen ändrats eller ursprungligen satts upp för autentiserade användare

#### 2. Uppdaterade Firestore Security Rules

Lade till ny regel som tillåter **publik läsning** av produkter:

```javascript
// PUBLIK LÄSNING av produkter för webshoppen
match /organizations/hasselblad_common/projects/{project}/products/{productId} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

#### 3. Skapade lokal utvecklingsmiljö

- Skapade `.env.local` med Firebase API-nycklar för lokal utveckling
- Tidigare saknades denna fil, vilket gjorde att lokalt dev-läge inte fungerade

### 🔧 Tekniska ändringar

| Ändring | Detaljer |
|---------|----------|
| Firestore Rules | Publicerade uppdaterade regler via Firebase Console |
| `.env.local` | Ny fil med `VITE_FIREBASE_API_KEY` och övriga Firebase-variabler |

### 📊 Påverkade system

| System | Status |
|--------|--------|
| Webshop (hasselbladslivs.se) | ✅ Fungerar igen |
| Webshop (localhost:8080) | ✅ Fungerar igen |
| Firebase Firestore | ✅ Uppdaterade regler publicerade |

### 💡 Lärdomar

- **Firestore-regler** är en vanlig orsak till "permissions"-fel — kontrollera alltid först
- **Lokala .env-filer** behövs för utveckling även om produktion fungerar (Netlify har egna env vars)
- **Test-läge regler** i Firebase kan gå ut efter 30 dagar om man använder default-regler

---

## 📅 2026-01-14

### 🌐 DNS & Kontaktuppgifter

Korrigerat telefonnummer och postkod på hela webbplatsen samt pekat om domänen `hasselbladslivs.se` korrekt i Loopia.

### ✅ Genomfört

#### 1. Uppdaterade kontaktuppgifter

- **Nytt telefonnummer:** `031-87 63 50` (tidigare 031-27 27 92)
- **Ny postkod:** `431 44` (tidigare 431 45)
- **Uppdaterade filer:**
  - `src/pages/CustomerService.tsx` (Text, länkar och Schema.org data)
  - `src/pages/Checkout.tsx` (Text och länkar)
  - `src/components/Footer.tsx` (Schema.org data)

#### 2. DNS-ompekning (Loopia -> Netlify)

- **Problem:** Loopia pekade fortfarande på gamla IP-adresser (`199.16...`) och hade wildcard-pekare (`*`), vilket gjorde att Netlify inte kunde verifiera domänen och utfärda SSL-certifikat.
- **Åtgärd:**
  - Tog bort gamla A-pekare för `@`, `www` och `*`.
  - Lade till nytt A-record för `@` -> `75.2.60.5` (Netlifys load balancer).
  - Lade till nytt CNAME-record för `www` -> `hasselblads-livs.netlify.app`.
- **Resultat:** DNS är nu korrekt konfigurerat och SSL kommer aktiveras automatiskt när propageringen är klar.

### 🔧 Tekniska ändringar

- **1 commit** pushad till GitHub:
  - `6b236c9` — Update phone number to 031-87 63 50 and postal code to 431 44

---

## 📅 2026-01-04

### 🎨 Startsida & Leverans-refinement

Finjusterade startsidans puff-kort, kategorikarusell och lanserade en ny leverans-teaser med cykel-illustration.

### ✅ Genomfört

#### 1. Puff-kort (Handplockat ur sortimentet) — Designfix

- **Proportioner:** Justerade kortens aspect ratio till **3:2** (landscape) för att matcha originaldesignen bättre.
- **Text-positionering:** Individuell placering för varje kort för att undvika krockar med illustrationerna (vänsterkorten centrerade, högerkorten vänsterjusterade).
- **Läsbarhet:** Större text (upp till `text-4xl`) i Hasselblads-grön med subtila drop-shadows mot ljus bakgrund.
- **Layout:** Tog bort versaler för en mjukare och mer modern känsla.

#### 2. Kategori-karusell — Större kort

- **Storlek:** Ökade kortstorleken i den cirkulära 3D-karusellen från 200px till **220px** (desktop) och 130px till **150px** (mobil).
- **Visibilitet:** Ger bättre fokus på de art nouveau-inspirerade illustrationerna.

#### 3. Ny Leverans-sektion — "Snart utkörning"

- **Illustration:** Implementerade den nya cykel-illustrationen (`cykel.webp`) i storlek.
- **Budskap:** Kombinerade företagets värderingar (Kunskap, Omsorg, Glädje) med en teaser: *"Snart har vi även utkörning!"*.
- **Design:** Balanserad layout med stor bild till vänster och personlig, kursiv text till höger.

#### 4. Kontakt-sida & Sidkonsistens

- **Navigation:** Bytte namn från "Kundservice" → "Kontakt"
- **Hero-sektion:** Ny bakgrundsbild (Leverans1-frukt.jpg) utan text
- **Kontaktinfo:** Telefon, e-post, adress, öppettider med ikoner
- **Kontaktformulär:** Elegant kort med namn, e-post, telefon (valfritt), meddelande
- **Google Maps:** Inbäddad karta till Frejagatan 9
- **Borttaget:** FAQ-sektion (10 frågor), köpvillkor/leveranspolicy-kort

#### 2. Om oss-sidan — Rensad

- Borttog kontaktsektion och karta (finns nu på Kontakt-sidan)
- Sidan slutar nu med bildgalleriet
- Textfix: "Vi gillar människor och det gör att..." (inte "som gör att")

#### 3. Enhetliga Gradienter

- Leverans & Kontakt: Samma lättare gradient (`from-black/50 via-black/20 to-transparent`)
- Ger ljusare, luftigare hero-bilder

#### 4. Hero-storlekar synkade

- Alla sidor har nu `h-[500px] md:h-[650px]` (utom Checkout som är mindre)

### 🔧 Tekniska ändringar

- **2 commits** pushade till GitHub:
  - `4202e51` — Uppdaterad design för konsistens på alla sidor
  - `f7cb621` — Förenklad Kontakt-sida och enhetlig design

### 📊 Påverkade filer

| `src/pages/Home.tsx` | Slideshow timing, container width, gaps, carousel radius, puff card refinements |
| `src/components/ui/circular-gallery.tsx` | Ökad kortstorlek |
| `src/components/sections/DeliverySection.tsx` | NY DESIGN: Cykel-illustration och leverans-teaser |
| `src/components/Navigation.tsx` | "Kundservice" → "Kontakt" |
| `src/pages/CustomerService.tsx` | Helt omskriven - clean kontaktsida |
| `src/pages/About.tsx` | Borttog kontaktsektion/karta, textfix |
| `src/pages/Delivery.tsx` | Lättare gradient |

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
