export type ProductCategory = "frukt" | "gronsaker" | "mejeri" | "skafferi";

export type ProductTag = "sasong" | "erbjudande" | "nyhet" | "klassiker";

export type Product = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  tags: ProductTag[];
  price: number;
  unit: string;
  origin: { country: string; flag: string };
  image: string;
};

export const products: Product[] = [
  {
    id: "apple-eko",
    name: "Ekologiska äpplen Aroma",
    description: "Knapriga svenska äpplen från Bjäre – perfekta som mellanmål eller i paj.",
    category: "frukt",
    tags: ["sasong"],
    price: 42,
    unit: "/kg",
    origin: { country: "Sverige", flag: "🇸🇪" },
    image: "https://images.unsplash.com/photo-1576402187878-974f70c890ad?auto=format&fit=crop&w=800&q=80&fm=webp",
  },
  {
    id: "jordgubbar-premium",
    name: "Jordgubbar premium",
    description: "Solmogna jordgubbar från Halland med intensiv sötma och arom.",
    category: "frukt",
    tags: ["sasong", "erbjudande"],
    price: 55,
    unit: "/500 g",
    origin: { country: "Sverige", flag: "🇸🇪" },
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80&fm=webp",
  },
  {
    id: "apelsiner-primavera",
    name: "Apelsiner Primavera",
    description: "Saftiga apelsiner från Valencia med perfekt balans mellan sötma och syra.",
    category: "frukt",
    tags: ["erbjudande"],
    price: 32,
    unit: "/kg",
    origin: { country: "Spanien", flag: "🇪🇸" },
    image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=800&q=80&fm=webp",
  },
  {
    id: "bananer-eko",
    name: "Ekologiska bananer",
    description: "Fairtrade-certifierade bananer med krämig konsistens och mild sötma.",
    category: "frukt",
    tags: ["klassiker"],
    price: 26,
    unit: "/kg",
    origin: { country: "Ecuador", flag: "🇪🇨" },
    image: "https://images.unsplash.com/photo-1502741126161-b048400d8d76?auto=format&fit=crop&w=800&q=80&fm=webp",
  },
  {
    id: "tomater-romantica",
    name: "Tomater Romantica",
    description: "Små söta tomater med tunt skal, perfekta till sallad eller bruschetta.",
    category: "gronsaker",
    tags: ["sasong"],
    price: 39,
    unit: "/500 g",
    origin: { country: "Sverige", flag: "🇸🇪" },
    image: "https://images.unsplash.com/photo-1461009683693-342af2f2d6ce?auto=format&fit=crop&w=800&q=80&fm=webp",
  },
  {
    id: "sparris-gron",
    name: "Grön sparris",
    description: "Nyplockad sparris med krispig textur – lämplig att grilla eller sautera.",
    category: "gronsaker",
    tags: ["sasong", "nyhet"],
    price: 59,
    unit: "/bunt",
    origin: { country: "Sverige", flag: "🇸🇪" },
    image: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=800&q=80&fm=webp",
  },
  {
    id: "pak-choi",
    name: "Pak choi",
    description: "Mild kålsort med saftiga stjälkar – snabb att woka och perfekt i ramen.",
    category: "gronsaker",
    tags: ["nyhet"],
    price: 28,
    unit: "/st",
    origin: { country: "Nederländerna", flag: "🇳🇱" },
    image: "https://images.unsplash.com/photo-1603034001776-9bbf2ea640a7?auto=format&fit=crop&w=800&q=80&fm=webp",
  },
  {
    id: "broccoli-eko",
    name: "Ekologisk broccoli",
    description: "Krispig och smakrik broccoli som skördats och levererats samma dag.",
    category: "gronsaker",
    tags: ["klassiker"],
    price: 24,
    unit: "/st",
    origin: { country: "Sverige", flag: "🇸🇪" },
    image: "https://images.unsplash.com/photo-1506801310323-534be5e7b71a?auto=format&fit=crop&w=800&q=80&fm=webp",
  },
  {
    id: "ost-halloumi",
    name: "Halloumi chili",
    description: "Krämig halloumi med lätt hetta – perfekt att grilla eller steka.",
    category: "mejeri",
    tags: ["nyhet"],
    price: 49,
    unit: "/250 g",
    origin: { country: "Cypern", flag: "🇨🇾" },
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80&fm=webp",
  },
  {
    id: "yoghurt-grekisk",
    name: "Grekisk yoghurt 10%",
    description: "Extra krämig yoghurt som fungerar lika bra till frukost som i desserter.",
    category: "mejeri",
    tags: ["klassiker"],
    price: 29,
    unit: "/500 g",
    origin: { country: "Grekland", flag: "🇬🇷" },
    image: "https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&w=800&q=80&fm=webp",
  },
  {
    id: "granola-rostad",
    name: "Rostad granola",
    description: "Handgjord granola med kanel, hasselnötter och svenska havregryn.",
    category: "skafferi",
    tags: ["nyhet"],
    price: 72,
    unit: "/400 g",
    origin: { country: "Sverige", flag: "🇸🇪" },
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80&fm=webp",
  },
  {
    id: "olivolja-kallpressad",
    name: "Kallpressad olivolja",
    description: "Fruktig extra virgin olivolja från familjeoliveriet Russo i Apulien.",
    category: "skafferi",
    tags: ["erbjudande"],
    price: 119,
    unit: "/500 ml",
    origin: { country: "Italien", flag: "🇮🇹" },
    image: "https://images.unsplash.com/photo-1604908815110-a9f60f2fc33b?auto=format&fit=crop&w=800&q=80&fm=webp",
  },
];

export const categories: { label: string; value: string }[] = [
  { label: "Alla", value: "alla" },
  { label: "Frukt", value: "frukt" },
  { label: "Grönsaker", value: "gronsaker" },
  { label: "Mejeri", value: "mejeri" },
  { label: "Skafferi", value: "skafferi" },
];

export const tagFilters: { label: string; value: string; tag: ProductTag }[] = [
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
