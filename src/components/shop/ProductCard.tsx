import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/lib/products";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  setQuickViewButtonRef?: (node: HTMLElement | null) => void;
}

const ProductCard = ({ product, onAddToCart, onQuickView, setQuickViewButtonRef }: ProductCardProps) => {
  const featuredTag = product.tags.includes("sasong")
    ? "Säsong"
    : product.tags.includes("erbjudande")
      ? "Erbjudande"
      : product.tags.includes("nyhet")
        ? "Nyhet"
        : null;

  const handleCardClick = () => {
    onQuickView(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <Card
      ref={setQuickViewButtonRef}
      className="group flex h-full flex-col overflow-hidden border-0 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer rounded-2xl"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Visa ${product.name}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-white/50 rounded-t-2xl p-4 flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
        />
        {featuredTag && (
          <Badge className="absolute left-3 top-3 bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm z-10">
            {featuredTag}
          </Badge>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="flex-1 space-y-1.5">
          <h3 className="text-base font-semibold leading-snug line-clamp-2 text-foreground/90">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-muted-foreground/70 line-clamp-2 leading-relaxed">{product.description}</p>
          )}
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xl font-bold text-primary">{product.price} kr</p>
            <p className="text-xs text-muted-foreground/60">{product.unit}</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full h-10 w-10 bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label={`Lägg ${product.name} i varukorgen`}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;


