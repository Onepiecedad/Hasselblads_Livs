import { createContext, useContext, useMemo, useReducer, useEffect } from "react";
import { calculateLineTotal, getAutoOffer, getEffectiveUnitPrice } from "@/lib/products";
import { getHomeDeliveryFee } from "@/lib/shipping";
import { useProducts } from "@/hooks/useProducts";

export type PortionSize = 'hel' | 'halv' | 'kvart';

export const PORTION_LABELS: Record<PortionSize, string> = {
  hel: 'Hel',
  halv: 'Halv',
  kvart: 'Kvart',
};

/** Canonical display order for portion buttons */
export const PORTION_ORDER: PortionSize[] = ['hel', 'halv', 'kvart'];

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
  multiBuyGroup?: string; // Mix-and-match grupp (t.ex. "avokado")
  lineTotal?: number; // Det beräknade radpriset baserat på eventuella multiköp och kvantitet
  compareAtLineTotal?: number; // Radpris utan aktiv multi-buy-rabatt
  appliedOfferLabel?: string; // Visningstext för aktiv multi-buy-rabatt
  totalWeightGrams?: number; // Total vikt för raden när den kan härledas
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
          ...item, // Merge new item data (e.g., to catch recently added multiOffers)
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
  const { products } = useProducts();

  // Save cart to local storage whenever items change
  useEffect(() => {
    saveCartToStorage(state.items);
  }, [state.items]);

  const computedItems = useMemo(() => {
    // Step 1: Enrich items with live product data
    const enrichedItems = state.items.map(item => {
      const liveProduct = products.find(p => p.id === item.productId);
      const isPortionedVariant = Boolean(item.portion && item.portion !== 'hel');
      return {
        ...item,
        multiOffers: isPortionedVariant ? undefined : (liveProduct?.multiOffers || item.multiOffers),
        multiBuyGroup: isPortionedVariant ? undefined : (liveProduct?.multiBuyGroup || item.multiBuyGroup),
        // Keep stored portion/weight prices, but refresh regular item prices using the same sale-price rule as add-to-cart.
        price: (item.portion || item.weightGrams)
          ? item.price
          : (liveProduct ? getEffectiveUnitPrice(liveProduct) : item.price),
      };
    });

    // Step 2: Group items by multiBuyGroup (only items that HAVE a group)
    const groups = new Map<string, typeof enrichedItems>();
    for (const item of enrichedItems) {
      if (item.multiBuyGroup) {
        const existing = groups.get(item.multiBuyGroup) || [];
        existing.push(item);
        groups.set(item.multiBuyGroup, existing);
      }
    }

    // Step 3: Calculate line totals
    // For grouped items, pool quantities and distribute discount proportionally
    const groupLineTotals = new Map<string, Map<string, number>>();
    const groupAppliedOfferLabels = new Map<string, string | undefined>();
    for (const [groupName, groupItems] of groups) {
      const totalGroupQty = groupItems.reduce((sum, i) => sum + i.quantity, 0);
      // Use the first item's offers as the group offer (all items in group should have same offers)
      const groupOffers = groupItems[0]?.multiOffers;

      if (!groupOffers || groupOffers.length === 0 || totalGroupQty <= 0) {
        // No offers — regular pricing for each item
        const itemTotals = new Map<string, number>();
        for (const item of groupItems) {
          itemTotals.set(item.id, item.price * item.quantity);
        }
        groupLineTotals.set(groupName, itemTotals);
        groupAppliedOfferLabels.set(groupName, undefined);
        continue;
      }

      // Calculate group-level total using pooled quantity and average price
      const totalGroupValue = groupItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const groupTotal = calculateLineTotal(totalGroupQty, totalGroupValue / totalGroupQty, groupOffers);
      const appliedGroupOffer = getAutoOffer(totalGroupQty, groupOffers, totalGroupValue / totalGroupQty);

      // Distribute proportionally based on each item's share of the group value
      const itemTotals = new Map<string, number>();
      for (const item of groupItems) {
        const itemShare = totalGroupValue > 0 ? (item.price * item.quantity) / totalGroupValue : 0;
        itemTotals.set(item.id, Math.round(groupTotal * itemShare * 100) / 100);
      }
      groupLineTotals.set(groupName, itemTotals);
      groupAppliedOfferLabels.set(
        groupName,
        groupTotal < totalGroupValue ? appliedGroupOffer?.label : undefined,
      );
    }

    // Step 4: Build final computed items
    return enrichedItems.map(item => {
      const compareAtLineTotal = item.price * item.quantity;
      const liveProduct = products.find(p => p.id === item.productId);
      const portionMultiplier = item.portion ? PORTION_MULTIPLIERS[item.portion] ?? 1 : 1;
      const totalWeightGrams = (() => {
        if (item.weightGrams) return item.weightGrams * item.quantity;
        if (liveProduct?.weightInGrams) {
          return Math.round(liveProduct.weightInGrams * portionMultiplier * item.quantity);
        }
        if (liveProduct?.estimatedWeightG) {
          return Math.round(liveProduct.estimatedWeightG * portionMultiplier * item.quantity);
        }
        return undefined;
      })();

      // Check if this item is part of a group
      if (item.multiBuyGroup && groupLineTotals.has(item.multiBuyGroup)) {
        const itemTotal = groupLineTotals.get(item.multiBuyGroup)!.get(item.id) ?? (item.price * item.quantity);
        return {
          ...item,
          lineTotal: itemTotal,
          compareAtLineTotal,
          totalWeightGrams,
          appliedOfferLabel: itemTotal < compareAtLineTotal
            ? groupAppliedOfferLabels.get(item.multiBuyGroup)
            : undefined,
        };
      }

      // Non-grouped items: regular calculation
      if (!item.multiOffers || item.multiOffers.length === 0) {
        return { ...item, lineTotal: compareAtLineTotal, compareAtLineTotal, totalWeightGrams, appliedOfferLabel: undefined };
      }
      const lineTotal = calculateLineTotal(item.quantity, item.price, item.multiOffers);
      const appliedOffer = lineTotal < compareAtLineTotal ? getAutoOffer(item.quantity, item.multiOffers, item.price) : undefined;
      return {
        ...item,
        lineTotal,
        compareAtLineTotal,
        totalWeightGrams,
        appliedOfferLabel: appliedOffer?.label,
      };
    });
  }, [state.items, products]);

  const subtotal = useMemo(() => computedItems.reduce((total, item) => total + (item.lineTotal || 0), 0), [computedItems]);
  const shippingFee = getHomeDeliveryFee(subtotal);
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
