import { createContext, useContext, useMemo, useReducer, useEffect } from "react";
import { calculateLineTotal } from "@/lib/products";

export type PortionSize = 'hel' | 'halv' | 'kvart';

export const PORTION_LABELS: Record<PortionSize, string> = {
  hel: 'Hel',
  halv: 'Halv',
  kvart: 'Kvart',
};

export const PORTION_MULTIPLIERS: Record<PortionSize, number> = {
  hel: 1,
  halv: 0.5,
  kvart: 0.25,
};

export type CartItem = {
  id: string;         // Unik id: productId eller productId__portion
  productId: string;  // Original produkt-id (utan portion-suffix)
  name: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;
  portion?: PortionSize;
  portionLabel?: string; // T.ex. "Halv"
  weightGrams?: number;  // Vikt i gram för kg-produkter (t.ex. 300 = 300g)
  woocommerce_id?: number; // WooCommerce product ID for checkout
  multiOffers?: { quantity: number; price: number; label: string }[]; // Alla erbjudanden produkten har
  lineTotal?: number; // Det beräknade radpriset baserat på eventuella multiköp och kvantitet
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
};

type Action =
  | { type: "ADD_ITEM"; payload: { item: Omit<CartItem, "quantity">; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: { id: string } }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_OPEN"; payload: { isOpen: boolean } };

type CartContextValue = {
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

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "hasselblads-cart";

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate that it's an array with expected structure
      if (Array.isArray(parsed) && parsed.every(item =>
        item.id && typeof item.name === 'string' && typeof item.price === 'number' && typeof item.quantity === 'number'
      )) {
        // Backward compat: backfill productId for old cart items
        return parsed.map((item: CartItem) => ({
          ...item,
          productId: item.productId || item.id.split('__')[0],
        }));
      }
    }
  } catch (e) {
    console.warn('[CartContext] Failed to load cart from localStorage:', e);
  }
  return [];
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('[CartContext] Failed to save cart to localStorage:', e);
  }
};

const cartReducer = (state: CartState, action: Action): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const { item, quantity } = action.payload;
      const existingIndex = state.items.findIndex((cartItem) => cartItem.id === item.id);
      if (existingIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: Math.min(updatedItems[existingIndex].quantity + quantity, 99),
        };
        return { ...state, items: updatedItems };
      }
      return {
        ...state,
        items: [...state.items, { ...item, quantity: Math.min(quantity, 99) }],
      };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((item) => item.id !== action.payload.id) };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, Math.min(action.payload.quantity, 99)) }
            : item,
        ),
      };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "SET_OPEN":
      return { ...state, isOpen: action.payload.isOpen };
    default:
      return state;
  }
};

// Initialize with data from localStorage
const getInitialState = (): CartState => ({
  items: loadCartFromStorage(),
  isOpen: false,
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  // Use lazy initialization to load from localStorage
  const [state, dispatch] = useReducer(cartReducer, undefined, getInitialState);

  const computedItems = useMemo(() => {
    return state.items.map(item => {
      if (!item.multiOffers || item.multiOffers.length === 0) {
        return { ...item, lineTotal: item.price * item.quantity };
      }

      const currentItemTotal = calculateLineTotal(item.quantity, item.price, item.multiOffers);
      return { ...item, lineTotal: currentItemTotal };
    });
  }, [state.items]);

  const subtotal = useMemo(() => computedItems.reduce((total, item) => total + (item.lineTotal || 0), 0), [computedItems]);
  const shippingFee = subtotal >= 600 || subtotal === 0 ? 0 : 49;
  const total = subtotal + shippingFee;

  const value = useMemo<CartContextValue>(
    () => ({
      items: computedItems,
      isOpen: state.isOpen,
      subtotal,
      shippingFee,
      total,
      addItem: (item, quantity = 1) => dispatch({ type: "ADD_ITEM", payload: { item, quantity } }),
      removeItem: (id) => dispatch({ type: "REMOVE_ITEM", payload: { id } }),
      updateQuantity: (id, quantity) => dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
      setOpen: (isOpen) => dispatch({ type: "SET_OPEN", payload: { isOpen } }),
    }),
    [computedItems, state.isOpen, subtotal, shippingFee, total],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
