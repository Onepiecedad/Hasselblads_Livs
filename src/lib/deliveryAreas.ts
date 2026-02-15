/**
 * Approved delivery streets per area.
 * Sources: openalfa.se, Hemnet, municipal data (Feb 2026).
 * ⚠️  Axel should verify completeness.
 */

export interface DeliveryAreaData {
    label: string;
    value: string;
    streets: string[];
    deliveryTime: string;
    pickupNote: string;
}

export const DELIVERY_AREAS: DeliveryAreaData[] = [
    {
        label: 'Solängen',
        value: 'solängen',
        deliveryTime: 'kl 12–15',
        pickupNote: 'Hämta i butiken från kl 12',
        streets: [
            'Bifrostgatan',
            'Flygelgatan',
            'Franckegatan',
            'Frejagatan',
            'Frölundagatan',
            'Idunagatan',
            'Kakelösagatan',
            'Kornängsgatan',
            'Lammevallsgatan',
            'Mariedalsgatan',
            'Mellanängsgatan',
            'Nils Hasselskogs gata',
            'Nimbusgatan',
            'Oxdragargatan',
            'Professorsgatan',
            'Prästgårdsgatan',
            'Solhemsgatan',
            'Stubbåkersgatan',
            'Ständergatan',
            'Tingsbogatan',
            'Trädgårdsgatan',
            'Vassdikesgatan',
            'Videbogatan',
            'Västerängsgatan',
            'Åbygatan',
            'Österängsgatan',
        ],
    },
    {
        label: 'Malevik',
        value: 'malevik',
        deliveryTime: 'kl 15–18',
        pickupNote: 'Hämta på Gamla Särövägen 153A från kl 15',
        streets: [
            'Agardalsvägen',
            'Doppingvägen',
            'Hagenvägen',
            'Kläppakullevägen',
            'Kullaviks Lyckeväg',
            'Lilla Hagrydsvägen',
            'Långenäsvägen',
            'Maleviks Blåsippeväg',
            'Maleviks Ejderväg',
            'Maleviks Kvarnväg',
            'Maleviks Sjöväg',
            'Maleviks Svanväg',
            'Maleviks Vipväg',
            'Maleviksbacken',
            'Maleviksvägen',
        ],
    },
];

/** Normalize a string for fuzzy comparison (lowercase, strip diacritics). */
function normalize(s: string): string {
    return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // strip diacritics
        .replace(/[^a-z0-9\s]/g, ' ')   // keep letters, digits, spaces
        .replace(/\s+/g, ' ')
        .trim();
}

export interface StreetMatch {
    area: DeliveryAreaData;
    street: string;
}

/**
 * Try to match user input against approved delivery streets.
 * Returns the matched area + street, or null if no match.
 */
export function matchDeliveryAddress(input: string): StreetMatch | null {
    const q = normalize(input);
    if (!q) return null;

    for (const area of DELIVERY_AREAS) {
        for (const street of area.streets) {
            const ns = normalize(street);
            // Match if query starts with or contains the normalized street name
            if (q.startsWith(ns) || q.includes(ns)) {
                return { area, street };
            }
        }
    }
    return null;
}
