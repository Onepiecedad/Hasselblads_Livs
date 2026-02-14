/**
 * Category Hierarchy for Hasselblads Livs webshop
 * Synkad med PIM (Feb 2026) — 12 huvudkategorier
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
            "Bär",
            "Grönsaker",
            "Färska Kryddor"
        ]
    },
    "agg-mejeri": {
        label: "Ägg & Mejeri",
        value: "agg-mejeri",
        subcategories: [
            "Ägg",
            "Mejeri"
        ]
    },
    "skafferi": {
        label: "Skafferi",
        value: "skafferi",
        subcategories: [
            "Bakning",
            "Böner, linser och fröer",
            "Café",
            "Flingor",
            "Inläggningar",
            "Kolonial",
            "Konserver",
            "Kryddor",
            "Multiköp",
            "Oljor",
            "Olja & Vinäger",
            "Pasta & Ris",
            "Såser",
            "Sylt & Marmelad",
            "Övrigt skafferi"
        ]
    },
    "ost-chark": {
        label: "Ost & Chark",
        value: "ost-chark",
        subcategories: [
            "Ost",
            "Ost, kex och marmelad",
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
    "brod": {
        label: "Bröd",
        value: "brod",
        subcategories: [
            "Bröd",
            "Kakor",
            "Söta skorpor & matskorpor"
        ]
    },
    "snacks-dryck": {
        label: "Snacks & Dryck",
        value: "snacks-dryck",
        subcategories: [
            "Chips",
            "Öl",
            "Vatten",
            "Kolsyrade drycker",
            "Tonic",
            "Saft",
            "Råsaft",
            "Kombucha",
            "Övriga snacks",
            "Övriga drycker"
        ]
    },
    "notter-torkad-frukt": {
        label: "Nötter & Torkad frukt",
        value: "notter-torkad-frukt",
        subcategories: [
            "Nötter",
            "Torkad Frukt"
        ]
    },
    "farskvaror": {
        label: "Färskvaror",
        value: "farskvaror",
        subcategories: [
            "Inläggningar färska",
            "Oliver"
        ]
    },
    "hogtidsvaror": {
        label: "Högtidsvaror",
        value: "hogtidsvaror",
        subcategories: []
    },
    "ovrigt": {
        label: "Övrigt",
        value: "ovrigt",
        subcategories: []
    }
};

/**
 * Legacy slug aliases — mappar gamla kategorinamn/slugs till nya.
 * Används för bakåtkompatibilitet med produkter från PIM.
 */
const LEGACY_SLUG_MAP: Record<string, string> = {
    // Omdöpta
    "mejeri-agg": "agg-mejeri",
    "brod-kex": "brod",
    "naturgodis-notter": "notter-torkad-frukt",
    // Ihopslagen
    "snacks": "snacks-dryck",
    "dryck": "snacks-dryck",
    "kakor-skorpor": "brod",
    // Borttagna → bästa matchning
    "sott-gott": "konfektyr",
    "kott": "ovrigt",
};

/**
 * Resolve a category slug, handling legacy aliases.
 * Returns the canonical slug.
 */
export function resolveCategorySlug(slug: string): string {
    return LEGACY_SLUG_MAP[slug] || slug;
}

// Helper to get category label from value
export function getCategoryLabel(value: string): string {
    const resolved = resolveCategorySlug(value);
    return CATEGORY_HIERARCHY[resolved]?.label || value;
}

// Helper to get all categories as array for iteration
export function getAllCategories(): CategoryHierarchyItem[] {
    return Object.values(CATEGORY_HIERARCHY);
}

// Helper to check if a category has subcategories
export function hasSubcategories(categoryValue: string): boolean {
    const resolved = resolveCategorySlug(categoryValue);
    return (CATEGORY_HIERARCHY[resolved]?.subcategories.length ?? 0) > 0;
}

// Helper to get subcategories for a category
export function getSubcategories(categoryValue: string): string[] {
    const resolved = resolveCategorySlug(categoryValue);
    return CATEGORY_HIERARCHY[resolved]?.subcategories || [];
}
