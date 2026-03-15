import { describe, expect, it } from 'vitest';
import { inferMultiBuyGroup, type MultiOffer } from './products';

const twoFor39: MultiOffer[] = [{ quantity: 2, price: 39, label: '2 för 39:-' }];

describe('inferMultiBuyGroup', () => {
    it('groups different avocados together when they share the same offer', () => {
        expect(inferMultiBuyGroup('Avokado Hass', twoFor39)).toBe('avokado__2x39');
        expect(inferMultiBuyGroup('Avokado 2: Mogen dagen efter leveransdag', twoFor39)).toBe('avokado__2x39');
    });

    it('groups cellophane salad bags together when they share the same offer', () => {
        expect(inferMultiBuyGroup('Ruccola i cellofanpåse', twoFor39)).toBe('sallad-cellofan__2x39');
        expect(inferMultiBuyGroup('Salladsmix i cellofanpåse', twoFor39)).toBe('sallad-cellofan__2x39');
    });

    it('returns undefined for products outside supported mix families', () => {
        expect(inferMultiBuyGroup('Alambra Malet', twoFor39)).toBeUndefined();
    });
});
