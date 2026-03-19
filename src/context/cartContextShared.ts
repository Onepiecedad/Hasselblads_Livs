import { createContext } from "react";

import type { PortionSize } from "@/context/cartConstants";

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;
  portion?: PortionSize;
  portionLabel?: string;
  weightGrams?: number;
  estimatedWeightG?: number;
  weightInGrams?: number;
  woocommerce_id?: number;
  multiOffers?: { quantity: number; price: number; label: string }[];
  multiBuyGroup?: string;
  lineTotal?: number;
  compareAtLineTotal?: number;
  appliedOfferLabel?: string;
  totalWeightGrams?: number;
};

export type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  subtotal: number;
  shippingFee: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setOpen: (isOpen: boolean) => void;
};

export const CartContext = createContext<CartContextValue | undefined>(undefined);
