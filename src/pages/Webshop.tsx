import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import FilterChips from "@/components/shop/FilterChips";
import SortDropdown from "@/components/shop/SortDropdown";
import ProductCard from "@/components/shop/ProductCard";
import QuickViewModal from "@/components/shop/QuickViewModal";
import { products as productCatalog, sortOptions, tagFilters, type Product, type ProductTag } from "@/lib/products";
import { categoryCards } from "@/lib/categoryCards";
import { useCart } from "@/context/CartContext";
import usePageMetadata from "@/hooks/usePageMetadata";

const STORAGE_KEY = "webshop-filters";

type FiltersState = {
  category: string;
  tag: string;
  sort: string;
  search: string;
};

const DEFAULT_FILTERS: FiltersState = {
  category: "alla",
  tag: "",
  sort: "popular",
  search: "",
};

const Webshop = () => {
  const { addItem, setOpen } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialized, setInitialized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const quickViewTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.hasselbladslivs.se";
  const featuredCategoryCards = useMemo(() => categoryCards.filter((card) => Boolean(card.filterValue)), []);

  // Initialise from sessionStorage once
  useEffect(() => {
    if (initialized) return;

    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: FiltersState = { ...DEFAULT_FILTERS, ...JSON.parse(saved) };
        const params = new URLSearchParams();
        if (parsed.category && parsed.category !== "alla") params.set("kategori", parsed.category);
        if (parsed.tag) params.set("tag", parsed.tag);
        if (parsed.sort && parsed.sort !== DEFAULT_FILTERS.sort) params.set("sort", parsed.sort);
        if (parsed.search) params.set("sok", parsed.search);
        setSearchParams(params, { replace: true });
        setSearchTerm(parsed.search);
      } catch (error) {
        console.error("Failed to parse stored filters", error);
      }
    } else {
      const initialSearch = searchParams.get("sok") ?? "";
      setSearchTerm(initialSearch);
    }
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, setSearchParams]);

  useEffect(() => {
    if (!initialized) return;
    const current: FiltersState = {
      category: searchParams.get("kategori") ?? DEFAULT_FILTERS.category,
      tag: searchParams.get("tag") ?? DEFAULT_FILTERS.tag,
      sort: searchParams.get("sort") ?? DEFAULT_FILTERS.sort,
      search: searchParams.get("sok") ?? DEFAULT_FILTERS.search,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    setSearchTerm(current.search);
  }, [searchParams, initialized]);

  const activeCategory = searchParams.get("kategori") ?? DEFAULT_FILTERS.category;
  const activeTag = searchParams.get("tag") ?? DEFAULT_FILTERS.tag;
  const activeSort = searchParams.get("sort") ?? DEFAULT_FILTERS.sort;
  const updateFilters = (updates: Partial<FiltersState>) => {
    const current: FiltersState = {
      category: activeCategory,
      tag: activeTag,
      sort: activeSort,
      search: searchParams.get("sok") ?? DEFAULT_FILTERS.search,
    };
    const next: FiltersState = { ...current, ...updates };
    const params = new URLSearchParams();

    if (next.category && next.category !== DEFAULT_FILTERS.category) params.set("kategori", next.category);
    if (next.tag) params.set("tag", next.tag);
    if (next.sort && next.sort !== DEFAULT_FILTERS.sort) params.set("sort", next.sort);
    if (next.search) params.set("sok", next.search);

    setSearchParams(params, { replace: false });
  };

  const handleCategoryChange = (value: string | null) => {
    updateFilters({ category: value ?? DEFAULT_FILTERS.category });
  };

  const handleCategoryCardSelect = (value: string) => {
    const nextValue = activeCategory === value ? DEFAULT_FILTERS.category : value;
    handleCategoryChange(nextValue);
  };

  const handleTagChange = (value: string | null) => {
    updateFilters({ tag: value ?? DEFAULT_FILTERS.tag });
  };

  const handleSortChange = (value: string) => {
    updateFilters({ sort: value });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    updateFilters({ search: value.trim() });
  };

  const filteredProducts = useMemo(() => {
    const term = (searchParams.get("sok") ?? "").toLowerCase();
    const category = activeCategory;
    const tag = activeTag as ProductTag | "";

    let result = [...productCatalog];

    if (category !== "alla") {
      result = result.filter((product) => product.category === category);
    }

    if (tag) {
      result = result.filter((product) => product.tags.includes(tag));
    }

    if (term) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(term) || product.description.toLowerCase().includes(term),
      );
    }

    switch (activeSort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name, "sv"));
        break;
      default:
        // leave original order for "popular"
        break;
    }

    return result;
  }, [searchParams, activeCategory, activeTag, activeSort]);

  const handleAddToCart = (product: Product, quantity = 1, openCart = false) => {
    addItem({ id: product.id, name: product.name, price: product.price, unit: product.unit, image: product.image }, quantity);
    if (openCart) {
      setOpen(true);
    }
  };

  const productSchemaGraph = useMemo(
    () =>
      productCatalog.map((product) => ({
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: [product.image],
        sku: product.id,
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          priceCurrency: "SEK",
          price: product.price,
          url: `${origin}/webbutik`,
        },
      })),
    [origin],
  );

  usePageMetadata({
    title: "Webbutik | Hasselblads Livs",
    description:
      "Handla frukt, grönt och delikatesser online hos Hasselblads Livs. Filtrera på säsong, erbjudanden och kategorier med leverans i Mölndal.",
    canonicalPath: "/webbutik",
    ogImage: "https://images.unsplash.com/photo-1514516401255-232c9531e1d2?auto=format&fit=crop&w=1200&q=80&fm=webp",
    structuredData: [
      {
        id: "schema-webshop-products",
        data: {
          "@context": "https://schema.org",
          "@graph": productSchemaGraph,
        },
      },
    ],
  });

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    returnFocusRef.current = quickViewTriggerRefs.current[product.id] ?? null;
    setQuickViewOpen(true);
  };

  const relatedProducts = useMemo(() => {
    if (!quickViewProduct) return [];
    return productCatalog
      .filter(
        (product) =>
          product.id !== quickViewProduct.id &&
          (product.category === quickViewProduct.category || product.tags.some((tag) => quickViewProduct.tags.includes(tag))),
      )
      .slice(0, 4);
  }, [quickViewProduct]);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">Webbutik</h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
              Handla färska varor online med hemleverans i Mölndal eller upphämtning i butiken på Frejagatan.
            </p>
          </div>
          <SortDropdown options={sortOptions} value={activeSort} onChange={handleSortChange} />
        </div>

        <div className="mt-8 space-y-10">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Sök efter produkter eller ingredienser"
              value={searchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="pl-10"
              aria-label="Sök produkter"
            />
          </div>

          {featuredCategoryCards.length > 0 && (
            <section>
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Handla efter kategori</p>
                  <h2 className="text-2xl font-semibold">Välj smakspår</h2>
                </div>
                <Link
                  to="/kategorier"
                  className="text-sm font-semibold text-primary hover:text-primary/80"
                >
                  Se alla kategorier
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {featuredCategoryCards.map((card) => {
                  const value = card.filterValue!;
                  const isActive = activeCategory === value;
                  return (
                    <button
                      key={card.name}
                      type="button"
                      onClick={() => handleCategoryCardSelect(value)}
                      aria-pressed={isActive}
                      className={`group relative overflow-hidden rounded-[28px] text-left shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background ${
                        isActive ? "ring-2 ring-primary/70" : "hover:-translate-y-1"
                      }`}
                    >
                      <div className="aspect-[4/3]">
                        <img src={card.image} alt={card.name} className="h-full w-full object-cover" loading="lazy" />
                      </div>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-white">
                        <p className="text-sm uppercase tracking-[0.3em] text-white/70">{card.name}</p>
                        <p className="mt-1 text-base font-semibold">{card.description}</p>
                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                          {isActive ? "Aktiv kategori" : "Utforska kategorin"}
                          <span aria-hidden="true">→</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Fokus</p>
            <FilterChips
              chips={tagFilters.map((filter) => ({ label: filter.label, value: filter.tag }))}
              activeValue={activeTag || null}
              onChange={handleTagChange}
              ariaLabel="Filtrera på säsongserbjudanden"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>{filteredProducts.length} produkter</span>
          {(activeCategory !== DEFAULT_FILTERS.category || activeTag || searchTerm) && (
            <button
              type="button"
              className="underline decoration-dotted underline-offset-4 hover:text-primary"
              onClick={() => updateFilters(DEFAULT_FILTERS)}
            >
              Nollställ filter
            </button>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(item) => handleAddToCart(item)}
              onQuickView={(item) => handleQuickView(item)}
              setQuickViewButtonRef={(node) => {
                quickViewTriggerRefs.current[product.id] = node;
              }}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-lg text-muted-foreground">Inga produkter matchar vald filtrering just nu.</p>
          </div>
        )}
      </div>

      <QuickViewModal
        product={quickViewProduct}
        related={relatedProducts}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
        onAddToCart={(product, quantity) => {
          handleAddToCart(product, quantity, true);
          setQuickViewOpen(false);
        }}
        returnFocusRef={returnFocusRef}
      />
    </div>
  );
};

export default Webshop;
