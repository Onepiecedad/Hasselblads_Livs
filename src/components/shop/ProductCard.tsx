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
  // Bygg lista av taggar att visa (max 2)
  const displayTags: { label: string; variant: 'default' | 'eco' | 'fair' }[] = [];

  if (product.tags.includes("eko")) {
    displayTags.push({ label: "🌱 Eko", variant: "eco" });
  }
  if (product.tags.includes("fairtrade")) {
    displayTags.push({ label: "🤝 Fairtrade", variant: "fair" });
  }
  if (product.tags.includes("sasong") && displayTags.length < 2) {
    displayTags.push({ label: "Säsong", variant: "default" });
  }
  if (product.tags.includes("erbjudande") && displayTags.length < 2) {
    displayTags.push({ label: "Erbjudande", variant: "default" });
  }
  if (product.tags.includes("nyhet") && displayTags.length < 2) {
    displayTags.push({ label: "Nyhet", variant: "default" });
  }

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
        {displayTags.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1 z-10">
            {displayTags.map((tag, i) => (
              <Badge
                key={i}
                className={
                  tag.variant === "eco"
                    ? "bg-green-600 text-white shadow-lg backdrop-blur-sm"
                    : tag.variant === "fair"
                      ? "bg-blue-600 text-white shadow-lg backdrop-blur-sm"
                      : "bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm"
                }
              >
                {tag.label}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col p-3 sm:p-5">
        <div className="flex-1 space-y-1.5">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-foreground/90 sm:text-base">{product.name}</h3>
          {product.description && (
            <p className="text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed sm:text-sm">{product.description}</p>
          )}
        </div>
        <div className="mt-4 flex items-end justify-between gap-1">
          <div>
            <p className="text-lg font-bold text-primary sm:text-xl">{product.price} kr</p>
            <p className="text-[10px] text-muted-foreground/60 sm:text-xs">{product.unit}</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full h-8 w-8 bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-colors sm:h-10 sm:w-10"
            aria-label={`Lägg ${product.name} i varukorgen`}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;


