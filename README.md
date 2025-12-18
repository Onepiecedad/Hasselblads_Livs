# 🛒 Hasselblads Livs — Hemsida

Kundvänd webbutik för Hasselblads Livs, en livsmedelsbutik i Mölndal.

> 📚 **[Central dokumentation →](../docs/INDEX.md)**

---

## Tech Stack

| Teknologi | Syfte |
|-----------|-------|
| React 18 | Frontend-ramverk |
| TypeScript | Typsäkerhet |
| Vite | Build tool |
| Tailwind CSS | Styling |
| shadcn/ui | UI-komponenter |
| React Router v6 | Routing |
| Firebase | Produktdata (realtid) |

---

## Snabbstart

```bash
# 1. Installera beroenden
npm install

# 2. Konfigurera miljövariabler
cp .env.example .env
# Fyll i Firebase-credentials

# 3. Starta dev-server
npm run dev
```

Öppna: http://localhost:5174

---

## Projektstruktur

```
src/
├── components/     # React-komponenter
│   └── ui/         # shadcn/ui komponenter
├── pages/          # Sidor (routes)
├── hooks/          # Custom hooks
│   └── useProducts.ts   # Firebase produkthämtning
├── context/        # React Context (varukorg)
├── lib/            # Utilities
└── assets/         # Bilder & statiska filer
```

---

## Live

- **URL:** https://hasselblads-livs.netlify.app
- **Hosting:** Netlify

---

## Relaterade

- [PIM-appen](../) — Admin-verktyg för produkthantering
- [Dokumentation](../docs/INDEX.md) — Central dokumentation
- [Utvecklingslogg](../LOGG.md) — Senaste ändringar

---

*Del av Hasselblads Livs ekosystemet.*
