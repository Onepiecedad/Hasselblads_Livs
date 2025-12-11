import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/products';

// Firestore collection path för produkter
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
    csvData?: Record<string, string>;
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

// Mappa PIM-kategori till hemsidans kategori
function mapCategory(pimCategory?: string): Product['category'] {
    if (!pimCategory) return 'skafferi';

    const normalized = pimCategory.toLowerCase().trim();

    if (normalized.includes('frukt')) return 'frukt';
    if (normalized.includes('grönt') || normalized.includes('grönsak')) return 'gronsaker';
    if (normalized.includes('mejeri')) return 'mejeri';
    if (normalized.includes('skafferi') || normalized.includes('kolonial')) return 'skafferi';

    return 'skafferi'; // Default
}

// Parsa taggar från CSV-data
function parseTags(symbolField?: string): Product['tags'] {
    if (!symbolField) return [];

    const tags: Product['tags'] = [];
    const normalized = symbolField.toLowerCase();

    if (normalized.includes('eko')) tags.push('sasong');
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

// Transformera PIM-produkt till hemsidans format
function transformProduct(pim: PIMProduct): Product {
    const country = pim.origin_country || pim.csvData?.['Etiketter land'] || '';

    return {
        id: pim.id,
        name: pim.display_name || pim.product_name,
        description: pim.description || '',
        category: mapCategory(pim.main_category || pim.csvData?.['Huvudkategori']),
        tags: parseTags(pim.csvData?.['Symbol (Eko, FT etc)']),
        price: pim.price ?? parseFloat(pim.csvData?.['Ordinarie pris'] || '0'),
        unit: parseUnit(pim.csvData?.['Kg/st']),
        origin: {
            country: country || 'Okänt',
            flag: FLAG_MAP[country] || '🌍'
        },
        image: pim.cloudinaryUrl || pim.finalImageUrl || '/placeholder-product.jpg'
    };
}

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const productsRef = collection(db, PRODUCTS_PATH);
        const q = query(productsRef, where('status', '==', 'completed'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const productList = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return transformProduct({ id: doc.id, ...data } as PIMProduct);
                });
                setProducts(productList);
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                setError(err);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { products, isLoading, error };
}
