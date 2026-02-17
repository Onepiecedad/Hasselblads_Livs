import { describe, it, expect } from 'vitest';
import { formatPrice } from './utils';

describe('formatPrice', () => {
    it('formats whole numbers with two decimals', () => {
        expect(formatPrice(99)).toBe('99,00');
    });

    it('formats one-decimal prices', () => {
        expect(formatPrice(99.9)).toBe('99,90');
    });

    it('formats two-decimal prices', () => {
        expect(formatPrice(99.99)).toBe('99,99');
    });

    it('formats zero correctly', () => {
        expect(formatPrice(0)).toBe('0,00');
    });

    it('formats subunit prices', () => {
        expect(formatPrice(0.5)).toBe('0,50');
    });
});
