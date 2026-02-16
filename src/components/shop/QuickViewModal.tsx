import { useEffect, useState, useMemo, type RefObject } from "react";
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
import { type PortionSize, PORTION_LABELS, PORTION_MULTIPLIERS } from "@/context/CartContext";
import type { MultiOffer } from "@/lib/products";

export type QuickViewProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  unit: string;
  priceUnit?: 'kg' | 'st';
  pricingType?: 'unit_based' | 'weight_based';
  pricePerKg?: number;
  estimatedWeightG?: number;
  approximateWeight?: string;
  origin: { country: string; flag: string };
  image: string;
  tags: string[];
  sold_as?: ('hel' | 'halv' | 'kvart')[];
  multiOffers?: MultiOffer[];
};

interface QuickViewModalProps {
  product: QuickViewProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (product: QuickViewProduct, quantity: number, portion?: PortionSize) => void;
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
  const [selectedOffer, setSelectedOffer] = useState<MultiOffer | null>(null);
  const hasMultiOffers = product?.multiOffers && product.multiOffers.length > 0;

  // Portionsval
  const hasPortions = product?.sold_as && product.sold_as.length > 1;
  const defaultPortion = product?.sold_as?.[0] ?? 'hel';
  const [selectedPortion, setSelectedPortion] = useState<PortionSize>(defaultPortion);

  const portionPrice = useMemo(() => {
    if (!product) return 0;
    if (!hasPortions) return product.price;
    return Math.round(product.price * PORTION_MULTIPLIERS[selectedPortion]);
  }, [product, selectedPortion, hasPortions]);

  const displayPrice = hasPortions ? portionPrice : (product?.price ?? 0);

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
      setSelectedOffer(null);
      if (product?.sold_as?.[0]) {
        setSelectedPortion(product.sold_as[0]);
      }
    }
  }, [open, product]);

  const handleSelectOffer = (offer: MultiOffer | null) => {
    if (offer) {
      setSelectedOffer(offer);
      setQuantity(offer.quantity);
    } else {
      setSelectedOffer(null);
      setQuantity(1);
    }
  };

  const activeMultiPrice = selectedOffer ? selectedOffer.price : null;
  const displayTotalPrice = activeMultiPrice ?? (product ? displayPrice * quantity : 0);

  const handleQuantityChange = (value: string) => {
    const next = Number.parseInt(value, 10);
    if (Number.isNaN(next)) {
      setQuantity(1);
    } else {
      setQuantity(Math.max(1, Math.min(next, 99)));
    }
  };

  const handleAddToCart = () => {
    if (product) {
      onAddToCart(product, quantity, hasPortions ? selectedPortion : undefined);
    }
  };

  // Calculate estimated weight/price for per-piece items
  const isPieceItem = product?.priceUnit === 'st';
  const weightPerUnit = product?.approximateWeight ? parseWeight(product.approximateWeight) : null;
  const showEstimate = isPieceItem && weightPerUnit && quantity > 1;
  const estimatedTotalWeight = weightPerUnit ? weightPerUnit * quantity : 0;
  const estimatedTotalPrice = product ? displayPrice * quantity : 0;

  // Unit display label
  const unitLabel = product?.pricingType === 'weight_based'
    ? 'per st (viktpris)'
    : product?.priceUnit === 'kg' ? 'per kg' : 'per st';

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
                    <DialogTitle className="text-2xl font-semibold leading-tight">{product.name}</DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground leading-relaxed">
                      {product.description}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="mt-4 space-y-4">
                    {/* Origin and unit badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-sm px-3 py-1">
                        <span className="mr-1.5 text-base">{product.origin.flag}</span>
                        {product.origin.country}
                      </Badge>
                      <Badge variant="outline" className="text-muted-foreground text-sm px-3 py-1">
                        {unitLabel}
                      </Badge>
                    </div>

                    {/* Portionsväljare (pill-knappar) */}
                    {hasPortions && (
                      <div className="flex gap-1.5">
                        {product.sold_as!.map((p) => (
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

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      {product.pricingType === 'weight_based' ? (
                        <>
                          <span className="text-3xl font-bold text-primary">ca {formatPrice(displayPrice)}</span>
                          <span className="text-xl text-muted-foreground">kr/st</span>
                          {hasPortions && selectedPortion !== 'hel' && (
                            <span className="text-sm text-muted-foreground">({PORTION_LABELS[selectedPortion].toLowerCase()})</span>
                          )}
                        </>
                      ) : product.salePrice && product.salePrice < product.price ? (
                        <>
                          <span className="text-3xl font-bold text-rose-600">{formatPrice(hasPortions ? (product.salePrice * (PORTION_MULTIPLIERS[selectedPortion] ?? 1)) : product.salePrice)}</span>
                          <span className="text-xl text-muted-foreground">kr/{product.priceUnit || 'st'}</span>
                          <span className="ml-2 text-xs font-bold bg-rose-100 text-rose-600 px-2 py-1 rounded-full">REA</span>
                          <span className="text-base text-muted-foreground line-through ml-2">Ord. {formatPrice(displayPrice)} kr</span>
                        </>
                      ) : (
                        <>
                          <span className="text-3xl font-bold text-primary">{formatPrice(displayPrice)}</span>
                          <span className="text-xl text-muted-foreground">kr/{product.priceUnit || 'st'}</span>
                          {hasPortions && selectedPortion !== 'hel' && (
                            <span className="text-sm text-muted-foreground">({PORTION_LABELS[selectedPortion].toLowerCase()})</span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Weight-based price info */}
                    {product.pricingType === 'weight_based' && product.pricePerKg && (
                      <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 inline-block">
                        {formatPrice(product.pricePerKg)} kr/kg · ca {product.estimatedWeightG} g
                      </p>
                    )}

                    {/* Approximate weight for per-piece items */}
                    {product.pricingType !== 'weight_based' && isPieceItem && product.approximateWeight && !hasPortions && (
                      <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 inline-block">
                        ≈ {product.approximateWeight} per styck
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
                    <div className="hidden sm:flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Antal:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full"
                          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                          aria-label="Minska antal"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          value={quantity.toString()}
                          onChange={(event) => handleQuantityChange(event.target.value)}
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
                          onClick={() => setQuantity((prev) => Math.min(99, prev + 1))}
                          aria-label="Öka antal"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

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
                      {selectedOffer
                        ? `${selectedOffer.quantity} st för ${selectedOffer.price}:- — Lägg i varukorg`
                        : 'Lägg i varukorg'}
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
                {/* Quantity controls */}
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

                {/* Add to cart button */}
                <Button
                  className="flex-1 gap-2 h-12 text-base font-semibold shadow-lg"
                  size="lg"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {selectedOffer
                    ? `${selectedOffer.quantity} st — ${selectedOffer.price}:-`
                    : showEstimate ? `Cirka ${formatPrice(estimatedTotalPrice)} kr` : `${formatPrice(displayPrice * quantity)} kr`}
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
