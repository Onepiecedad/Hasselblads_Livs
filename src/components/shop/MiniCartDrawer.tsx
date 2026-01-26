import { Link } from "react-router-dom";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useCart } from "@/context/CartContext";
import { addItemsAndRedirectToCheckout } from "@/lib/woocommerce";
import { Truck, ShoppingBag, X, ExternalLink } from "lucide-react";

const FREE_SHIPPING_THRESHOLD = 600;

const MiniCartDrawer = () => {
  const { items, isOpen, subtotal, shippingFee, total, updateQuantity, removeItem, clearCart, setOpen } = useCart();
  const hasItems = items.length > 0;

  // Free shipping progress
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <Drawer open={isOpen} onOpenChange={setOpen}>
      <DrawerContent className="h-[85vh] max-h-[680px] w-full overflow-hidden border-border/80 bg-background p-0 shadow-2xl sm:mx-auto sm:max-w-lg">
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
                      Fri frakt vid {FREE_SHIPPING_THRESHOLD} kr
                    </span>
                    <span className="font-medium text-primary">
                      {amountToFreeShipping} kr kvar
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {hasItems ? (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-xl border border-border/60 bg-muted">
                      <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-semibold leading-tight">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.unit}</p>
                      </div>
                      <div className="flex items-center justify-between">
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
                          <span className="min-w-[2rem] text-center text-sm font-semibold">{item.quantity}</span>
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
                          <p className="text-sm font-semibold">{item.price * item.quantity} kr</p>
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
                  </li>
                ))}
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

          {hasItems && (
            <div className="border-t border-border/60 bg-muted/30 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Delsumma</span>
                  <span>{subtotal} kr</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Frakt</span>
                  <span className={hasFreeShipping ? "text-green-600 font-medium" : ""}>
                    {shippingFee === 0 ? "Gratis" : `${shippingFee} kr`}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Att betala</span>
                  <span>{total} kr</span>
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
                    addItemsAndRedirectToCheckout(items, clearCart);
                  }}
                >
                  Till kassan · {total} kr
                  <ExternalLink className="h-4 w-4" />
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
