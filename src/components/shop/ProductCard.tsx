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
    e.stopPropagation(); // Förhindra att QuickView öppnas
    onAddToCart(product);
  };

  return (
    <Card
      ref={setQuickViewButtonRef}
      className="group flex h-full flex-col overflow-hidden border border-border/70 transition-all hover:shadow-lg cursor-pointer"
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

