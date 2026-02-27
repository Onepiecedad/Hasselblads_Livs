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
    sort?: string;
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
    tags?: string[];         // Produkttaggar (godast, nyheter, isasong, erbjudanden)
    sold_as?: ('hel' | 'halv' | 'kvart')[]; // Portionsstorlekar
    quality_class?: 'Klass 1' | 'Klass 2'; // Kvalitetsklass
    csvData?: Record<string, string>;

    // Viktbaserad prissättning (från PIM)
    pricing_type?: 'unit_based' | 'weight_based';
    price_per_kg?: number;
    estimated_weight_g?: number;
    estimated_piece_price?: number;

    // Multiköp-erbjudanden (från PIM)
    multi_buy_offers?: { quantity: number; price: number }[];

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
    'Sverige': 'se',
    'Spanien': 'es',
    'Italien': 'it',
    'Frankrike': 'fr',
    'Nederländerna': 'nl',
    'Tyskland': 'de',
    'Danmark': 'dk',
    'Norge': 'no',
    'Finland': 'fi',
    'Grekland': 'gr',
    'Portugal': 'pt',
    'Belgien': 'be',
    'Polen': 'pl',
    'USA': 'us',
    'Brasilien': 'br',
    'Chile': 'cl',
    'Argentina': 'ar',
    'Sydafrika': 'za',
    'Marocko': 'ma',
    'Israel': 'il',
    'Turkiet': 'tr',
    'Ecuador': 'ec',
    'Cypern': 'cy',
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
        // ── Specifika kategorier FÖRST (undviker att breda matchningar "äter" dem) ──

        // Nötter & Torkad Frukt (FÖRE "frukt" — "Torkad Frukt" innehåller "frukt")
        if (part.includes('nöt') || part.includes('torkad') || part.includes('russin') || part.includes('mandel')) {
            return 'notter-torkad-frukt';
        }

        // Kakor & Skorpor → tillhör Bröd (FÖRE "bröd" för tydlighet)
        if (part.includes('kakor') || part.includes('skorpor') || part.includes('kaka')) {
            return 'brod';
        }

        // ── Breda kategorier ──

        // Frukt & Grönt (inklusive frukt, grönsaker, färska kryddor)
        if (part.includes('frukt') || part.includes('grönt') || part.includes('grönsak') || part.includes('grön') || part.includes('färska kryddor')) {
            return 'frukt-gront';
        }

        // Ägg & Mejeri
        if (part.includes('mejeri') || part.includes('ägg')) {
            return 'agg-mejeri';
        }

        // Ost & Chark (ordgräns-medveten matchning för "ost")
        if (/\bost\b/.test(part) || part.includes('chark')) {
            return 'ost-chark';
        }

        // Konfektyr (choklad, lakrits, godis, konfekt)
        if (part.includes('konfektyr') || part.includes('choklad') || part.includes('lakrits') || part.includes('godis') || part.includes('konfekt')) {
            return 'konfektyr';
        }

        // Bröd
        if (part.includes('bröd') || part.includes('brod') || part.includes('bageri')) {
            return 'brod';
        }

        // Snacks & Dryck (ihopslagen)
        if (part.includes('snacks') || part.includes('chips') || part.includes('dryck') || part.includes('läsk') || part.includes('juice') || part.includes('vatten') || part.includes('öl') || part.includes('vin') || part.includes('tonic') || part.includes('saft') || part.includes('kombucha') || part.includes('cola')) {
            return 'snacks-dryck';
        }

        // Färskvaror
        if (part.includes('färskvar') || (part.includes('färsk') && (part.includes('inlägg') || part.includes('oliver')))) {
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

// Extrahera detaljkategori (nivå 3) från hierarkisk kategori
// t.ex. "Frukt & Grönt > Frukt > Banan" → "Banan"
function extractDetailCategory(mainCategory?: string): string | undefined {
    if (!mainCategory || !mainCategory.includes('>')) return undefined;
    const parts = mainCategory.split('>');
    if (parts.length > 2) {
        return parts[2].trim();
    }
    return undefined;
}

// Parsa taggar - prioritera produktens tags-fält från PIM
function parseTags(pimTags?: string[], _symbolField?: string): Product['tags'] {
    // Om produkten har taggar satta i PIM, använd dessa
    if (pimTags && pimTags.length > 0) {
        const validTags: Product['tags'] = [];
        for (const tag of pimTags) {
            // Mappa PIM-taggar till förväntade taggar där det behövs
            let parsedTag = tag;
            if (tag === 'erbjudande') parsedTag = 'erbjudanden';
            if (tag === 'nyhet') parsedTag = 'nyheter';
            if (tag === 'sasong') parsedTag = 'isasong';

            if (['godast', 'nyheter', 'isasong', 'erbjudanden', 'sasong', 'nyhet', 'erbjudande', 'eko', 'fairtrade', 'lokalt'].includes(parsedTag)) {
                validTags.push(parsedTag as Product['tags'][number]);
            }
        }
        return validTags;
    }

    return [];
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

// Parsa multiköp-erbjudanden ("2 st 29:-", "2 st 12:- & 3 st 15:-", "2 för 49 kr")
function parseMultiOffers(multiStr?: string): Product['multiOffers'] {
    if (!multiStr || typeof multiStr !== 'string') return undefined;
    const str = multiStr.trim();
    if (!str) return undefined;

    // Dela upp på "&" för multi-tier erbjudanden
    const parts = str.split(/\s*&\s*/);
    const offers: NonNullable<Product['multiOffers']> = [];

    for (const part of parts) {
        const trimmed = part.trim();
        // Matcha: "2 st 29:-", "2 st 35:", "2 st för 20", "2 för 49 kr"
        const match = trimmed.match(/(\d+)\s*(?:st\s+)?(?:för\s+)?(\d+)/i);
        if (match) {
            const qty = parseInt(match[1], 10);
            const price = parseInt(match[2], 10);
            if (qty > 0 && price > 0) {
                offers.push({
                    quantity: qty,
                    price,
                    label: `${qty} för ${price}:-`
                });
            }
        }
    }

    return offers.length > 0 ? offers.sort((a, b) => a.quantity - b.quantity) : undefined;
}

// Transformera PIM-produkt till hemsidans format
function transformProduct(pim: PIMProduct): Product {
    const country = pim.origin_country || pim.csvData?.['Ursprungsland'] || pim.csvData?.['Nationsflagg'] || pim.csvData?.['Etiketter land'] || '';
    const mainCategory = pim.main_category || pim.csvData?.['Huvudkategori'];
    const kgSt = pim.csvData?.['Kg/st'];

    // Viktbaserad prissättning: beräkna uppskattat styckepris
    const isWeightBased = pim.pricing_type === 'weight_based';
    let price: number;
    if (isWeightBased && (pim.estimated_piece_price || (pim.price_per_kg && pim.estimated_weight_g))) {
        price = pim.estimated_piece_price ?? (pim.price_per_kg! * pim.estimated_weight_g! / 1000);
    } else if (isWeightBased && pim.price_per_kg && !pim.estimated_weight_g) {
        // Weight-based but missing estimated weight — use kg-price as-is and mark unit as 'kg'
        price = pim.price_per_kg;
    } else {
        price = pim.price ?? parseFloat(pim.csvData?.['Ordinarie pris'] || '0');
    }

    return {
        id: pim.id,
        name: pim.display_name || pim.product_name,
        description: pim.description || '',
        category: mapCategory(mainCategory),
        subcategory: extractSubcategory(mainCategory, pim.sub_category),
        detailCategory: extractDetailCategory(mainCategory),
        brand: pim.brand,
        variety: pim.sort,
        tags: parseTags(pim.tags, pim.csvData?.['Symbol (Eko, FT etc)']),
        price,
        salePrice: pim.sale_price || undefined,
        unit: parseUnit(kgSt),
        priceUnit: isWeightBased
            ? (pim.estimated_weight_g || pim.estimated_piece_price ? 'st' : 'kg')
            : parsePriceUnit(kgSt),
        pricingType: pim.pricing_type,
        pricePerKg: isWeightBased ? pim.price_per_kg : undefined,
        estimatedWeightG: isWeightBased ? pim.estimated_weight_g : undefined,
        approximateWeight: pim.csvData?.['Vikt'] || undefined,
        weightInGrams: pim.csvData?.['Vikt i gram'] ? parseFloat(pim.csvData['Vikt i gram']) || undefined : undefined,
        multiOffers: pim.multi_buy_offers && pim.multi_buy_offers.length > 0
            ? pim.multi_buy_offers.map(o => ({ quantity: o.quantity, price: o.price, label: `${o.quantity} för ${o.price}:-` }))
            : parseMultiOffers(pim.csvData?.['Multi']),


        origin: {
            country: country || 'Okänt',
            flag: FLAG_MAP[country] || ''
        },
        image: pim.cloudinaryUrl || pim.finalImageUrl || '/placeholder-product.jpg',
        woocommerce_id: pim.woocommerce_id,
        sold_as: pim.sold_as,
        quality_class: pim.main_category?.includes('Frukt & Grönt') ? (pim.quality_class || 'Klass 1') : undefined,

        // Baksideinformation (mappa från PIM om det finns)
        backImageUrl: pim.backImageUrl,
        ingredients: pim.ingredients,
        allergens: pim.allergens,
        nutritionData: pim.nutritionData
    };
}

// Module-level state to persist products across navigations
let cachedProducts: Product[] | null = null;
let isGlobalLoading = true;
let globalError: Error | null = null;
let unsubscribeRef: (() => void) | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
    listeners.forEach(l => l());
}

export function useProducts() {
    const [, forceRender] = useState({});

    useEffect(() => {
        const listener = () => forceRender({});
        listeners.add(listener);

        if (cachedProducts && cachedProducts.length > 0) {
            isGlobalLoading = false;
        }

        if (!unsubscribeRef) {
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

                    console.log(`[useProducts] Loaded ${productList.length} products from Firestore`);

                    cachedProducts = productList;
                    isGlobalLoading = false;
                    globalError = null;
                    notify();
                },
                (err) => {
                    console.error("[useProducts] Error loading products:", err);
                    globalError = err;
                    isGlobalLoading = false;
                    notify();
                }
            );
        }

        return () => {
            listeners.delete(listener);
        };
    }, []);

    return {
        products: cachedProducts || [],
        isLoading: isGlobalLoading,
        error: globalError
    };
}
