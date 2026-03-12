/**
 * Shared shipping rules for the React pre-checkout flow.
 *
 * Rule: home delivery is free from a discounted cart subtotal of 600 SEK.
 * The subtotal basis is the existing computed cart subtotal after current
 * sale and multi-buy line-total calculations. Pickup remains free.
 *
 * WooCommerce final checkout must be configured to match this same rule.
 */
export const HOME_DELIVERY_FEE = 49;
export const FREE_HOME_DELIVERY_THRESHOLD = 600;

export function qualifiesForFreeHomeDelivery(subtotal: number): boolean {
  return subtotal >= FREE_HOME_DELIVERY_THRESHOLD;
}

export function getHomeDeliveryFee(subtotal: number): number {
  return subtotal === 0 || qualifiesForFreeHomeDelivery(subtotal) ? 0 : HOME_DELIVERY_FEE;
}
