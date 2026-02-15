export type ProductCategory =
  | "frukt-gront"
  | "agg-mejeri"
  | "skafferi"
  | "ost-chark"
  | "konfektyr"
  | "kakor-skorpor"
  | "brod"
  | "snacks-dryck"
  | "notter-torkad-frukt"
  | "farskvaror"
  | "hogtidsvaror"
  | "ovrigt";


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
  priceUnit?: 'kg' | 'st';       // Raw unit type for display
  approximateWeight?: string;    // e.g., "ca 150g" for piece items
  weightInGrams?: number;        // Weight in grams from CSV "Vikt i gram"
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
  { label: "Ägg & Mejeri", value: "agg-mejeri" },
  { label: "Skafferi", value: "skafferi" },
  { label: "Ost & Chark", value: "ost-chark" },
  { label: "Konfektyr", value: "konfektyr" },
  { label: "Kakor & Skorpor", value: "kakor-skorpor" },
  { label: "Bröd", value: "brod" },
  { label: "Snacks & Dryck", value: "snacks-dryck" },
  { label: "Nötter & Torkad frukt", value: "notter-torkad-frukt" },
  { label: "Färskvaror", value: "farskvaror" },
  { label: "Högtidsvaror", value: "hogtidsvaror" },
  { label: "Övrigt", value: "ovrigt" },
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
