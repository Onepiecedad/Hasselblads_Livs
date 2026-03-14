import { useRef, useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useCart } from "@/context/CartContext";
import {
  FREE_HOME_DELIVERY_THRESHOLD,
  qualifiesForFreeHomeDelivery,
} from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";
import { Truck, ShoppingBag, X, ArrowRight, Trash2, ChevronDown } from "lucide-react";

function formatLineSummary(quantity: number, lineTotal: number, weightGrams?: number) {
  const parts = [`${quantity} st`];

  if (weightGrams) {
    parts.push(`${weightGrams * quantity} g`);
  }

  parts.push(`${formatPrice(lineTotal)} kr`);
  return parts.join(" · ");
}

const MiniCartDrawer = () => {
  const navigate = useNavigate();
  const { items, isOpen, subtotal, shippingFee, total, updateQuantity, removeItem, clearCart, setOpen } = useCart();
  const hasItems = items.length > 0;

  // Scroll indicator
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) { setCanScrollDown(false); return; }
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    setCanScrollDown(remaining > 10);
  }, []);

  useEffect(() => {
    checkScroll();
    // Re-check after drawer animation completes (DOM may not be measured yet)
    if (isOpen) {
      const timer = setTimeout(checkScroll, 150);
      return () => clearTimeout(timer);
    }
  }, [items, isOpen, checkScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  // Free shipping progress
  const amountToFreeShipping = Math.max(0, FREE_HOME_DELIVERY_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_HOME_DELIVERY_THRESHOLD) * 100);
  const hasFreeShipping = qualifiesForFreeHomeDelivery(subtotal);

  return (
    <Drawer open={isOpen} onOpenChange={setOpen}>
      <DrawerContent className="mini-cart-centered h-[85vh] max-h-[720px] w-full overflow-hidden border-border/80 bg-background p-0 shadow-2xl sm:mx-auto sm:max-w-2xl">
        <div className="flex h-full flex-col">
          <DrawerHeader className="border-b border-border/60 text-left relative">
            <DrawerTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Din varukorg
              {hasItems && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({items.length} {items.length === 1 ? 'vara' : 'varor'})
                </span>
              )}
            </DrawerTitle>
            <DrawerDescription>
              {hasItems ? "Justera antal eller gå direkt till kassan." : "Varukorgen är tom – dags att lägga till något gott."}
            </DrawerDescription>

            {/* Clear cart button */}
            {hasItems && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="absolute right-14 top-4 p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Töm varukorg"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Töm varukorgen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Alla produkter kommer tas bort. Detta går inte att ångra.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Avbryt</AlertDialogCancel>
                    <AlertDialogAction onClick={clearCart}>
                      Töm varukorg
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Close button for mobile */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Stäng varukorg"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </DrawerHeader>

          {/* Free shipping progress */}
          {hasItems && (
            <div className="px-6 py-3 bg-muted/30 border-b border-border/30">
              {hasFreeShipping ? (
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                  <Truck className="h-4 w-4" />
                  <span>🎉 Grattis! Du har fri frakt!</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Truck className="h-4 w-4" />
                      Fri frakt vid {FREE_HOME_DELIVERY_THRESHOLD} kr
                    </span>
                    <span className="font-medium text-primary">
                      {formatPrice(amountToFreeShipping)} kr kvar
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
              )}
            </div>
          )}

          <div className="relative flex-1 min-h-0">
            {/* Scroll fade + hint */}
            <div className={`cart-scroll-fade ${canScrollDown ? 'visible' : ''}`} />
            <button
              type="button"
              className={`cart-scroll-hint ${canScrollDown ? 'visible' : ''}`}
              onClick={() => scrollRef.current?.scrollBy({ top: 200, behavior: 'smooth' })}
              aria-label="Scrolla ner"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden px-4 sm:px-7 py-4 sm:py-5">
              {hasItems ? (
                <ul className="divide-y divide-border/40">
                  {items.map((item) => {
                    const lineTotal = item.lineTotal ?? (item.price * item.quantity);
                    const lineSummary = formatLineSummary(item.quantity, lineTotal, item.weightGrams);

                    return (
                    <li key={item.id} className="grid grid-cols-[64px_1fr] gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:gap-5 sm:py-5">
                      {/* Product image */}
                      <div className="h-16 w-16 overflow-hidden rounded-xl border border-border/60 bg-muted flex-shrink-0 sm:h-[88px] sm:w-[88px]">
                        <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
                      </div>

                      {/* Product info */}
                      <div className="flex min-w-0 flex-col justify-center">
                        <h3 className="text-base font-semibold leading-snug line-clamp-2 sm:text-lg">
                          {item.name}
                          {item.portionLabel && item.portionLabel !== 'Hel' && (
                            <span className="text-sm font-normal text-muted-foreground ml-1">({item.portionLabel.toLowerCase()})</span>
                          )}
                        </h3>
                        <p className="mt-0.5 text-sm text-muted-foreground sm:text-base">
                          {item.weightGrams ? `${item.weightGrams} g · ≈ ${formatPrice(item.price)} kr` : item.unit}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground/80 sm:text-sm">
                          {lineSummary}
                        </p>
                        {item.appliedOfferLabel ? (
                          <span className="mt-1 inline-flex w-fit max-w-full flex-wrap rounded-md border border-orange-500/20 bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-orange-600 sm:text-[11px]">
                            {item.appliedOfferLabel}
                          </span>
                        ) : null}
                        {/* Mobile: quantity and price inline */}
                        <div className="flex items-center justify-between mt-2 sm:hidden">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label={`Minska ${item.name}`}
                            >
                              −
                            </Button>
                            <span className="min-w-[2.5rem] text-center text-base font-semibold">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label={`Öka ${item.name}`}
                            >
                              +
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-bold tabular-nums">
                              {formatPrice(lineTotal)} kr
                            </p>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-xs text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-primary"
                            >
                              Ta bort
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Desktop: Controls and price */}
                      <div className="hidden min-w-[168px] flex-col items-end justify-center gap-3 sm:flex">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label={`Minska ${item.name}`}
                          >
                            −
                          </Button>
                          <span className="min-w-[2.5rem] text-center text-base font-semibold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label={`Öka ${item.name}`}
                          >
                            +
                          </Button>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="whitespace-nowrap text-base font-bold tabular-nums sm:text-lg">
                            {formatPrice(lineTotal)} kr
                          </p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="mt-1 text-xs text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-primary"
                          >
                            Ta bort
                          </button>
                        </div>
                      </div>
                    </li>
                  )})}
                </ul>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-muted/50 p-6 mb-4">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground mb-4">Din varukorg är tom just nu.</p>
                  <Button asChild>
                    <Link to="/webbutik" onClick={() => setOpen(false)}>
                      Börja handla
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {hasItems && (
            <div className="border-t border-border/60 bg-muted/30 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Delsumma</span>
                  <span>{formatPrice(subtotal)} kr</span>
                </div>

                <Separator />
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Att betala</span>
                  <span>{formatPrice(subtotal)} kr</span>
                </div>
                <div>
                  <label htmlFor="discount" className="text-sm text-muted-foreground">
                    Rabattkod
                  </label>
                  <Input id="discount" name="discount" placeholder="Ex. SOMMAR" className="mt-2" />
                </div>
              </div>
            </div>
          )}

          <DrawerFooter className="relative border-t border-border/60 bg-background p-4 space-y-2">
            {hasItems ? (
              <>
                {/* Checkout button - redirects to WooCommerce */}
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => {
                    setOpen(false);
                    navigate('/kassa');
                  }}
                >
                  Till kassan · {formatPrice(subtotal)} kr
                  <ArrowRight className="h-4 w-4" />
                </Button>

                {/* Continue shopping button */}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  Fortsätt handla
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Stäng
              </Button>
            )}
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MiniCartDrawer;
