import { useState, memo, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, RotateCcw } from "lucide-react";
import { type MultiOffer, Product, getAutoOffer } from "@/lib/products";
import { NutritionTable } from "./NutritionTable";
import { formatPrice } from "@/lib/utils";
import { type PortionSize, PORTION_LABELS, PORTION_MULTIPLIERS, PORTION_ORDER } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity?: number, portion?: PortionSize, weightGrams?: number, multiOffer?: MultiOffer) => void;
  onQuickView: (product: Product) => void;
  setQuickViewButtonRef?: (node: HTMLElement | null) => void;
}

const ProductCard = ({ product, onAddToCart, onQuickView, setQuickViewButtonRef }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);

  const [isFlipped, setIsFlipped] = useState(false);

  // Portionsval
  const hasPortions = product.sold_as && product.sold_as.length > 1;
  const sortedPortions = useMemo(() =>
    hasPortions ? [...product.sold_as!].sort((a, b) => PORTION_ORDER.indexOf(a) - PORTION_ORDER.indexOf(b)) : product.sold_as,
    [product.sold_as, hasPortions]);
  const defaultPortion = sortedPortions?.includes('hel') ? 'hel' : (sortedPortions?.[0] ?? 'hel');
  const [selectedPortion, setSelectedPortion] = useState<PortionSize>(defaultPortion);
  const isKgProduct = product.priceUnit === 'kg' && product.pricingType !== 'weight_based';
  const defaultWeight = 200;

  const portionPrice = useMemo(() => {
    if (!hasPortions) return product.price;
    return Math.round(product.price * PORTION_MULTIPLIERS[selectedPortion]);
  }, [product.price, selectedPortion, hasPortions]);

  // Kolla om produkten har baksideinformation
  const hasBackInfo = product.backImageUrl || product.ingredients || product.allergens?.length || product.nutritionData;

  // Bygg lista av taggar att visa (max 3)
  const displayTags: { label: string; variant: 'default' | 'season' | 'new' | 'offer' | 'featured' | 'eko' | 'fairtrade' | 'lokalt' }[] = [];

  const MAX_TAGS = 3;
  const tags = product.tags || [];

  // Erbjudande (prioritet — syns alltid om den finns)
  if ((tags.includes("erbjudanden") || tags.includes("erbjudande")) && displayTags.length < MAX_TAGS) {
    displayTags.push({ label: "Erbjudande", variant: "offer" });
  }
  // Godast just nu
  if (tags.includes("godast") && displayTags.length < MAX_TAGS) {
    displayTags.push({ label: "Godast just nu", variant: "featured" });
  }
  // Nyhet
  if ((tags.includes("nyheter") || tags.includes("nyhet")) && displayTags.length < MAX_TAGS) {
    displayTags.push({ label: "Nyhet", variant: "new" });
  }
  // I säsong
  if ((tags.includes("isasong") || tags.includes("sasong")) && displayTags.length < MAX_TAGS) {
    displayTags.push({ label: "I säsong", variant: "season" });
  }
  // Ekologisk
  if (tags.includes("eko") && displayTags.length < MAX_TAGS) {
    displayTags.push({ label: "Ekologisk", variant: "eko" });
  }
  // Fairtrade
  if (tags.includes("fairtrade") && displayTags.length < MAX_TAGS) {
    displayTags.push({ label: "Fairtrade", variant: "fairtrade" });
  }
  // Lokalt / Närodlat
  if (tags.includes("lokalt") && displayTags.length < MAX_TAGS) {
    displayTags.push({ label: "Lokalt", variant: "lokalt" });
  }

  const handleCardClick = () => {
    // Öppna bara QuickView om kortet inte är flippat
    if (!isFlipped) {
      onQuickView(product);
    }
  };

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };



  const handleQuantityChange = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    setQuantity(prev => Math.max(1, Math.min(99, prev + delta)));
  };

  const handleConfirmAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const autoOffer = getAutoOffer(quantity, product.multiOffers);
    onAddToCart(product, quantity, hasPortions ? selectedPortion : undefined, isKgProduct ? defaultWeight : undefined, autoOffer);
    setQuantity(1);
  };

  return (
    <div
      className="flip-card-container perspective-1000 h-full"
      ref={setQuickViewButtonRef}
    >
      <div className={`flip-card-inner ${isFlipped ? 'is-flipped' : ''}`}>

        {/* ===== FRAMSIDA ===== */}
        <Card
          className="flip-card-front group flex h-full flex-col overflow-hidden border-0 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-xl cursor-pointer rounded-2xl"
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
          <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden bg-white/50 rounded-t-2xl p-2 sm:p-4 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
            />

            {/* Flip-knapp (visa endast om produkten har baksideinformation) */}
            {hasBackInfo && (
              <button
                onClick={handleFlip}
                className="flip-button"
                aria-label="Visa baksida"
              >
                <RotateCcw size={14} className="text-gray-600" />
              </button>
            )}



            {/* Origin flag - small badge in corner */}
            {product.origin?.flag && !hasBackInfo && (
              <div className="absolute right-2 top-2 z-10" title={product.origin.country} aria-label={`Ursprung: ${product.origin.country}`}>
                <img
                  src={`https://flagcdn.com/w40/${product.origin.flag}.png`}
                  srcSet={`https://flagcdn.com/w80/${product.origin.flag}.png 2x`}
                  alt={product.origin.country || 'Country'}
                  className="w-6 h-auto drop-shadow-sm rounded-[1px]"
                  loading="lazy"
                />
              </div>
            )}
          </div>

          <CardContent className="flex flex-1 flex-col p-2 sm:p-5">
            {/* Tags */}
            {displayTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {displayTags.map((tag, i) => (
                  <Badge
                    key={i}
                    className={
                      ({
                        featured: "bg-amber-100/90 text-amber-900 border-amber-200 shadow-sm font-semibold",
                        new: "bg-blue-100/90 text-blue-900 border-blue-200 shadow-sm font-medium",
                        season: "bg-lime-100/90 text-lime-900 border-lime-200 shadow-sm font-medium",
                        offer: "bg-red-100/90 text-red-900 border-red-200 shadow-sm font-semibold",
                        eko: "bg-emerald-100/90 text-emerald-900 border-emerald-200 shadow-sm font-medium",
                        fairtrade: "bg-orange-100/90 text-orange-900 border-orange-200 shadow-sm font-medium",
                        lokalt: "bg-teal-100/90 text-teal-900 border-teal-200 shadow-sm font-medium",
                        default: "bg-slate-100/90 text-slate-800 border-slate-200 shadow-sm font-medium",
                      }[tag.variant] || "bg-slate-100/90 text-slate-800 border-slate-200 shadow-sm font-medium")
                    }
                  >
                    {tag.label}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between items-start gap-2">
                {product.brand && (
                  <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">
                    {product.brand}
                  </div>
                )}
                {product.quality_class && product.category === 'frukt-gront' && (
                  <div className="text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide bg-emerald-100 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-sm">
                    {product.quality_class}
                  </div>
                )}
              </div>
              <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-foreground/90 sm:text-base">
                {product.name}
                {product.variety && (
                  <span className="ml-1.5 text-xs sm:text-sm font-normal text-muted-foreground">{product.variety}</span>
                )}
              </h3>
              {product.description && (
                <p className="hidden sm:block text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed sm:text-sm">{product.description}</p>
              )}
            </div>

            {/* Portionsväljare (pill-knappar) */}
            {hasPortions && (
              <div className="mt-3 flex gap-1" onClick={(e) => e.stopPropagation()}>
                {sortedPortions!.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedPortion(p); }}
                    className={`px-2.5 py-1 text-[11px] sm:text-xs font-medium rounded-full border transition-colors ${selectedPortion === p
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted'
                      }`}
                  >
                    {PORTION_LABELS[p]}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-2 flex items-end justify-between gap-1">
              <div className="min-w-0">
                {product.pricingType === 'weight_based' ? (
                  product.salePrice && product.salePrice < product.price ? (
                    <div>
                      <p className="text-base font-bold text-rose-600 sm:text-xl leading-tight">
                        ca {formatPrice(hasPortions ? (product.salePrice * (PORTION_MULTIPLIERS[selectedPortion] ?? 1)) : product.salePrice)} kr/st
                      </p>
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5">
                        <span className="text-[10px] sm:text-xs font-bold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">REA</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground line-through">Ord: {formatPrice(hasPortions ? portionPrice : product.price)} kr</span>
                      </div>
                      {(product.pricePerKg || product.estimatedWeightG) && (
                        <p className="text-[10px] text-muted-foreground/60 sm:text-xs mt-0.5 leading-tight">
                          {product.pricePerKg ? `${formatPrice(product.pricePerKg)} kr/kg` : ''}
                          {product.pricePerKg && product.estimatedWeightG ? ' · ' : ''}
                          {product.estimatedWeightG ? `ca ${product.estimatedWeightG} g` : ''}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="text-base font-bold text-primary sm:text-xl leading-tight">
                        ca {formatPrice(hasPortions ? portionPrice : product.price)} kr/st
                        {hasPortions && selectedPortion !== 'hel' && (
                          <span className="text-[10px] sm:text-xs font-normal text-muted-foreground ml-1">
                            ({PORTION_LABELS[selectedPortion].toLowerCase()})
                          </span>
                        )}
                      </p>
                      {(product.pricePerKg || product.estimatedWeightG) && (
                        <p className="text-[10px] text-muted-foreground/60 sm:text-xs mt-0.5 leading-tight">
                          {product.pricePerKg ? `${formatPrice(product.pricePerKg)} kr/kg` : ''}
                          {product.pricePerKg && product.estimatedWeightG ? ' · ' : ''}
                          {product.estimatedWeightG ? `ca ${product.estimatedWeightG} g` : ''}
                        </p>
                      )}
                    </>
                  )
                ) : (
                  <>
                    {product.salePrice && product.salePrice < product.price ? (
                      <div>
                        <p className="text-base font-bold text-rose-600 sm:text-xl leading-tight">
                          {formatPrice(hasPortions ? (product.salePrice * (PORTION_MULTIPLIERS[selectedPortion] ?? 1)) : product.salePrice)} kr/{product.priceUnit || 'st'}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5">
                          <span className="text-[10px] sm:text-xs font-bold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">REA</span>
                          <span className="text-[10px] sm:text-xs text-muted-foreground line-through">Ord: {formatPrice(hasPortions ? portionPrice : product.price)} kr</span>
                          {!hasPortions && product.priceUnit !== 'kg' && (product.approximateWeight || product.weightInGrams) && (
                            <span className="text-[10px] sm:text-xs font-normal text-amber-600">
                              ≈ {product.approximateWeight || `${product.weightInGrams} g`}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-base font-bold text-primary sm:text-xl leading-tight">
                          {formatPrice(hasPortions ? portionPrice : product.price)} kr/{product.priceUnit || 'st'}
                          {hasPortions && selectedPortion !== 'hel' && (
                            <span className="text-[10px] sm:text-xs font-normal text-muted-foreground ml-1">
                              ({PORTION_LABELS[selectedPortion].toLowerCase()})
                            </span>
                          )}
                        </p>
                        {!hasPortions && product.priceUnit !== 'kg' && (product.approximateWeight || product.weightInGrams) && (
                          <p className="text-[10px] sm:text-xs font-normal text-amber-600 mt-0.5 leading-tight">
                            ≈ {product.approximateWeight || `${product.weightInGrams} g`}
                          </p>
                        )}
                      </>
                    )}
                  </>
                )}
                {product.multiOffers && product.multiOffers.length > 0 && (
                  <span className="flex flex-wrap gap-0.5 mt-0.5">
                    {product.multiOffers.map((offer, i) => (
                      <span key={i} className="inline-block px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold rounded-md bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                        {offer.label}
                      </span>
                    ))}
                  </span>
                )}
                {product.origin?.country && product.origin.country !== 'Okänt' && (
                  <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70 sm:text-xs">
                    {product.origin?.flag ? (
                      <img
                        src={`https://flagcdn.com/w20/${product.origin.flag}.png`}
                        srcSet={`https://flagcdn.com/w40/${product.origin.flag}.png 2x`}
                        alt=""
                        className="w-3.5 h-auto rounded-[1px]"
                        loading="lazy"
                      />
                    ) : (
                      <span>🌍</span>
                    )}
                    {product.origin.country}
                  </p>
                )}
              </div>

              {/* Quantity selector + Add button (always visible) */}
              <div
                className="flex items-center gap-1 bg-muted/50 rounded-full p-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                  onClick={(e) => handleQuantityChange(e, -1)}
                  aria-label="Minska antal"
                >
                  <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Button>
                <span className="w-5 sm:w-6 text-center text-xs sm:text-sm font-semibold">{quantity}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                  onClick={(e) => handleQuantityChange(e, 1)}
                  aria-label="Öka antal"
                >
                  <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Button>
                <Button
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary hover:bg-primary/90"
                  onClick={handleConfirmAdd}
                  aria-label={`Lägg ${quantity} ${product.name} i varukorgen`}
                >
                  <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== BAKSIDA ===== */}
        <Card
          className="flip-card-back flex h-full flex-col overflow-hidden border-0 bg-card/95 backdrop-blur-sm shadow-lg rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Flip-tillbaka-knapp */}
          <button
            onClick={handleFlip}
            className="flip-button"
            aria-label="Visa framsida"
          >
            <RotateCcw size={14} className="text-gray-600" />
          </button>

          {/* Baksidebild */}
          {product.backImageUrl && (
            <div className="aspect-[4/3] overflow-hidden bg-white/50 rounded-t-2xl p-3 flex items-center justify-center">
              <img
                src={product.backImageUrl}
                alt={`${product.name} - baksida`}
                loading="lazy"
                className="h-full w-full object-contain"
              />
            </div>
          )}

          {/* Baksideinnehåll */}
          <CardContent className={`flex-1 ${product.backImageUrl ? 'p-2' : 'p-3'} overflow-y-auto scrollbar-elegant`}>
            <div className="space-y-2.5">
              {/* Produktnamn på baksidan */}
              <h4 className="text-xs font-semibold text-foreground/80 border-b border-border/50 pb-1.5 line-clamp-1">
                {product.name}
              </h4>

              {/* Allergener */}
              {product.allergens && product.allergens.length > 0 && (
                <div>
                  <h5 className="font-bold text-amber-600 flex items-center gap-1 text-[11px] mb-1">
                    ⚠️ Allergener
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {product.allergens.map((allergen, index) => (
                      <span key={index} className="allergen-badge">
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredienser */}
              {product.ingredients && (
                <div>
                  <h5 className="font-bold text-gray-700 text-[11px] mb-0.5">
                    📋 Ingredienser
                  </h5>
                  <p className="text-gray-600 text-[9px] leading-relaxed line-clamp-4">
                    {product.ingredients}
                  </p>
                </div>
              )}

              {/* Näringsvärde */}
              {product.nutritionData && (
                <div>
                  <h5 className="font-bold text-gray-700 text-[11px] mb-0.5">
                    🥗 Näringsvärde
                  </h5>
                  <NutritionTable data={product.nutritionData} />
                </div>
              )}

              {/* Fallback om ingen data finns */}
              {!product.allergens?.length && !product.ingredients && !product.nutritionData && product.backImageUrl && (
                <p className="text-[10px] text-muted-foreground text-center py-4">
                  Produktinformation från förpackningen
                </p>
              )}
            </div>
          </CardContent>

          {/* Pris och kundvagnknapp på baksidan */}
          <div className="p-2 pt-0 border-t border-border/30 bg-card/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-primary">
                {product.pricingType === 'weight_based'
                  ? <>ca {formatPrice(product.price)} kr/st</>
                  : <>{formatPrice(product.price)} kr/{product.priceUnit || 'st'}</>
                }
              </p>
              <Button
                size="sm"
                className="h-7 px-3 text-xs rounded-full bg-primary hover:bg-primary/90"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product, 1, hasPortions ? selectedPortion : undefined, isKgProduct ? defaultWeight : undefined);
                }}
                aria-label={`Lägg ${product.name} i varukorgen`}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                Lägg i varukorg
              </Button>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default memo(ProductCard);
