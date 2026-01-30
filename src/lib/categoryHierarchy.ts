/**
 * Category Hierarchy for Hasselblads Livs webshop
 * Based on ICA-inspired navigation patterns
 * 
 * This defines the complete category tree with subcategories
 * for the expandable sidebar navigation.
 */

export type CategoryHierarchyItem = {
    label: string;
    value: string;
    subcategories: string[];
    icon?: string;
};

export const CATEGORY_HIERARCHY: Record<string, CategoryHierarchyItem> = {
    "frukt-gront": {
        label: "Frukt & Grönt",
        value: "frukt-gront",
        subcategories: [
            "Frukt",
            "Grönsaker"
        ]
    },
    "mejeri-agg": {
        label: "Mejeri & Ägg",
        value: "mejeri-agg",
        subcategories: [
            "Ost",
            "Mjölk & Grädde",
            "Yoghurt",
            "Smör & Margarin",
            "Ägg"
        ]
    },
    "skafferi": {
        label: "Skafferi",
        value: "skafferi",
        subcategories: [
            "Oliver",
            "Kryddor & Smaksättare",
            "Flingor",
            "Socker & Honung",
            "Oljor",
            "Kaffe & Te",
            "Sylt & Marmelad",
            "Bakning",
            "Pasta ris & nudlar",
            "Bönor linser och fröer",
            "Konserver",
            "Inläggningar",
            "Ketchup Senap & Dressing"
        ]
    },
    "ost-chark": {
        label: "Ost & Chark",
        value: "ost-chark",
        subcategories: [
            "Ost",
            "Chark"
        ]
    },
    "konfektyr": {
        label: "Konfektyr",
        value: "konfektyr",
        subcategories: [
            "Choklad",
            "Lakrits",
            "Övrig konfekt"
        ]
    },
    "kakor-skorpor": {
        label: "Kakor & Skorpor",
        value: "kakor-skorpor",
        subcategories: [
            "Kakor",
            "Söta skorpor & matskorpor"
        ]
    },
    "brod-kex": {
        label: "Bröd & Kex",
        value: "brod-kex",
        subcategories: [
            "Hårt bröd",
            "Kex",
            "Övrigt bröd"
        ]
    },
    "dryck": {
        label: "Dryck",
        value: "dryck",
        subcategories: [
            "Öl",
            "Vatten",
            "Kolsyrade söta drickor",
            "Saft",
            "Råsaft",
            "Kombucha",
            "Tonic",
            "Övrig dryck"
        ]
    },
    "naturgodis-notter": {
        label: "Naturgodis & Nötter",
        value: "naturgodis-notter",
        subcategories: [
            "Torkad frukt sötad",
            "Torkad frukt osötad",
            "Naturgodis"
        ]
    },
    "snacks": {
        label: "Snacks",
        value: "snacks",
        subcategories: [
            "Chips",
            "Nötter",
            "Övrig snacks"
        ]
    },
    "farskvaror": {
        label: "Färskvaror",
        value: "farskvaror",
        subcategories: [
            "Inläggningar färska",
            "Oliver",
            "Cannoli & Bakverk"
        ]
    },
    "hogtidsvaror": {
        label: "Högtidsvaror",
        value: "hogtidsvaror",
        subcategories: [
            "Jul",
            "Påsk",
            "Midsommar"
        ]
    },
    "ovrigt": {
        label: "Övrigt",
        value: "ovrigt",
        subcategories: []
    }
};

// Helper to get category label from value
export function getCategoryLabel(value: string): string {
    return CATEGORY_HIERARCHY[value]?.label || value;
}

// Helper to get all categories as array for iteration
export function getAllCategories(): CategoryHierarchyItem[] {
    return Object.values(CATEGORY_HIERARCHY);
}

// Helper to check if a category has subcategories
export function hasSubcategories(categoryValue: string): boolean {
    return (CATEGORY_HIERARCHY[categoryValue]?.subcategories.length ?? 0) > 0;
}

// Helper to get subcategories for a category
export function getSubcategories(categoryValue: string): string[] {
    return CATEGORY_HIERARCHY[categoryValue]?.subcategories || [];
}
