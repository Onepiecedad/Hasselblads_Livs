export type ProductCategory = "frukt-gront" | "mejeri-agg" | "ost-chark" | "brod" | "skafferi" | "sott-gott" | "notter-torkad-frukt" | "snacks-dryck" | "kott";

export type ProductTag = "sasong" | "erbjudande" | "nyhet" | "klassiker" | "eko" | "fairtrade";

// Typ för näringsvärde
export type NutritionData = {
  servingSize?: string;
  energy?: { kj?: number; kcal?: number };
  fat?: number;
  saturatedFat?: number;
  carbohydrates?: number;
  sugars?: number;
  protein?: number;
  salt?: number;
  fiber?: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  subcategory?: string; // For grouping within large categories
  tags: ProductTag[];
  price: number;
  unit: string;
  origin: { country: string; flag: string };
  image: string;
  woocommerce_id?: number; // WooCommerce product ID for checkout

  // Baksideinformation (från PIM-appen)
  backImageUrl?: string;        // Bild på förpackningens baksida
  ingredients?: string;         // Ingredienslista (text)
  allergens?: string[];         // Allergener som array
  nutritionData?: NutritionData; // Näringsvärde
};


// Produkter hämtas nu från Firebase via useProducts() hook
// Se: src/hooks/useProducts.ts

export const categories: { label: string; value: string }[] = [
  { label: "Alla", value: "alla" },
  { label: "Frukt & Grönt", value: "frukt-gront" },
  { label: "Mejeri & Ägg", value: "mejeri-agg" },
  { label: "Ost & Chark", value: "ost-chark" },
  { label: "Bröd", value: "brod" },
  { label: "Skafferi", value: "skafferi" },
  { label: "Sött & Gott", value: "sott-gott" },
  { label: "Nötter & Torkad Frukt", value: "notter-torkad-frukt" },
  { label: "Snacks & Dryck", value: "snacks-dryck" },
  { label: "Kött", value: "kott" },
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
