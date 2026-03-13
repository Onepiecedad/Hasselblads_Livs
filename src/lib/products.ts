export type ProductCategory =
  | "frukt-gront"
  | "agg-mejeri"
  | "skafferi"
  | "ost-chark"
  | "konfektyr"
  | "kakor-skorpor"
  | "brod"
  | "kott"
  | "snacks-dryck"
  | "notter-torkad-frukt"
  | "farskvaror"
  | "hogtidsvaror"
  | "ovrigt";


export type ProductTag =
  | "godast" | "nyheter" | "isasong" | "erbjudanden"  // Legacy focus card IDs
  | "sasong" | "nyhet" | "erbjudande"                   // PIM tags
  | "eko" | "fairtrade" | "lokalt";                    // PIM badge-only tags

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

export type MultiOffer = {
  quantity: number;    // Antal i erbjudandet, t.ex. 2
  price: number;       // Totalpris för erbjudandet, t.ex. 29
  label: string;       // Visningstext, t.ex. "2 för 29:-"
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  subcategory?: string; // For grouping within large categories
  detailCategory?: string; // For filtering within subcategories (level 3)
  brand?: string; // From PIM "brand"
  variety?: string; // From PIM "sort"
  tags: ProductTag[];
  price: number;
  salePrice?: number;            // Rabatterat pris (extrapris/rea)
  unit: string;
  priceUnit?: 'kg' | 'st' | 'påse' | 'pkt' | 'kruka' | 'knippe' | 'ask' | 'korg' | 'låda' | 'nät' | 'förp' | 'fläta' | 'flaska';  // Enhet från PIM
  pricingType?: 'unit_based' | 'weight_based'; // Pristyp från PIM
  pricePerKg?: number;           // Kg-pris (visas som sekundär info för viktbaserade)
  salePricePerKg?: number;       // Rea-kg-pris (för weight-based produkter med rea)
  estimatedWeightG?: number;     // Uppskattad vikt i gram (för viktbaserade produkter)
  approximateWeight?: string;    // e.g., "ca 150g" for piece items
  weightInGrams?: number;        // Weight in grams from CSV "Vikt i gram"
  multiOffers?: MultiOffer[];    // Multiköp-erbjudanden, t.ex. "2 för 29:-"
  multiBuyGroup?: string;        // Mix-and-match grupp (t.ex. "avokado") — produkter i samma grupp delar rabatt
  origin: { country: string; flag: string };
  image: string;
  woocommerce_id?: number; // WooCommerce product ID for checkout
  woocommerce_ids?: { hel?: number; halv?: number; kvart?: number }; // Per-portion WC IDs
  sold_as?: ('hel' | 'halv' | 'kvart')[]; // Portionsstorlekar (t.ex. halv ost)
  quality_class?: 'Klass 1' | 'Klass 2';  // Kvalitetsklass (t.ex. Klass 1)

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
  { label: "Kött", value: "kott" },
  { label: "Snacks & Dryck", value: "snacks-dryck" },
  { label: "Nötter & Torkad frukt", value: "notter-torkad-frukt" },
  { label: "Högtidsvaror", value: "hogtidsvaror" },
  { label: "Övrigt", value: "ovrigt" },
];

export const getEffectiveUnitPrice = (product: Pick<Product, "price" | "salePrice">): number => {
  return product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
};

export const tagFilters: { label: string; value: string; tag: ProductTag }[] = [
  { label: "Godast just nu", value: "godast", tag: "godast" },
  { label: "Nyheter & Premiärer", value: "nyheter", tag: "nyheter" },
  { label: "I säsong", value: "isasong", tag: "isasong" },
  { label: "Erbjudanden", value: "erbjudanden", tag: "erbjudanden" },
];

export const sortOptions = [
  { label: "Mest populära", value: "popular" },
  { label: "Pris – lägst först", value: "price-asc" },
  { label: "Pris – högst först", value: "price-desc" },
  { label: "Namn A–Ö", value: "name-asc" },
];

export const getAutoOffer = (quantity: number, offers?: MultiOffer[]): MultiOffer | undefined => {
  if (!offers || offers.length === 0) return undefined;
  // Sort descending by quantity so we test the largest applicable offers first
  const sorted = [...offers].sort((a, b) => b.quantity - a.quantity);
  // Auto-apply if quantity is at least the offer quantity
  return sorted.find(o => quantity >= o.quantity);
};

export const calculateLineTotal = (quantity: number, price: number, offers?: MultiOffer[]): number => {
  if (!offers || offers.length === 0 || quantity <= 0) {
    return price * quantity;
  }

  // Sort descending by quantity to apply the largest offers first (greedy algorithm)
  const sortedOffers = [...offers].sort((a, b) => b.quantity - a.quantity);
  let remainingQty = quantity;
  let currentTotal = 0;

  for (const offer of sortedOffers) {
    if (remainingQty >= offer.quantity && offer.quantity > 0) {
      const numOffers = Math.floor(remainingQty / offer.quantity);
      currentTotal += numOffers * offer.price;
      remainingQty -= numOffers * offer.quantity;
    }
  }

  // Add the regular price for the remaining single items
  currentTotal += remainingQty * price;
  return currentTotal;
};
