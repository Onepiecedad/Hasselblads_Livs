import { useEffect, useState, type RefObject } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export type QuickViewProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  origin: { country: string; flag: string };
  image: string;
  tags: string[];
};

interface QuickViewModalProps {
  product: QuickViewProduct | null;
  related: QuickViewProduct[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (product: QuickViewProduct, quantity: number) => void;
  returnFocusRef?: RefObject<HTMLButtonElement> | null;
}

const QuickViewModal = ({ product, related, open, onOpenChange, onAddToCart, returnFocusRef }: QuickViewModalProps) => {
  const [quantity, setQuantity] = useState(1);

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

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && returnFocusRef?.current) {
          returnFocusRef.current.focus();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-3xl gap-6 p-0 sm:max-h-[85vh] sm:rounded-3xl overflow-y-auto">
        {product && (
          <div className="grid gap-6 p-6 sm:grid-cols-[1.2fr_1fr] sm:p-8">
            <div className="overflow-hidden rounded-2xl bg-muted">
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <DialogHeader className="space-y-4 text-left">
                <DialogTitle className="text-2xl font-semibold">{product.name}</DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  {product.description}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <Badge className="bg-primary/10 text-primary">{product.origin.flag} {product.origin.country}</Badge>
                  <span>{product.unit}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-primary">{product.price} kr</span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 w-9 rounded-full"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      aria-label="Minska antal"
                    >
                      −
                    </Button>
                    <Input
                      value={quantity.toString()}
                      onChange={(event) => handleQuantityChange(event.target.value)}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="h-9 w-16 text-center"
                      aria-label="Antal"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 w-9 rounded-full"
                      onClick={() => setQuantity((prev) => Math.min(99, prev + 1))}
                      aria-label="Öka antal"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button className="w-full" size="lg" onClick={() => onAddToCart(product, quantity)}>
                  Lägg i varukorg
                </Button>
              </DialogFooter>
            </div>

            {related.length > 0 && (
              <div className="sm:col-span-2">
                <Separator className="my-4" />
                <h3 className="text-lg font-semibold">Relaterade produkter</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {related.map((item) => (
                    <div key={item.id} className="flex gap-4 rounded-2xl border border-border/60 p-4">
                      <div className="h-20 w-20 overflow-hidden rounded-xl bg-muted">
                        <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground line-clamp-2">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.unit}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary">{item.price} kr</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
