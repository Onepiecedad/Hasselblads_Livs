import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye } from "lucide-react";
import { Product } from "@/lib/products";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  setQuickViewButtonRef?: (node: HTMLButtonElement | null) => void;
}

const ProductCard = ({ product, onAddToCart, onQuickView, setQuickViewButtonRef }: ProductCardProps) => {
  const featuredTag = product.tags.includes("sasong")
    ? "Säsong"
    : product.tags.includes("erbjudande")
    ? "Erbjudande"
    : product.tags.includes("nyhet")
    ? "Nyhet"
    : null;

  return (
    <Card className="group flex h-full flex-col overflow-hidden border border-border/70 transition-all hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {featuredTag && (
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground shadow-sm">
            {featuredTag}
          </Badge>
        )}
        <div className="absolute right-3 top-3 flex gap-2">
          <Button
            ref={setQuickViewButtonRef}
            type="button"
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full bg-white/90 text-muted-foreground shadow"
            onClick={() => onQuickView(product)}
            aria-label={`Öppna snabbvisning för ${product.name}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col p-4">
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold leading-tight line-clamp-2">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary">{product.price} kr</p>
            <p className="text-xs text-muted-foreground">{product.unit}</p>
          </div>
          <Button
            size="icon"
            variant="outline"
            className="rounded-full"
            aria-label={`Lägg ${product.name} i varukorgen`}
            onClick={() => onAddToCart(product)}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
