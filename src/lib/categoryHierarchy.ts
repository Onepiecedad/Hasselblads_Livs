/**
 * Category Hierarchy for Hasselblads Livs webshop
 * Synkad med PIM categoryService.ts (Feb 2026) — 3 nivåer
 *
 * Nivå 1: Huvudkategori (visas som kort)
 * Nivå 2: Underkategori (visas som filterchips)
 * Nivå 3: Detaljkategori (visas som filterchips under underkategori)
 */

export type SubcategoryItem = {
    name: string;
    detailCategories: string[];
};

export type CategoryHierarchyItem = {
    label: string;
    value: string;
    subcategories: SubcategoryItem[];
    icon?: string;
};

export const CATEGORY_HIERARCHY: Record<string, CategoryHierarchyItem> = {
    "frukt-gront": {
        label: "Frukt & Grönt",
        value: "frukt-gront",
        subcategories: [
            {
                name: "Frukt",
                detailCategories: [
                    "Banan", "Äpple", "Päron", "Citrus", "Stenfrukt",
                    "Melon", "Druvor", "Exotisk frukt",
                    "Övrig frukt"
                ]
            },
            {
                name: "Bär",
                detailCategories: [
                    "Jordgubbar", "Hallon", "Blåbär", "Övriga färska bär"
                ]
            },
            {
                name: "Grönsaker",
                detailCategories: [
                    "Sallad", "Gurka", "Tomat", "Paprika", "Avokado",
                    "Potatis", "Lök", "Kål", "Rotfrukter", "Svamp",
                    "Ingefära", "Övriga grönsaker"
                ]
            },
            {
                name: "Färska Kryddor",
                detailCategories: [
                    "Gräslök", "Dill", "Persilja Krus", "Persilja Blad",
                    "Basilika", "Timjan", "Oregano", "Rosmarin",
                    "Koriander", "Mynta", "Dragon", "Citronmeliss",
                    "Uteryddor", "Övriga färska kryddor"
                ]
            }
        ]
    },
    "agg-mejeri": {
        label: "Ägg & Mejeri",
        value: "agg-mejeri",
        subcategories: [
            {
                name: "Ägg",
                detailCategories: ["12-pack", "Karta 30 st", "Styckvis"]
            },
            {
                name: "Mejeri",
                detailCategories: [
                    "Mjölk", "Filmjölk", "Yoghurt", "Grädde",
                    "Smör", "Crème Fraîche"
                ]
            }
        ]
    },
    "skafferi": {
        label: "Skafferi",
        value: "skafferi",
        subcategories: [
            {
                name: "Oliver",
                detailCategories: ["Svarta", "Gröna", "Meraki färska", "Cusa", "Fratepietro"]
            },
            {
                name: "Kryddor & Smaksättare",
                detailCategories: ["Kryddor", "Smaksättare"]
            },
            {
                name: "Flingor",
                detailCategories: ["Granola", "Corn Flakes", "Müsli"]
            },
            {
                name: "Socker & Honung",
                detailCategories: ["Honung", "Socker"]
            },
            {
                name: "Oljor",
                detailCategories: ["Olivolja", "Rapsolja", "Matolja"]
            },
            {
                name: "Kaffe & Te",
                detailCategories: ["Kaffe", "Te", "Hela bönor"]
            },
            {
                name: "Sylt & Marmelad",
                detailCategories: ["Sylt", "Marmelad", "Gelé"]
            },
            {
                name: "Bakning",
                detailCategories: ["Mjöl", "Havregryn", "Nötkräm", "Kakao", "Kakaonibs"]
            },
            {
                name: "Pasta, ris & nudlar",
                detailCategories: ["Pasta", "Ris", "Nudlar"]
            },
            {
                name: "Böner, linser och fröer",
                detailCategories: ["Bönor", "Linser", "Fröer"]
            },
            {
                name: "Konserver",
                detailCategories: ["Tomater", "Fiskkonserver"]
            },
            {
                name: "Inläggningar",
                detailCategories: ["Kapris", "Cornichon", "Oliver"]
            },
            {
                name: "Inläggningar färska",
                detailCategories: ["Tistelvind"]
            },
            {
                name: "Ketchup, Senap & Dressing",
                detailCategories: ["Ketchup", "Senap", "Dressing"]
            },
            {
                name: "Övrigt skafferi",
                detailCategories: ["Majonäs"]
            }
        ]
    },
    "ost-chark": {
        label: "Ost & Chark",
        value: "ost-chark",
        subcategories: [
            {
                name: "Ost, kex och marmelad",
                detailCategories: [
                    "Hårdost", "Färskost", "Vitmögelost", "Getost",
                    "Kittost", "Blåmögelost", "Ostkaka", "Ostkex"
                ]
            },
            {
                name: "Chark",
                detailCategories: ["Skivad chark", "Övrig chark"]
            }
        ]
    },
    "konfektyr": {
        label: "Konfektyr",
        value: "konfektyr",
        subcategories: [
            {
                name: "Choklad",
                detailCategories: [
                    "Standout", "Vivani", "Matez",
                    "La Perla & Tartufo", "Butlers", "Övrig Choklad"
                ]
            },
            {
                name: "Lakrits",
                detailCategories: ["Almaregårdens", "Hans Hugo", "Övrig lakrits"]
            },
            {
                name: "Övrig konfekt",
                detailCategories: ["Tuggummi", "Sockerfritt", "Övrig konfekt"]
            }
        ]
    },
    "brod": {
        label: "Bröd",
        value: "brod",
        subcategories: [
            {
                name: "Bröd",
                detailCategories: ["Hårt bröd", "Kex", "Övrigt bröd"]
            },
            {
                name: "Kakor",
                detailCategories: ["Rullrån", "Maräng", "Amarettokaka"]
            },
            {
                name: "Söta skorpor & matskorpor",
                detailCategories: []
            }
        ]
    },
    "snacks-dryck": {
        label: "Snacks & Dryck",
        value: "snacks-dryck",
        subcategories: [
            {
                name: "Chips",
                detailCategories: ["Savoursmiths", "Brets", "Gärdschips"]
            },
            {
                name: "Nötter",
                detailCategories: []
            },
            {
                name: "Övrig snacks",
                detailCategories: []
            },
            {
                name: "Öl",
                detailCategories: ["Ocean"]
            },
            {
                name: "Vatten",
                detailCategories: ["Imsdal", "Ramlösa"]
            },
            {
                name: "Kolsyrade söta drickor",
                detailCategories: ["It Cola", "Coca-Cola", "San Pellegrino", "Galvanina"]
            },
            {
                name: "Saft",
                detailCategories: []
            },
            {
                name: "Råsaft",
                detailCategories: []
            },
            {
                name: "Kombucha",
                detailCategories: []
            },
            {
                name: "Tonic",
                detailCategories: ["Gbg Soda"]
            },
            {
                name: "Övrig dryck",
                detailCategories: []
            }
        ]
    },
    "notter-torkad-frukt": {
        label: "Nötter & Torkad frukt",
        value: "notter-torkad-frukt",
        subcategories: [
            {
                name: "Torkad frukt Sötad",
                detailCategories: []
            },
            {
                name: "Torkad frukt osötad",
                detailCategories: []
            },
            {
                name: "Naturgodis",
                detailCategories: []
            }
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
        subcategories: [
            { name: "Presentkort", detailCategories: [] },
            { name: "Presentkorg", detailCategories: [] },
            { name: "Plockavgift", detailCategories: [] }
        ]
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

// Helper to get subcategory names for a category (for filter chips)
export function getSubcategories(categoryValue: string): string[] {
    const resolved = resolveCategorySlug(categoryValue);
    return CATEGORY_HIERARCHY[resolved]?.subcategories.map(s => s.name) || [];
}

// Helper to get detail categories for a specific subcategory within a category
export function getDetailCategories(categoryValue: string, subcategoryName: string): string[] {
    const resolved = resolveCategorySlug(categoryValue);
    const cat = CATEGORY_HIERARCHY[resolved];
    if (!cat) return [];
    const sub = cat.subcategories.find(s => s.name === subcategoryName);
    return sub?.detailCategories || [];
}

// Helper to check if a subcategory has detail categories
export function hasDetailCategories(categoryValue: string, subcategoryName: string): boolean {
    return getDetailCategories(categoryValue, subcategoryName).length > 0;
}
