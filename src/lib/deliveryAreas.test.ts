import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    formatDeliveryDate,
    matchDeliveryAddress,
    getAvailableDeliveryDates,
    normalizeDeliveryAddress,
} from './deliveryAreas';

// ─── formatDeliveryDate ──────────────────────────────────────────
describe('formatDeliveryDate', () => {
    it('formats a Monday correctly', () => {
        // 2026-02-16 is a Monday
        const d = new Date(2026, 1, 16);
        expect(formatDeliveryDate(d)).toBe('Måndag 16 feb');
    });

    it('formats a Friday correctly', () => {
        // 2026-02-20 is a Friday
        const d = new Date(2026, 1, 20);
        expect(formatDeliveryDate(d)).toBe('Fredag 20 feb');
    });

    it('capitalises first letter', () => {
        const d = new Date(2026, 0, 4); // Sunday
        expect(formatDeliveryDate(d)).toMatch(/^Söndag/);
    });
});

// ─── matchDeliveryAddress ────────────────────────────────────────
describe('matchDeliveryAddress', () => {
    it('matches an exact street name (Solängen)', () => {
        const result = matchDeliveryAddress('Frejagatan');
        expect(result).not.toBeNull();
        expect(result!.area.value).toBe('solängen');
        expect(result!.street).toBe('Frejagatan');
    });

    it('matches a street with house number appended', () => {
        const result = matchDeliveryAddress('Frejagatan 9');
        expect(result).not.toBeNull();
        expect(result!.area.value).toBe('solängen');
    });

    it('matches a Malevik street', () => {
        const result = matchDeliveryAddress('Blomstervägen 12');
        expect(result).not.toBeNull();
        expect(result!.area.value).toBe('malevik');
        expect(result!.street).toBe('Blomstervägen');
    });

    it('returns null for unknown streets', () => {
        expect(matchDeliveryAddress('Storgatan 1')).toBeNull();
    });

    it('returns null for empty input', () => {
        expect(matchDeliveryAddress('')).toBeNull();
    });

    it('is case-insensitive', () => {
        const result = matchDeliveryAddress('FREJAGATAN 9');
        expect(result).not.toBeNull();
    });
});

describe('normalizeDeliveryAddress', () => {
    it('strips punctuation and normalizes diacritics for whitelist matching', () => {
        expect(normalizeDeliveryAddress('Blomstervägen 12, Mölndal')).toBe('blomstervagen 12 molndal');
    });
});

// ─── getAvailableDeliveryDates ───────────────────────────────────
describe('getAvailableDeliveryDates', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns the requested number of dates', () => {
        const dates = getAvailableDeliveryDates(5);
        expect(dates).toHaveLength(5);
    });

    it('never returns weekends', () => {
        const dates = getAvailableDeliveryDates(10);
        for (const d of dates) {
            expect(d.getDay()).not.toBe(0); // Sunday
            expect(d.getDay()).not.toBe(6); // Saturday
        }
    });

    it('starts from tomorrow when before deadline', () => {
        vi.useFakeTimers();
        // Set to Monday 2026-02-16 at 10:00 (before 19:00 deadline)
        vi.setSystemTime(new Date(2026, 1, 16, 10, 0, 0));
        const dates = getAvailableDeliveryDates(1);
        // Earliest should be Tuesday 17th
        expect(dates[0].getDate()).toBe(17);
        expect(dates[0].getDay()).toBe(2); // Tuesday
    });

    it('skips a day when after deadline', () => {
        vi.useFakeTimers();
        // Set to Monday 2026-02-16 at 20:00 (after 19:00 deadline)
        vi.setSystemTime(new Date(2026, 1, 16, 20, 0, 0));
        const dates = getAvailableDeliveryDates(1);
        // Should skip Tuesday, earliest is Wednesday 18th
        expect(dates[0].getDate()).toBe(18);
        expect(dates[0].getDay()).toBe(3); // Wednesday
    });
});
