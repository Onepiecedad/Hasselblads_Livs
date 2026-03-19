import { useEffect, useState, useMemo, useRef, type RefObject } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { PORTION_LABELS, PORTION_MULTIPLIERS, PORTION_ORDER, type PortionSize } from "@/context/cartConstants";
import { type MultiOffer, getAutoOffer, calculateLineTotal, getEffectiveUnitPrice } from "@/lib/products";

export type QuickViewProduct = {
  id: string;
  name: string;
  description: string;
  brand?: string;
  variety?: string;
  category?: string;
  price: number;
  salePrice?: number;
  unit: string;
  priceUnit?: 'kg' | 'st' | 'påse' | 'pkt' | 'kruka' | 'knippe' | 'ask' | 'korg' | 'låda' | 'nät' | 'förp' | 'fläta' | 'flaska';
  pricingType?: 'unit_based' | 'weight_based';
  pricePerKg?: number;
  salePricePerKg?: number;
  estimatedWeightG?: number;
  approximateWeight?: string;
  origin: { country: string; flag: string };
  image: string;
  tags: string[];
  sold_as?: ('hel' | 'halv' | 'kvart')[];
  quality_class?: 'Klass 1' | 'Klass 2';
  multiOffers?: MultiOffer[];
  weightInGrams?: number;
};

/** Weight presets in grams for kg-priced products */
const WEIGHT_PRESETS = [100, 200, 300, 400, 500] as const;
const DEFAULT_WEIGHT = 200;

interface QuickViewModalProps {
  product: QuickViewProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (product: QuickViewProduct, quantity: number, portion?: PortionSize, weightGrams?: number, multiOffer?: MultiOffer) => void;
  returnFocusRef?: RefObject<HTMLElement> | null;
}

// Parse "ca 150g" or "250g" → number in grams
function parseWeight(w: string): number | null {
  const match = w.match(/(\d+)\s*(g|kg)/i);
  if (!match) return null;
  const val = parseInt(match[1], 10);
  return match[2].toLowerCase() === 'kg' ? val * 1000 : val;
}

function formatWeight(grams: number): string {
  return grams >= 1000 ? `${(grams / 1000).toFixed(1).replace('.0', '')} kg` : `${grams} g`;
}

const QuickViewModal = ({ product, open, onOpenChange, onAddToCart, returnFocusRef }: QuickViewModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState("1");
  const replaceOnNextDigitRef = useRef(true);
  const hasMultiOffers = product?.multiOffers && product.multiOffers.length > 0;

  // Portionsval
  const hasAnyPortionVariant = !!(product?.sold_as && product.sold_as.length > 0);
  const hasPortionChoices = !!(product?.sold_as && product.sold_as.length > 1);
  const sortedPortions = useMemo(() =>
    hasAnyPortionVariant ? [...product!.sold_as!].sort((a, b) => PORTION_ORDER.indexOf(a) - PORTION_ORDER.indexOf(b)) : product?.sold_as,
    [product, hasAnyPortionVariant]);
  const defaultPortion = sortedPortions?.includes('hel') ? 'hel' : (sortedPortions?.[0] ?? 'hel');
  const [selectedPortion, setSelectedPortion] = useState<PortionSize>(defaultPortion);

  // Viktväljare för kg-produkter
  const isKgProduct = product?.priceUnit === 'kg' && product?.pricingType !== 'weight_based';
  const [selectedWeight, setSelectedWeight] = useState(DEFAULT_WEIGHT);

  const portionPrice = useMemo(() => {
    if (!product) return 0;
    const effectiveUnitPrice = getEffectiveUnitPrice(product);
    if (!hasAnyPortionVariant) return effectiveUnitPrice;
    return Math.round(effectiveUnitPrice * PORTION_MULTIPLIERS[selectedPortion]);
  }, [product, selectedPortion, hasAnyPortionVariant]);

  const regularPortionPrice = useMemo(() => {
    if (!product) return 0;
    if (!hasAnyPortionVariant) return product.price;
    return Math.round(product.price * PORTION_MULTIPLIERS[selectedPortion]);
  }, [product, selectedPortion, hasAnyPortionVariant]);

  const salePortionPrice = useMemo(() => {
    if (!product?.salePrice || product.salePrice >= product.price) return undefined;
    if (!hasAnyPortionVariant) return product.salePrice;
    return Math.round(product.salePrice * PORTION_MULTIPLIERS[selectedPortion]);
  }, [product, selectedPortion, hasAnyPortionVariant]);

  // For kg products, calculate price based on selected weight
  const weightPrice = useMemo(() => {
    if (!product || !isKgProduct) return 0;
    return Math.round((product.price / 1000) * selectedWeight * 100) / 100;
  }, [product, isKgProduct, selectedWeight]);

  const displayPrice = isKgProduct ? weightPrice : (salePortionPrice ?? regularPortionPrice);
  const selectedOffer = useMemo(() => getAutoOffer(quantity, product?.multiOffers, displayPrice) ?? null, [quantity, product?.multiOffers, displayPrice]);

  // Browser back button support: push history state when opening
  useEffect(() => {
    if (!open) return;

    const handlePopState = () => {
      onOpenChange(false);
    };

    window.history.pushState({ quickView: true }, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [open, onOpenChange]);

  // When closing via X or overlay click, pop the history entry we pushed
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      if (window.history.state?.quickView) {
        window.history.back();
      }
      if (returnFocusRef?.current) {
        returnFocusRef.current.focus();
      }
    }
    onOpenChange(nextOpen);
  };

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setQuantityInput("1");
      replaceOnNextDigitRef.current = true;
      setSelectedWeight(DEFAULT_WEIGHT);
      if (sortedPortions?.[0]) {
        setSelectedPortion(defaultPortion);
      }
    }
  }, [open, product, defaultPortion, sortedPortions]);

  const handleSelectOffer = (offer: MultiOffer | null) => {
    if (offer) {
      setQuantity(offer.quantity);
      setQuantityInput(String(offer.quantity));
      replaceOnNextDigitRef.current = false;
    } else {
      setQuantity(1);
      setQuantityInput("1");
      replaceOnNextDigitRef.current = true;
    }
  };

  const displayTotalPrice = product ? calculateLineTotal(quantity, displayPrice, product.multiOffers) : 0;

  const handleQuantityChange = (value: string) => {
    const rawValue = value.replace(/[^\d]/g, "");
    setQuantityInput(rawValue);
    if (!rawValue) return;

    const next = Number.parseInt(rawValue, 10);
    setQuantity(Math.max(1, Math.min(next, 99)));
    replaceOnNextDigitRef.current = false;
  };

  const handleQuantityBlur = () => {
    if (!quantityInput) {
      setQuantity(1);
      setQuantityInput("1");
      replaceOnNextDigitRef.current = true;
      return;
    }

    const next = Math.max(1, Math.min(Number.parseInt(quantityInput, 10) || 1, 99));
    setQuantity(next);
    setQuantityInput(String(next));
    replaceOnNextDigitRef.current = next === 1;
  };

  const armQuantityReplace = () => {
    replaceOnNextDigitRef.current = quantityInput === "1";
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      replaceOnNextDigitRef.current &&
      /^\d$/.test(e.key) &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey
    ) {
      e.preventDefault();
      setQuantityInput(e.key);
      setQuantity(Math.max(1, Math.min(99, Number.parseInt(e.key, 10))));
      replaceOnNextDigitRef.current = false;
    }
  };

  const handleAddToCart = () => {
    if (product) {
      onAddToCart(
        product,
        quantity,
        hasAnyPortionVariant ? selectedPortion : undefined,
        isKgProduct ? selectedWeight : undefined,
        selectedOffer ?? undefined,
      );
    }
  };

  // Calculate estimated weight/price for per-piece items
  const isPieceItem = product?.priceUnit !== 'kg';
  const weightPerUnit = product?.approximateWeight
    ? parseWeight(product.approximateWeight)
    : (product?.weightInGrams ?? null);
  const showEstimate = isPieceItem && weightPerUnit && quantity > 1;
  const estimatedTotalWeight = weightPerUnit ? weightPerUnit * quantity : 0;
  const estimatedTotalPrice = product ? displayPrice * quantity : 0;

  // Unit display label
  const unitLabel = product?.pricingType === 'weight_based'
    ? 'säljs per vikt'
    : isKgProduct ? 'per kg' : `per ${product?.priceUnit || 'st'}`;

  // Total price for kg products (weight × quantity)
  const kgTotalPrice = isKgProduct ? weightPrice * quantity : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0 max-h-[100dvh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-3xl overflow-hidden flex flex-col inset-x-0 bottom-0 top-auto translate-x-0 translate-y-0 left-0 sm:left-[50%] sm:top-[50%] sm:bottom-auto sm:translate-x-[-50%] sm:translate-y-[-50%]">
        {product && (
          <>
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid gap-4 p-4 sm:gap-6 sm:grid-cols-[1.2fr_1fr] sm:p-8 pb-4 sm:pb-8">
                {/* Product image */}
                <div className="overflow-hidden rounded-2xl bg-muted max-h-[35vh] sm:max-h-none aspect-auto sm:aspect-auto">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-contain p-4"
                  />
                </div>

                {/* Product details */}
                <div className="flex flex-col">
                  <DialogHeader className="space-y-3 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      {product.brand && (
                        <div className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest leading-none">
                          {product.brand}
                        </div>
                      )}
                      {product.quality_class && product.category === 'frukt-gront' && (
                        <div className="text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-sm">
                          {product.quality_class}
                        </div>
                      )}
                    </div>
                    <DialogTitle className="text-2xl font-semibold leading-tight">
                      {product.name}
                      {product.variety && (
                        <span className="ml-2 text-lg sm:text-xl font-normal text-muted-foreground">{product.variety}</span>
                      )}
                    </DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground leading-relaxed">
                      {product.description}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="mt-4 space-y-4">
                    {/* Origin and unit badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 flex items-center text-primary border-0 text-sm px-3 py-1">
                        {product.origin?.flag ? (
                          <img
                            src={`https://flagcdn.com/w20/${product.origin.flag}.png`}
                            srcSet={`https://flagcdn.com/w40/${product.origin.flag}.png 2x`}
                            alt=""
                            className="mr-1.5 w-4 h-auto rounded-[1px]"
                            loading="lazy"
                          />
                        ) : (
                          <span className="mr-1.5 text-base">🌍</span>
                        )}
                        {product.origin.country}
                      </Badge>
                      <Badge variant="outline" className="text-muted-foreground text-sm px-3 py-1">
                        {unitLabel}
                      </Badge>
                    </div>

                    {/* Portionsväljare (pill-knappar) */}
                    {hasPortionChoices && (
                      <div className="flex gap-1.5">
                        {sortedPortions!.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setSelectedPortion(p)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${selectedPortion === p
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted'
                              }`}
                          >
                            {PORTION_LABELS[p]}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Viktväljare för kg-produkter */}
                    {isKgProduct && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Välj vikt</p>
                        <div className="flex flex-wrap gap-1.5">
                          {WEIGHT_PRESETS.map((w) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => setSelectedWeight(w)}
                              className={`px-3.5 py-2 text-sm font-medium rounded-full border transition-all ${selectedWeight === w
                                ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                                : 'bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted hover:border-primary/30'
                                }`}
                            >
                              {w} g
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div className="space-y-2">
                      {isKgProduct ? (
                        <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                          <span className="text-3xl font-bold text-primary">≈ {formatPrice(weightPrice)}</span>
                          <span className="text-xl text-muted-foreground">kr</span>
                          <span className="text-sm text-muted-foreground">/ {selectedWeight} g</span>
                        </div>
                      ) : product.pricingType === 'weight_based' ? (
                        product.salePrice && product.salePrice < product.price ? (
                          <>
                            <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                              <span className="text-3xl font-bold text-rose-600">ca {formatPrice(salePortionPrice ?? product.salePrice)}</span>
                              <span className="text-xl text-muted-foreground">kr/st</span>
                              <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-bold text-rose-600">REA</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                              <span className="line-through">Ord. ca {formatPrice(regularPortionPrice)} kr/st</span>
                              {hasAnyPortionVariant && selectedPortion !== 'hel' && (
                                <span>({PORTION_LABELS[selectedPortion].toLowerCase()})</span>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                            <span className="text-3xl font-bold text-primary">ca {formatPrice(regularPortionPrice)}</span>
                            <span className="text-xl text-muted-foreground">kr/st</span>
                            {hasAnyPortionVariant && selectedPortion !== 'hel' && (
                              <span className="text-sm text-muted-foreground">({PORTION_LABELS[selectedPortion].toLowerCase()})</span>
                            )}
                          </div>
                        )
                      ) : salePortionPrice ? (
                        <>
                          <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                            <span className="text-3xl font-bold text-rose-600">{formatPrice(salePortionPrice)}</span>
                            <span className="text-xl text-muted-foreground">kr/{product.priceUnit || 'st'}</span>
                            <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-bold text-rose-600">REA</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                            <span className="line-through">Ord. {formatPrice(regularPortionPrice)} kr/{product.priceUnit || 'st'}</span>
                            {hasAnyPortionVariant && selectedPortion !== 'hel' && (
                              <span>({PORTION_LABELS[selectedPortion].toLowerCase()})</span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                          <span className="text-3xl font-bold text-primary">{formatPrice(displayPrice)}</span>
                          <span className="text-xl text-muted-foreground">kr/{product.priceUnit || 'st'}</span>
                          {hasAnyPortionVariant && selectedPortion !== 'hel' && (
                            <span className="text-sm text-muted-foreground">({PORTION_LABELS[selectedPortion].toLowerCase()})</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* kg-product price per kg info */}
                    {isKgProduct && (
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(product.price)} kr/kg
                      </p>
                    )}

                    {/* Weight-based price info */}
                    {product.pricingType === 'weight_based' && (product.pricePerKg || product.estimatedWeightG) && (
                      <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 inline-block">
                        {product.salePrice && product.salePrice < product.price && product.salePricePerKg ? (
                          <>
                            {formatPrice(product.salePricePerKg)} kr/kg
                            {product.pricePerKg && (
                              <span className="text-muted-foreground/60 line-through ml-1">{formatPrice(product.pricePerKg)} kr/kg</span>
                            )}
                          </>
                        ) : (
                          product.pricePerKg ? `${formatPrice(product.pricePerKg)} kr/kg` : ''
                        )}
                        {(product.pricePerKg || product.salePricePerKg) && product.estimatedWeightG ? ' · ' : ''}
                        {product.estimatedWeightG ? `≈ ${Math.round(product.estimatedWeightG * PORTION_MULTIPLIERS[selectedPortion] * quantity)} g` : ''}
                      </p>
                    )}

                    {/* Approximate weight for per-piece items */}
                    {product.pricingType !== 'weight_based' && isPieceItem && (product.approximateWeight || product.weightInGrams) && !hasAnyPortionVariant && (
                      <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 inline-block">
                        ≈ {product.approximateWeight || `${product.weightInGrams} g`} per styck
                      </p>
                    )}

                    {/* Multiköp-väljare */}
                    {hasMultiOffers && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Multiköp</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectOffer(null)}
                            className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${!selectedOffer
                              ? 'bg-primary text-primary-foreground border-primary shadow-md'
                              : 'bg-muted/50 text-foreground/80 border-border hover:border-primary/40 hover:bg-muted'
                              }`}
                          >
                            1 st — {formatPrice(product!.price)} kr
                          </button>
                          {product!.multiOffers!.map((offer, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleSelectOffer(offer)}
                              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${selectedOffer?.quantity === offer.quantity && selectedOffer?.price === offer.price
                                ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                                : 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30 hover:border-orange-500/60 hover:bg-orange-500/20'
                                }`}
                            >
                              {offer.label} ⭐
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quantity selector - hidden on mobile (shown in sticky footer) */}
                    {!isKgProduct && (
                      <div className="hidden sm:flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Antal:</span>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full"
                            onClick={() => setQuantity((prev) => {
                              const next = Math.max(1, prev - 1);
                              setQuantityInput(String(next));
                              replaceOnNextDigitRef.current = next === 1;
                              return next;
                            })}
                            aria-label="Minska antal"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="text"
                            value={quantityInput}
                            onChange={(event) => handleQuantityChange(event.target.value)}
                            onKeyDown={handleQuantityKeyDown}
                            onBlur={handleQuantityBlur}
                            onFocus={armQuantityReplace}
                            onMouseDown={armQuantityReplace}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="h-10 w-16 text-center text-lg font-semibold"
                            aria-label="Antal"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full"
                            onClick={() => setQuantity((prev) => {
                              const next = Math.min(99, prev + 1);
                              setQuantityInput(String(next));
                              replaceOnNextDigitRef.current = next === 1;
                              return next;
                            })}
                            aria-label="Öka antal"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Multiköp summary when multi-offer is active */}
                    {selectedOffer && (
                      <div className="bg-orange-50 dark:bg-orange-500/10 rounded-xl p-3 space-y-1 text-sm border border-orange-200 dark:border-orange-500/20">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{selectedOffer.label}</span>
                          <span className="font-semibold text-orange-600 dark:text-orange-400">{selectedOffer.price}:- kr</span>
                        </div>
                        <p className="text-xs text-muted-foreground/80 mt-1 italic">
                          Multiköpspris – du sparar {formatPrice(displayPrice * selectedOffer.quantity - selectedOffer.price)} kr
                        </p>
                      </div>
                    )}

                    {/* Estimated total for per-piece items (quantity > 1) */}
                    {showEstimate && (
                      <div className="bg-muted/60 rounded-xl p-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{quantity} st × {formatPrice(displayPrice)} kr</span>
                          <span className="font-semibold">Cirka {formatPrice(estimatedTotalPrice)} kr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Uppskattad vikt</span>
                          <span className="font-semibold">Cirka {formatWeight(estimatedTotalWeight)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground/80 mt-1 italic">
                          Vikten varierar per styck – slutpriset kan justeras vid leverans.
                        </p>
                      </div>
                    )}

                    {/* Desktop add to cart button */}
                    <Button
                      className="hidden sm:flex w-full gap-2"
                      size="lg"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {isKgProduct
                        ? `${selectedWeight} g · ≈ ${formatPrice(kgTotalPrice)} kr — Lägg i varukorg`
                        : `${quantity} st · ${product?.pricingType === 'weight_based' ? '≈ ' : ''}${formatPrice(displayTotalPrice)} kr — Lägg i varukorg`}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* STICKY Mobile footer - always visible at bottom */}
            <div className="sm:hidden sticky bottom-0 left-0 right-0 bg-background border-t border-border/60 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50 safe-area-pb">
              {/* Estimate line for mobile */}
              {showEstimate && (
                <div className="flex justify-between text-xs text-muted-foreground mb-2 px-1">
                  <span>Cirka {formatWeight(estimatedTotalWeight)}</span>
                  <span className="italic">Vikten varierar per styck</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                {/* Quantity controls — hide for kg products */}
                {!isKgProduct && (
                  <div className="flex items-center gap-1 bg-muted/50 rounded-full p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      aria-label="Minska antal"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={() => setQuantity((prev) => Math.min(99, prev + 1))}
                      aria-label="Öka antal"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Add to cart button */}
                <Button
                  className="flex-1 gap-2 h-12 text-base font-semibold shadow-lg"
                  size="lg"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isKgProduct
                    ? `${selectedWeight} g · ≈ ${formatPrice(kgTotalPrice)} kr`
                    : `${quantity} st · ${product?.pricingType === 'weight_based' ? '≈ ' : ''}${formatPrice(displayTotalPrice)} kr`}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
