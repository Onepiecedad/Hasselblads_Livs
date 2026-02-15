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

/** ─── Delivery schedule ─── */

/** Delivery available Monday–Friday. Order deadline: day before 18:00. */
export const DELIVERY_WEEKDAYS = [1, 2, 3, 4, 5]; // 0=Sun, 1=Mon … 6=Sat
export const ORDER_DEADLINE_HOUR = 18; // 18:00 day before

/** Store info for pickup */
export const PICKUP_INFO = {
    label: 'Hämta i butik',
    address: 'Frölundagatan 51, Mölndal',
    note: 'Redo att hämta från kl 10 på vald dag',
};

/**
 * Get the next N available delivery dates (Mon–Fri).
 * Respects the order-deadline: if it's after 18:00 today, the earliest
 * delivery is the day after tomorrow.
 */
export function getAvailableDeliveryDates(count = 5): Date[] {
    const now = new Date();
    const dates: Date[] = [];

    // Start from tomorrow (or day after tomorrow if past deadline)
    const cursor = new Date(now);
    const pastDeadline = now.getHours() >= ORDER_DEADLINE_HOUR;
    cursor.setDate(cursor.getDate() + (pastDeadline ? 2 : 1));

    while (dates.length < count) {
        const day = cursor.getDay(); // 0=Sun … 6=Sat
        if (DELIVERY_WEEKDAYS.includes(day)) {
            dates.push(new Date(cursor));
        }
        cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
}

/** Swedish day-of-week names */
const DAY_NAMES = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

/** Format a date as "Måndag 17 feb" */
export function formatDeliveryDate(d: Date): string {
    const dayName = DAY_NAMES[d.getDay()];
    const capitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    return `${capitalized} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

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
