import { createContext, useContext, useMemo, useReducer, useEffect } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;
  woocommerce_id?: number; // WooCommerce product ID for checkout
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
        return parsed;
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

  // Persist cart to localStorage whenever items change
  useEffect(() => {
    saveCartToStorage(state.items);
  }, [state.items]);

  const subtotal = useMemo(() => state.items.reduce((total, item) => total + item.price * item.quantity, 0), [state.items]);
  const shippingFee = subtotal >= 600 || subtotal === 0 ? 0 : 39;
  const total = subtotal + shippingFee;


  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
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
    [state.items, state.isOpen, subtotal, shippingFee, total],
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
