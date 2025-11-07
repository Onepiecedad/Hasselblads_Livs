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
import { useCart } from "@/context/CartContext";

const MiniCartDrawer = () => {
  const { items, isOpen, subtotal, shippingFee, total, updateQuantity, removeItem, setOpen } = useCart();
  const hasItems = items.length > 0;

  return (
    <Drawer open={isOpen} onOpenChange={setOpen}>
      <DrawerContent className="h-[85vh] max-h-[680px] w-full overflow-hidden border-border/80 bg-background p-0 shadow-2xl sm:mx-auto sm:max-w-lg">
        <div className="flex h-full flex-col">
          <DrawerHeader className="border-b border-border/60 text-left">
            <DrawerTitle>Din varukorg</DrawerTitle>
            <DrawerDescription>
              {hasItems ? "Justera antal eller gå direkt till kassan." : "Varukorgen är tom – dags att lägga till något gott."}
            </DrawerDescription>
          </DrawerHeader>

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
                <p className="text-muted-foreground">Din varukorg är tom just nu.</p>
                <Button asChild className="mt-4">
                  <Link to="/webbutik" onClick={() => setOpen(false)}>
                    Fortsätt shoppa
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
                  <span>{shippingFee === 0 ? "0 kr (fri frakt över 600 kr)" : `${shippingFee} kr`}</span>
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

          <DrawerFooter className="relative border-t border-border/60 bg-background p-4">
            <div className="hidden w-full sm:block">
              <Button asChild size="lg" className="w-full" disabled={!hasItems}>
                <Link to="/kassa" onClick={() => setOpen(false)}>
                  Till kassan
                </Link>
              </Button>
            </div>
            <div className="sm:hidden">
              <div className="sticky bottom-2">
                <Button asChild size="lg" className="w-full shadow-lg" disabled={!hasItems}>
                  <Link to="/kassa" onClick={() => setOpen(false)}>
                    Till kassan
                  </Link>
                </Button>
              </div>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MiniCartDrawer;
