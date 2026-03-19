# Hasselblads Livs – Arkitektur

## Översikt

Det här projektet är den kundvända sajten för Hasselblads Livs. Appen är byggd i React/Vite och kombinerar tre huvuddelar:

- Innehållssajt med startsida, om-sida, leverans och kundservice
- Webbutik med produktfilter, snabbvy, portionsval och varukorg
- Pre-checkout i React som lämnar över till WooCommerce för slutlig betalning

Produkter och hemsideinnehåll hämtas från Firebase/Firestore i realtid. Slutlig orderläggning sker i WooCommerce via Netlify Functions.

## Stack

- React 18 + TypeScript
- Vite
- React Router
- Tailwind CSS + shadcn/ui
- Firebase Auth
- Firestore
- Netlify Functions
- WooCommerce / WordPress

## Huvudflöden

### 1. Produktdata

Produktkatalogen kommer från Firestore via [`useProducts.ts`](./src/hooks/useProducts.ts).

- Källa: `organizations/hasselblad_common/projects/default/products`
- Endast publicerade produkter visas
- PIM-data mappas till webbens interna `Product`-typ
- Kategorier, underkategorier, ursprungsland, prislogik, portionsstöd och multiköp normaliseras i hooken

Den centrala produktmodellen finns i [`products.ts`](./src/lib/products.ts).

### 2. Hemsidans feature-cards och video

Startsidans “Godast just nu”, “Nyheter”, “I säsong” och “Erbjudanden” styrs från Firestore via [`useFeaturedContent.ts`](./src/hooks/useFeaturedContent.ts).

- Varje kort kan ha produkt-ID:n
- Varje kort kan ha egen video
- Legacy-fält för global featured video stöds fortfarande

Det här används både på startsidan och i webshopens filterflöde.

### 3. Varukorg

Varukorgen hanteras i React Context via [`CartContext.tsx`](./src/context/CartContext.tsx).

- Varukorgen sparas i `localStorage`
- Priser uppdateras mot live produktdata när det går
- Multiköp räknas om dynamiskt i klienten
- Mix-and-match-grupper stöds
- Portionsvarianter och viktbaserade rader stöds

Delade typer och konstanter ligger i:

- [`cartContextShared.ts`](./src/context/cartContextShared.ts)
- [`cartConstants.ts`](./src/context/cartConstants.ts)
- [`useCart.ts`](./src/context/useCart.ts)

### 4. Leverans och pre-checkout

Kassan i React är ett pre-checkout-steg i [`Checkout.tsx`](./src/pages/Checkout.tsx).

Användaren väljer:

- Hemleverans eller upphämtning
- Adress om hemleverans
- Leveransdag
- Eventuell kommentar

Adress- och leveranslogik ligger i [`deliveryAreas.ts`](./src/lib/deliveryAreas.ts).

- Godkända områden: Solängen och Malevik
- Leveransdagar: måndag till fredag
- Deadline: dagen innan kl 24:00

Fraktregler ligger i [`shipping.ts`](./src/lib/shipping.ts).

- Fri hemleverans från 600 kr
- Annars 49 kr
- Upphämtning är gratis

### 5. WooCommerce-handoff

React äger inte den slutliga betalningen. När pre-checkout är klar skickas användaren vidare till WooCommerce via [`woocommerce.ts`](./src/lib/woocommerce.ts).

Två flöden finns:

- Gäst-checkout via [`wc-add-to-cart.ts`](./netlify/functions/wc-add-to-cart.ts)
- Autentiserad checkout via [`checkout-session.ts`](./netlify/functions/checkout-session.ts)

Funktionerna gör i praktiken detta:

- etablerar eller återanvänder WordPress/WooCommerce-session
- lägger till produkter i WooCommerce-varukorgen server-side
- sätter relevanta cookies i användarens browser
- skickar vidare användaren till `/betalning`

WordPress/WooCommerce ligger bakom en proxy i [`wordpress-proxy.ts`](./netlify/functions/wordpress-proxy.ts), som även hanterar vissa checkout-anpassningar och path-alias för `/betalning`.

## Routing

Routing definieras i [`App.tsx`](./src/App.tsx).

Aktiva kundvägar:

- `/` – startsida
- `/webbutik` – produktkatalog
- `/hemleverans` – leveranssida
- `/butiken` – alias till om-sidan
- `/om-oss` – om-sida
- `/kundservice` – kundservice
- `/kassa` – React pre-checkout
- `/intern/checkout-verifiering` – intern verifieringssida
- `/kopvillkor` – pekar för närvarande till `About`
- `/hallbarhet` – pekar för närvarande till `About`

WooCommerce checkout exponeras externt under `/betalning` via proxy/redirect-konfiguration, inte via React Router.

## Layout och providers

Appens toppnivå finns i [`App.tsx`](./src/App.tsx).

Viktiga providers:

- `QueryClientProvider`
- `TooltipProvider`
- `AuthProvider`
- `CartProvider`
- `BrowserRouter`
- `ErrorBoundary`

Root-layouten finns i [`RootLayout.tsx`](./src/layouts/RootLayout.tsx) och innehåller navigation, skip-link, main-region och footer.

## Viktiga mappar

```text
src/
├── components/
│   ├── auth/          # Inloggning
│   ├── seo/           # Schema och redirects
│   ├── sections/      # Innehållssektioner
│   ├── shop/          # Webshop och varukorg
│   └── ui/            # UI-byggstenar
├── context/           # Auth, cart och delade cart-helpers
├── hooks/             # Datahämtning och UI-hooks
├── layouts/           # RootLayout
├── lib/               # Domänlogik och integrationer
└── pages/             # Route-komponenter
```

Serverless-funktioner:

```text
netlify/functions/
├── checkout-session.ts
├── wc-add-to-cart.ts
├── wordpress-proxy.ts
├── woo-proxy.js
├── instagram-feed.js
└── get-wallet-balance.js
```

## Domänlogik som är viktig att förstå

### Produktkategorier

Kategorisystemet är bredare än i den äldre dokumentationen. Nuvarande huvudkategorier definieras i [`products.ts`](./src/lib/products.ts), till exempel:

- `frukt-gront`
- `agg-mejeri`
- `skafferi`
- `ost-chark`
- `konfektyr`
- `brod`
- `kott`
- `snacks-dryck`
- `notter-torkad-frukt`
- `farskvaror`
- `hogtidsvaror`
- `ovrigt`

### Multiköp

Multiköp beräknas i frontend på radnivå och gruppnivå.

- `calculateLineTotal` optimerar billigaste kombination av erbjudanden
- `getAutoOffer` används för visning
- `inferMultiBuyGroup` används som fallback när PIM saknar explicit grupp

Det här gör att radpris i varukorgen kan skilja sig från `pris * antal`.

### Portionsvarianter

Produkter kan säljas som:

- `hel`
- `halv`
- `kvart`

Det påverkar:

- pris
- WooCommerce-ID
- visning i produktkort/snabbvy
- viktberäkningar i varukorgen

### Feature-card-filter

Webshopens filter-URL stöder både kategorier och feature-cards.

Exempel:

- `/webbutik?tag=godast`
- `/webbutik?tag=erbjudanden`
- `/webbutik?kategori=frukt-gront`

Äldre `focus`-parameter migreras i klienten till `tag`.

## Miljö och externa beroenden

Projektet förutsätter miljövariabler för minst:

- Firebase klientkonfiguration
- `WORDPRESS_HOST`
- `WORDPRESS_BACKEND_IP` vid behov
- `WOOCOMMERCE_CONSUMER_KEY`
- `WOOCOMMERCE_CONSUMER_SECRET`

Autentiserad checkout kräver även fungerande Firebase-tokenverifiering mot Google Identity Toolkit.

## Nuvarande tekniska observationer

- Dokumentationen här speglar nuvarande kod, inte den äldre statiska produktmodellen
- Checkout är uppdelad mellan React och WooCommerce, vilket är centralt att förstå innan ändringar görs
- En stor del av affärslogiken ligger i klienten, särskilt filter, prissättning och varukorg
- Bygget fungerar, men huvudbundlen är fortfarande stor och kan senare behöva delas upp mer

## Referensfiler

- [`App.tsx`](./src/App.tsx)
- [`Webshop.tsx`](./src/pages/Webshop.tsx)
- [`Checkout.tsx`](./src/pages/Checkout.tsx)
- [`useProducts.ts`](./src/hooks/useProducts.ts)
- [`useFeaturedContent.ts`](./src/hooks/useFeaturedContent.ts)
- [`products.ts`](./src/lib/products.ts)
- [`deliveryAreas.ts`](./src/lib/deliveryAreas.ts)
- [`shipping.ts`](./src/lib/shipping.ts)
- [`woocommerce.ts`](./src/lib/woocommerce.ts)
- [`wc-add-to-cart.ts`](./netlify/functions/wc-add-to-cart.ts)
- [`checkout-session.ts`](./netlify/functions/checkout-session.ts)
- [`wordpress-proxy.ts`](./netlify/functions/wordpress-proxy.ts)
