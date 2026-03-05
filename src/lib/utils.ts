import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price with Swedish comma separator.
 * Whole numbers display without decimals, others with two decimals.
 * @example formatPrice(99) => "99"
 * @example formatPrice(99.9) => "99,90"
 * @example formatPrice(99.99) => "99,99"
 */
export function formatPrice(price: number): string {
  if (Number.isInteger(price)) return price.toString();
  return price.toFixed(2).replace('.', ',');
}
