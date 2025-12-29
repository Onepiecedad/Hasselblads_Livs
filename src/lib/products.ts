export type ProductCategory = "frukt" | "gronsaker" | "mejeri" | "skafferi" | "chark" | "ost" | "brod" | "dryck" | "snacks";

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
  woocommerce_id?: number; // WooCommerce product ID for checkout
};


// Produkter hämtas nu från Firebase via useProducts() hook
// Se: src/hooks/useProducts.ts

export const categories: { label: string; value: string }[] = [
  { label: "Alla", value: "alla" },
  { label: "Frukt", value: "frukt" },
  { label: "Grönsaker", value: "gronsaker" },
  { label: "Mejeri", value: "mejeri" },
  { label: "Chark", value: "chark" },
  { label: "Ost", value: "ost" },
  { label: "Bröd", value: "brod" },
  { label: "Dryck", value: "dryck" },
  { label: "Snacks", value: "snacks" },
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
