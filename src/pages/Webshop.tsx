import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";
import FocusFilterCards from "@/components/shop/FocusFilterCards";
import CategoryFilterCards from "@/components/shop/CategoryFilterCards";
import SortDropdown from "@/components/shop/SortDropdown";
import ProductCard from "@/components/shop/ProductCard";
import QuickViewModal from "@/components/shop/QuickViewModal";
import { sortOptions, tagFilters, type Product, type ProductTag } from "@/lib/products";
import { focusCards } from "@/lib/focusCards";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import usePageMetadata from "@/hooks/usePageMetadata";

const STORAGE_KEY = "webshop-filters";

type FiltersState = {
    categories: string[]; // Changed to array for multi-select
    tag: string;
    sort: string;
    search: string;
};

const DEFAULT_FILTERS: FiltersState = {
    categories: [],
    tag: "",
    sort: "name-asc",
    search: "",
};

const Webshop = () => {
    const { products, isLoading, error } = useProducts();
    const { addItem, setOpen } = useCart();
    const [searchParams, setSearchParams] = useSearchParams();
    const [initialized, setInitialized] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const returnFocusRef = useRef<HTMLElement | null>(null);
    const quickViewTriggerRefs = useRef<Record<string, HTMLElement | null>>({});
    const parallaxContainerRef = useRef<HTMLDivElement>(null);
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.hasselbladslivs.se";

    // Direct DOM parallax for better performance
    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            const container = parallaxContainerRef.current;
            if (!container) return;

            const items = container.querySelectorAll<HTMLElement>('[data-parallax-speed]');
            items.forEach((item) => {
                if (!item) return;
                const speed = parseFloat(item.getAttribute('data-parallax-speed') || '0');
                const rot = parseFloat(item.getAttribute('data-parallax-rot') || '0');
                let transform = `translate3d(0, ${y * speed}px, 0)`;
                if (rot) {
                    transform += ` rotate(${y * rot}deg)`;
                }
                item.style.transform = transform;
            });
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [parallaxContainerRef]);

    // Initialise from sessionStorage once
    useEffect(() => {
        if (initialized) return;

        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Handle migration from old format
                const categories = parsed.categories || (parsed.category && parsed.category !== "alla" ? [parsed.category] : []);
                const parsedState: FiltersState = {
                    categories,
                    tag: parsed.tag || "",
                    sort: parsed.sort || DEFAULT_FILTERS.sort,
                    search: parsed.search || "",
                };
                const params = new URLSearchParams();
                if (parsedState.categories.length > 0) params.set("kategori", parsedState.categories.join(","));
                if (parsedState.tag) params.set("tag", parsedState.tag);
                if (parsedState.sort && parsedState.sort !== DEFAULT_FILTERS.sort) params.set("sort", parsedState.sort);
                if (parsedState.search) params.set("sok", parsedState.search);
                setSearchParams(params, { replace: true });
                setSearchTerm(parsedState.search);
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
        const kategorier = searchParams.get("kategori");
        const current: FiltersState = {
            categories: kategorier ? kategorier.split(",").filter(Boolean) : [],
            tag: searchParams.get("tag") ?? DEFAULT_FILTERS.tag,
            sort: searchParams.get("sort") ?? DEFAULT_FILTERS.sort,
            search: searchParams.get("sok") ?? DEFAULT_FILTERS.search,
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        setSearchTerm(current.search);
    }, [searchParams, initialized]);

    // Parse active categories from URL (comma-separated)
    const activeCategories: string[] = useMemo(() => {
        const param = searchParams.get("kategori");
        return param ? param.split(",").filter(Boolean) : [];
    }, [searchParams]);

    const activeTag = searchParams.get("tag") ?? DEFAULT_FILTERS.tag;
    const activeSort = searchParams.get("sort") ?? DEFAULT_FILTERS.sort;

    const updateFilters = (updates: Partial<FiltersState>) => {
        const current: FiltersState = {
            categories: activeCategories,
            tag: activeTag,
            sort: activeSort,
            search: searchParams.get("sok") ?? DEFAULT_FILTERS.search,
        };
        const next: FiltersState = { ...current, ...updates };
        const params = new URLSearchParams();

        if (next.categories.length > 0) params.set("kategori", next.categories.join(","));
        if (next.tag) params.set("tag", next.tag);
        if (next.sort && next.sort !== DEFAULT_FILTERS.sort) params.set("sort", next.sort);
        if (next.search) params.set("sok", next.search);

        setSearchParams(params, { replace: false });
    };

    const handleCategoriesChange = (values: string[]) => {
        updateFilters({ categories: values });
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
        const categories = activeCategories;
        const tag = activeTag as ProductTag | "";

        let result = [...products];

        // Multi-select category filtering
        if (categories.length > 0) {
            result = result.filter((product) => categories.includes(product.category));
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
                result.sort((a, b) => new Intl.Collator('sv', { sensitivity: 'base', numeric: true }).compare(a.name, b.name));
                break;
            default:
                // leave original order for "popular"
                break;
        }

        return result;
    }, [products, searchParams, activeCategories, activeTag, activeSort]);

    const handleAddToCart = (product: Product, quantity = 1, openCart = false) => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            image: product.image,
            woocommerce_id: product.woocommerce_id
        }, quantity);
        if (openCart) {
            setOpen(true);
        }
    };

    const productSchemaGraph = useMemo(
        () =>
            products.map((product) => ({
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
        [products, origin],
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



    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Kunde inte ladda produkter. Försök igen senare.</p>
                <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative grain-effect bg-[#fdfcf9]">
            {/* Parallax Background Elements - Hidden on mobile */}
            <div className="parallax-bg hidden md:block" aria-hidden="true" ref={parallaxContainerRef}>
                {/* Soft Orbs */}
                <div
                    className="parallax-orb w-[600px] h-[600px] bg-peach -top-20 -right-40"
                    data-parallax-speed="0.15"
                />
                <div
                    className="parallax-orb w-[700px] h-[700px] bg-sky top-[800px] -left-60"
                    data-parallax-speed="-0.12"
                />
                <div
                    className="parallax-orb w-[500px] h-[500px] bg-cream top-[1800px] -right-40"
                    data-parallax-speed="0.1"
                />

                {/* Floating Leaves */}
                {[
                    { top: 200, right: '3%', size: 60, speed: 0.3, rot: -0.1 },
                    { top: 900, left: '5%', size: 80, speed: 0.4, rot: 0.15 },
                    { top: 1600, right: '8%', size: 50, speed: 0.25, rot: -0.08 },
                ].map((leaf, i) => (
                    <Leaf
                        key={i}
                        className="parallax-leaf animate-slow-rotate"
                        data-parallax-speed={leaf.speed}
                        data-parallax-rot={leaf.rot}
                        style={{
                            top: leaf.top,
                            left: leaf.left,
                            right: leaf.right,
                            width: leaf.size,
                            height: leaf.size,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-12">
                        <div className="max-w-xl">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight">Webbutik</h1>
                            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                                Handla färska varor online med hemleverans i Mölndal eller upphämtning i butiken på Frejagatan.
                            </p>
                        </div>
                    </div>

                    {/* Visual Filter Cards - Focus first, then Categories */}
                    <div className="space-y-6 mb-10">
                        <FocusFilterCards
                            activeValue={activeTag || null}
                            onChange={(value) => handleTagChange(value)}
                        />
                        <CategoryFilterCards
                            activeValues={activeCategories}
                            onChange={handleCategoriesChange}
                        />
                    </div>

                    {/* Search and Sort - under the filter cards, with products */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                        <div className="relative flex-1 max-w-lg">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                            <Input
                                type="search"
                                placeholder="Sök efter produkter eller ingredienser"
                                value={searchTerm}
                                onChange={(event) => handleSearchChange(event.target.value)}
                                className="pl-12 h-12 rounded-2xl border-border/40 bg-card/50 backdrop-blur-sm text-base placeholder:text-muted-foreground/50"
                                aria-label="Sök produkter"
                            />
                        </div>
                        <SortDropdown options={sortOptions} value={activeSort} onChange={handleSortChange} />
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground/70 pb-6 border-b border-border/20">
                        <span className="font-medium">{filteredProducts.length} produkter</span>
                        {(activeCategories.length > 0 || activeTag || searchTerm) && (
                            <button
                                type="button"
                                className="text-primary/80 hover:text-primary transition-colors font-medium"
                                onClick={() => updateFilters({ categories: [], tag: "", search: "" })}
                            >
                                Nollställ filter
                            </button>
                        )}
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
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
            </div>

            <QuickViewModal
                product={quickViewProduct}
                open={quickViewOpen}
                onOpenChange={setQuickViewOpen}
                onAddToCart={(product, quantity) => {
                    handleAddToCart(product as Product, quantity, true);
                    setQuickViewOpen(false);
                }}
                returnFocusRef={returnFocusRef}
            />
        </div>
    );
};

export default Webshop;
