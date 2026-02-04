import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price with two decimals and Swedish comma separator
 * @example formatPrice(99) => "99,00"
 * @example formatPrice(99.9) => "99,90"
 * @example formatPrice(99.99) => "99,99"
 */
export function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',');
}
