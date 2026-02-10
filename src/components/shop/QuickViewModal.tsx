import { useEffect, useState, type RefObject } from "react";
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

export type QuickViewProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  priceUnit?: 'kg' | 'st';
  approximateWeight?: string;
  origin: { country: string; flag: string };
  image: string;
  tags: string[];
};

interface QuickViewModalProps {
  product: QuickViewProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (product: QuickViewProduct, quantity: number) => void;
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
    }
  }, [open]);

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
      onAddToCart(product, quantity);
    }
  };

  // Calculate estimated weight/price for per-piece items
  const isPieceItem = product?.priceUnit === 'st';
  const weightPerUnit = product?.approximateWeight ? parseWeight(product.approximateWeight) : null;
  const showEstimate = isPieceItem && weightPerUnit && quantity > 1;
  const estimatedTotalWeight = weightPerUnit ? weightPerUnit * quantity : 0;
  const estimatedTotalPrice = product ? product.price * quantity : 0;

  // Unit display label
  const unitLabel = product?.priceUnit === 'kg' ? 'per kg' : 'per st';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0 sm:max-h-[85vh] sm:rounded-3xl overflow-hidden flex flex-col">
        {product && (
          <>
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid gap-6 p-6 sm:grid-cols-[1.2fr_1fr] sm:p-8 pb-24 sm:pb-8">
                {/* Product image */}
                <div className="overflow-hidden rounded-2xl bg-muted aspect-square sm:aspect-auto">
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

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                      <span className="text-xl text-muted-foreground">kr/{product.priceUnit || 'st'}</span>
                    </div>

                    {/* Approximate weight for per-piece items */}
                    {isPieceItem && product.approximateWeight && (
                      <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 inline-block">
                        ≈ {product.approximateWeight} per styck
                      </p>
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
                          <span className="text-muted-foreground">{quantity} st × {formatPrice(product.price)} kr</span>
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
                      Lägg i varukorg
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* STICKY Mobile footer - always visible at bottom */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border/60 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50 safe-area-pb">
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
                  {showEstimate ? `Cirka ${formatPrice(estimatedTotalPrice)} kr` : `${formatPrice(product.price * quantity)} kr`}
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
