import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/products';

// Firestore collection path för produkter (måste matcha PIM-appens path)
// PIM-appen använder DEFAULT_PROJECT_ID = 'default' i syncService.ts
const PRODUCTS_PATH = 'organizations/hasselblad_common/projects/default/products';

// PIM-produktens struktur (förenklad)
interface PIMProduct {
    id: string;
    product_name: string;
    display_name?: string;
    description?: string;
    brand?: string;
    price?: number;
    sale_price?: number;
    main_category?: string;
    sub_category?: string;
    origin_country?: string;
    finalImageUrl?: string;
    cloudinaryUrl?: string;
    status: 'pending' | 'processing' | 'completed' | 'skipped' | 'failed';
    is_published?: boolean;  // true = visas på hemsidan
    woocommerce_id?: number; // WooCommerce product ID
    tags?: string[];         // Produkttaggar (sasong, eko, etc.)
    csvData?: Record<string, string>;

    // Baksideinformation (från PIM-appen)
    backImageUrl?: string;
    ingredients?: string;
    allergens?: string[];
    nutritionData?: {
        servingSize?: string;
        energy?: { kj?: number; kcal?: number };
        fat?: number;
        saturatedFat?: number;
        carbohydrates?: number;
        sugars?: number;
        protein?: number;
        fiber?: number;
        salt?: number;
    };
}

// Mappa ursprungsland till flagga
const FLAG_MAP: Record<string, string> = {
    'Sverige': '🇸🇪',
    'Spanien': '🇪🇸',
    'Italien': '🇮🇹',
    'Frankrike': '🇫🇷',
    'Nederländerna': '🇳🇱',
    'Tyskland': '🇩🇪',
    'Danmark': '🇩🇰',
    'Norge': '🇳🇴',
    'Finland': '🇫🇮',
    'Grekland': '🇬🇷',
    'Portugal': '🇵🇹',
    'Belgien': '🇧🇪',
    'Polen': '🇵🇱',
    'USA': '🇺🇸',
    'Brasilien': '🇧🇷',
    'Chile': '🇨🇱',
    'Argentina': '🇦🇷',
    'Sydafrika': '🇿🇦',
    'Marocko': '🇲🇦',
    'Israel': '🇮🇱',
    'Turkiet': '🇹🇷',
    'Ecuador': '🇪🇨',
    'Cypern': '🇨🇾',
};

// Legacy-aliasnamn som PIM kan skicka (gamla kategorinamn)
const LEGACY_CATEGORY_NAMES: Record<string, Product['category']> = {
    'mejeri & ägg': 'agg-mejeri',
    'bröd & kex': 'brod',
    'naturgodis & nötter': 'notter-torkad-frukt',
    'naturgodis': 'notter-torkad-frukt',
};

// Mappa PIM-kategori till hemsidans nya kombinerade kategorier
// Hanterar hierarkiska kategorier från Firestore, t.ex. "Frukt & Grönt > Frukt"
// Synkad med PIM Feb 2026 — 12 huvudkategorier
function mapCategory(pimCategory?: string): Product['category'] {
    if (!pimCategory) return 'skafferi';

    // Normalisera och extrahera huvudkategori från hierarki
    const normalized = pimCategory.toLowerCase().trim();

    // Kolla legacy-alias först (exakt matchning på huvudkategori-namn)
    const mainPart = normalized.split('>')[0].trim();
    const legacyMatch = LEGACY_CATEGORY_NAMES[mainPart];
    if (legacyMatch) return legacyMatch;

    // Kolla både huvuddelen och hela strängen för bäst matchning
    const checkParts = [mainPart, normalized];

    for (const part of checkParts) {
        // Frukt & Grönt (inklusive frukt, grönsaker, färska kryddor)
        if (part.includes('frukt') || part.includes('grönt') || part.includes('grönsak') || part.includes('grön') || part.includes('färska kryddor')) {
            return 'frukt-gront';
        }

        // Ägg & Mejeri
        if (part.includes('mejeri') || part.includes('ägg')) {
            return 'agg-mejeri';
        }

        // Ost & Chark
        if (part.includes('ost') || part.includes('chark')) {
            return 'ost-chark';
        }

        // Konfektyr (choklad, lakrits, godis, konfekt)
        if (part.includes('konfektyr') || part.includes('choklad') || part.includes('lakrits') || part.includes('godis') || part.includes('konfekt')) {
            return 'konfektyr';
        }

        // Kakor & Skorpor
        if (part.includes('kakor') || part.includes('skorpor') || part.includes('kaka')) {
            return 'kakor-skorpor';
        }

        // Bröd
        if (part.includes('bröd') || part.includes('brod') || part.includes('bageri')) {
            return 'brod';
        }

        // Nötter & Torkad Frukt
        if (part.includes('nöt') || part.includes('torkad') || part.includes('russin') || part.includes('mandel')) {
            return 'notter-torkad-frukt';
        }

        // Snacks & Dryck (ihopslagen)
        if (part.includes('snacks') || part.includes('chips') || part.includes('dryck') || part.includes('läsk') || part.includes('juice') || part.includes('vatten') || part.includes('öl') || part.includes('vin') || part.includes('tonic') || part.includes('saft') || part.includes('kombucha') || part.includes('cola')) {
            return 'snacks-dryck';
        }

        // Färskvaror
        if (part.includes('färskvar') || part.includes('färsk') && (part.includes('inlägg') || part.includes('oliver'))) {
            return 'farskvaror';
        }

        // Högtidsvaror
        if (part.includes('högtid') || part.includes('jul') || part.includes('påsk') || part.includes('midsommar')) {
            return 'hogtidsvaror';
        }

        // Skafferi (fallback for pantry items)
        if (part.includes('skafferi') || part.includes('kolonial') || part.includes('konserv') || part.includes('pasta') || part.includes('ris') || part.includes('sås') || part.includes('olja') || part.includes('krydda') || part.includes('flingor') || part.includes('sylt') || part.includes('marmelad') || part.includes('bakning')) {
            return 'skafferi';
        }
    }

    return 'skafferi'; // Default
}

// Extrahera underkategori från hierarkisk kategori eller sub_category-fält
function extractSubcategory(mainCategory?: string, subCategory?: string): string | undefined {
    // Använd sub_category-fältet om det finns
    if (subCategory && subCategory.trim()) {
        return subCategory.trim();
    }

    // Försök extrahera från hierarkisk huvudkategori (t.ex. "Frukt & Grönt > Frukt")
    if (mainCategory && mainCategory.includes('>')) {
        const parts = mainCategory.split('>');
        if (parts.length > 1) {
            return parts[1].trim();
        }
    }

    return undefined;
}

// Parsa taggar - prioritera produktens tags-fält, fallback till CSV-symbol
function parseTags(pimTags?: string[], symbolField?: string): Product['tags'] {
    // Om produkten har taggar satta i PIM, använd dessa
    if (pimTags && pimTags.length > 0) {
        const validTags: Product['tags'] = [];
        for (const tag of pimTags) {
            if (['sasong', 'erbjudande', 'nyhet', 'klassiker', 'eko', 'fairtrade'].includes(tag)) {
                validTags.push(tag as Product['tags'][number]);
            }
        }
        return validTags;
    }

    // Fallback: Parsa från CSV-symbol (bakåtkompatibilitet)
    if (!symbolField) return [];

    const tags: Product['tags'] = [];
    const normalized = symbolField.toLowerCase();

    if (normalized.includes('nyhet')) tags.push('nyhet');

    return tags;
}

// Parsa enhet från CSV-data
function parseUnit(kgSt?: string): string {
    if (!kgSt) return '/st';

    const normalized = kgSt.toLowerCase().trim();
    if (normalized === 'kg' || normalized.includes('kilo')) return '/kg';
    if (normalized.includes('500')) return '/500g';
    if (normalized.includes('250')) return '/250g';

    return '/st';
}

// Parsa pristyp (kg/st) för ICA-inspirerad visning
function parsePriceUnit(kgSt?: string): 'kg' | 'st' {
    if (!kgSt) return 'st';
    const normalized = kgSt.toLowerCase().trim();
    return normalized === 'kg' || normalized.includes('kilo') ? 'kg' : 'st';
}

// Transformera PIM-produkt till hemsidans format
function transformProduct(pim: PIMProduct): Product {
    const country = pim.origin_country || pim.csvData?.['Etiketter land'] || '';
    const mainCategory = pim.main_category || pim.csvData?.['Huvudkategori'];
    const kgSt = pim.csvData?.['Kg/st'];

    return {
        id: pim.id,
        name: pim.display_name || pim.product_name,
        description: pim.description || '',
        category: mapCategory(mainCategory),
        subcategory: extractSubcategory(mainCategory, pim.sub_category),
        tags: parseTags(pim.tags, pim.csvData?.['Symbol (Eko, FT etc)']),
        price: pim.price ?? parseFloat(pim.csvData?.['Ordinarie pris'] || '0'),
        unit: parseUnit(kgSt),
        priceUnit: parsePriceUnit(kgSt),
        approximateWeight: pim.csvData?.['Vikt'] || undefined,
        origin: {
            country: country || 'Okänt',
            flag: FLAG_MAP[country] || '🌍'
        },
        image: pim.cloudinaryUrl || pim.finalImageUrl || '/placeholder-product.jpg',
        woocommerce_id: pim.woocommerce_id,

        // Baksideinformation (mappa från PIM om det finns)
        backImageUrl: pim.backImageUrl,
        ingredients: pim.ingredients,
        allergens: pim.allergens,
        nutritionData: pim.nutritionData
    };
}

// Module-level cache to persist products across navigations
let cachedProducts: Product[] | null = null;
let unsubscribeRef: (() => void) | null = null;

export function useProducts() {
    const [products, setProducts] = useState<Product[]>(cachedProducts || []);
    const [isLoading, setIsLoading] = useState(!cachedProducts);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // If we already have cached products, use them immediately
        if (cachedProducts && cachedProducts.length > 0) {
            setProducts(cachedProducts);
            setIsLoading(false);
        }

        // If we already have an active subscription, don't create another
        if (unsubscribeRef) {
            return;
        }

        const productsRef = collection(db, PRODUCTS_PATH);
        const q = query(
            productsRef,
            where('status', '==', 'completed'),
            where('is_published', '==', true)
        );

        unsubscribeRef = onSnapshot(
            q,
            (snapshot) => {
                const productList = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() } as PIMProduct))
                    .map(p => transformProduct(p));

                // Update cache
                cachedProducts = productList;
                setProducts(productList);
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                setError(err);
                setIsLoading(false);
            }
        );

        // Don't unsubscribe - keep the subscription active for real-time updates
        // The subscription will be shared across all components using useProducts
    }, []);

    return { products, isLoading, error };
}
