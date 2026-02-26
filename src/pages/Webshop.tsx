import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Leaf } from "lucide-react";
import FocusFilterCards from "@/components/shop/FocusFilterCards";
import CategoryFilterCards from "@/components/shop/CategoryFilterCards";
import SubcategoryChips from "@/components/shop/SubcategoryChips";
import DetailCategoryChips from "@/components/shop/DetailCategoryChips";
import ActiveFilterBadges from "@/components/shop/ActiveFilterBadges";
import ProductCard from "@/components/shop/ProductCard";
import ProductCardSkeleton from "@/components/shop/ProductCardSkeleton";
import SearchAutocomplete from "@/components/shop/SearchAutocomplete";
import QuickViewModal from "@/components/shop/QuickViewModal";
import { tagFilters, type Product, type ProductTag } from "@/lib/products";
import { focusCards, getFallbackTag } from "@/lib/focusCards";
import { useProducts } from "@/hooks/useProducts";
import { useCart, type PortionSize, PORTION_LABELS, PORTION_MULTIPLIERS } from "@/context/CartContext";
import usePageMetadata from "@/hooks/usePageMetadata";
import { useFeaturedContent, type FeatureCardId } from "@/hooks/useFeaturedContent";
import { toast } from "sonner";

const STORAGE_KEY = "webshop-filters";
const svCollator = new Intl.Collator('sv', { sensitivity: 'base', numeric: true });

type FiltersState = {
    category: string | null; // Single-select category
    subcategory: string | null; // Subcategory within category
    detailCategory: string | null; // Detail category (level 3) within subcategory
    tag: string;
    sort: string;
    search: string;
};

const DEFAULT_FILTERS: FiltersState = {
    category: null,
    subcategory: null,
    detailCategory: null,
    tag: "",
    sort: "name-asc",
    search: "",
};

const Webshop = () => {
    const { products, isLoading, error } = useProducts();
    const { addItem, setOpen } = useCart();
    const { getCardProducts, isLoading: isFeaturedLoading } = useFeaturedContent();
    const [searchParams, setSearchParams] = useSearchParams();
    const [initialized, setInitialized] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const [visibleCount, setVisibleCount] = useState(40); // Number of products to show initially
    const returnFocusRef = useRef<HTMLElement | null>(null);
    const quickViewTriggerRefs = useRef<Record<string, HTMLElement | null>>({});
    const parallaxContainerRef = useRef<HTMLDivElement>(null);
    const productsGridRef = useRef<HTMLDivElement>(null);
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

    // Initialise from URL params first, then fallback to sessionStorage
    useEffect(() => {
        if (initialized) return;

        // Check if URL has any filter params - these take priority
        const urlKategori = searchParams.get("kategori"); // Now single value
        let urlTag = searchParams.get("tag");
        const urlSort = searchParams.get("sort");
        const urlSok = searchParams.get("sok");

        // Support ?focus= parameter (maps to feature card IDs)
        // This enables linking from the homepage video to the correct products
        const urlFocus = searchParams.get("focus");
        if (urlFocus && !urlTag) {
            // Valid focus card IDs
            const validFocusIds = ['godast', 'nyheter', 'isasong', 'erbjudanden'];
            if (validFocusIds.includes(urlFocus)) {
                urlTag = urlFocus; // Use card ID directly as tag
                // Update URL to use tag param instead of focus (cleaner URL)
                const newParams = new URLSearchParams(searchParams);
                newParams.delete("focus");
                newParams.set("tag", urlFocus);
                setSearchParams(newParams, { replace: true });
            }
        }

        const hasUrlParams = urlKategori || urlTag || urlSort || urlSok || urlFocus;

        if (hasUrlParams) {
            // URL params exist - use them and update search term
            setSearchTerm(urlSok ?? "");
        } else {
            // No URL params - try to restore from sessionStorage
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Handle migration from old multi-select format
                    const category = parsed.category || (parsed.categories && parsed.categories.length > 0 ? parsed.categories[0] : null);
                    const parsedState: FiltersState = {
                        category: category && category !== "alla" ? category : null,
                        subcategory: parsed.subcategory || null,
                        detailCategory: parsed.detailCategory || null,
                        tag: parsed.tag || "",
                        sort: parsed.sort || DEFAULT_FILTERS.sort,
                        search: parsed.search || "",
                    };
                    const params = new URLSearchParams();
                    if (parsedState.category) params.set("kategori", parsedState.category);
                    if (parsedState.tag) params.set("tag", parsedState.tag);
                    if (parsedState.sort && parsedState.sort !== DEFAULT_FILTERS.sort) params.set("sort", parsedState.sort);
                    if (parsedState.search) params.set("sok", parsedState.search);
                    setSearchParams(params, { replace: true });
                    setSearchTerm(parsedState.search);
                } catch (error) {
                    console.error("Failed to parse stored filters", error);
                }
            }
        }
        setInitialized(true);

        // Scroll to products when arriving with a tag/focus filter (e.g. from homepage)
        if (urlTag || urlFocus) {
            setTimeout(() => {
                productsGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 400);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialized, setSearchParams]);

    useEffect(() => {
        if (!initialized) return;
        const kategori = searchParams.get("kategori");
        const current: FiltersState = {
            category: kategori || null,
            subcategory: searchParams.get("underkategori") || null,
            detailCategory: searchParams.get("detalj") || null,
            tag: searchParams.get("tag") ?? DEFAULT_FILTERS.tag,
            sort: searchParams.get("sort") ?? DEFAULT_FILTERS.sort,
            search: searchParams.get("sok") ?? DEFAULT_FILTERS.search,
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        setSearchTerm(current.search);
    }, [searchParams, initialized]);

    // Get active category from URL
    const activeCategory: string | null = useMemo(() => {
        return searchParams.get("kategori") || null;
    }, [searchParams]);

    // Get active subcategory from URL
    const activeSubcategory: string | null = useMemo(() => {
        return searchParams.get("underkategori") || null;
    }, [searchParams]);

    // Get active detail category from URL
    const activeDetailCategory: string | null = useMemo(() => {
        return searchParams.get("detalj") || null;
    }, [searchParams]);

    const activeTag = searchParams.get("tag") ?? DEFAULT_FILTERS.tag;
    const activeSort = searchParams.get("sort") ?? DEFAULT_FILTERS.sort;

    const updateFilters = (updates: Partial<FiltersState>) => {
        const current: FiltersState = {
            category: activeCategory,
            subcategory: activeSubcategory,
            detailCategory: activeDetailCategory,
            tag: activeTag,
            sort: activeSort,
            search: searchParams.get("sok") ?? DEFAULT_FILTERS.search,
        };
        const next: FiltersState = { ...current, ...updates };
        const params = new URLSearchParams();

        if (next.category) params.set("kategori", next.category);
        if (next.subcategory) params.set("underkategori", next.subcategory);
        if (next.detailCategory) params.set("detalj", next.detailCategory);
        if (next.tag) params.set("tag", next.tag);
        if (next.sort && next.sort !== DEFAULT_FILTERS.sort) params.set("sort", next.sort);
        if (next.search) params.set("sok", next.search);

        setSearchParams(params, { replace: false });
    };

    // Scroll to products when a filter is selected
    const scrollToProducts = () => {
        setTimeout(() => {
            productsGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleCategoryChange = (value: string | null) => {
        // Clear subcategory, detailCategory and focus/tag filter when selecting a new category
        updateFilters({ category: value, subcategory: null, detailCategory: null, tag: value ? "" : DEFAULT_FILTERS.tag });
        // Don't scroll - stay at top so user can see the menu
    };

    const handleTagChange = (value: string | null) => {
        // Clear category filter when selecting a focus card
        updateFilters({ tag: value ?? DEFAULT_FILTERS.tag, category: value ? null : activeCategory, subcategory: null, detailCategory: null });
        if (value) scrollToProducts();
    };

    const handleSubcategoryChange = (value: string | null) => {
        // Clear detailCategory when switching subcategory
        updateFilters({ subcategory: value, detailCategory: null });
        // Don't scroll - stay at top so user can see the menu
    };

    const handleDetailCategoryChange = (value: string | null) => {
        updateFilters({ detailCategory: value });
        // Don't scroll - stay at top so user can see the menu
    };

    const handleSortChange = (value: string) => {
        updateFilters({ sort: value });
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        updateFilters({ search: value.trim() });
    };

    // Reset pagination when filters change
    useEffect(() => {
        setVisibleCount(40);
    }, [activeCategory, activeSubcategory, activeDetailCategory, activeTag, activeSort, searchTerm]);

    const filteredProducts = useMemo(() => {
        const term = (searchParams.get("sok") ?? "").toLowerCase();
        const category = activeCategory;
        const focusCardId = activeTag as FeatureCardId | "";

        let result = [...products];

        // Single-select category filtering
        if (category) {
            result = result.filter((product) => product.category === category);
        }

        // Subcategory filtering (if a subcategory is selected)
        const subcategory = activeSubcategory;
        if (subcategory) {
            result = result.filter((product) => product.subcategory === subcategory);
        }

        // Detail category filtering (if a detail category is selected)
        const detailCat = activeDetailCategory;
        if (detailCat) {
            result = result.filter((product) => product.detailCategory === detailCat);
        }

        // Focus card filtering - use PIM products first, fallback to tags
        if (focusCardId && ['godast', 'nyheter', 'isasong', 'erbjudanden'].includes(focusCardId)) {
            const pimProductIds = getCardProducts(focusCardId as FeatureCardId);

            if (pimProductIds.length > 0) {
                // Use PIM-selected products
                result = result.filter((product) => pimProductIds.includes(product.id));
            } else {
                // Fallback to tag-based filtering
                const fallbackTag = getFallbackTag(focusCardId as FeatureCardId);
                if (fallbackTag) {
                    result = result.filter((product) => product.tags.includes(fallbackTag as ProductTag));
                }
            }
        } else if (focusCardId) {
            // Direct tag-based filtering (for non-focus-card tags like eko, fairtrade, lokalt, klassiker)
            result = result.filter((product) => product.tags.includes(focusCardId as ProductTag));
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
                result.sort((a, b) => svCollator.compare(a.name, b.name));
                break;
            case "name-desc":
                result.sort((a, b) => svCollator.compare(b.name, a.name));
                break;
            default:
                // leave original order for "popular"
                break;
        }

        return result;
    }, [products, searchParams, activeCategory, activeSubcategory, activeDetailCategory, activeTag, activeSort, getCardProducts, isLoading]);

    const groupedProducts = useMemo(() => {
        // Only group when exactly one category is selected and there are many products
        const shouldGroup = activeCategory && filteredProducts.length > 20;

        if (!shouldGroup) {
            return null; // Return null to indicate "don't group, show flat list"
        }

        const groups: Record<string, Product[]> = {};
        const uncategorized: Product[] = [];

        for (const product of filteredProducts) {
            if (product.subcategory) {
                if (!groups[product.subcategory]) {
                    groups[product.subcategory] = [];
                }
                groups[product.subcategory].push(product);
            } else {
                uncategorized.push(product);
            }
        }

        // Sort groups alphabetically (Swedish locale)
        const sortedGroupNames = Object.keys(groups).sort((a, b) =>
            svCollator.compare(a, b)
        );

        // Build ordered result with uncategorized at the end
        const result: Array<{ subcategory: string; products: Product[] }> = sortedGroupNames.map(name => ({
            subcategory: name,
            products: groups[name]
        }));

        // Add uncategorized products as "Övrigt" if any exist
        if (uncategorized.length > 0) {
            result.push({ subcategory: 'Övrigt', products: uncategorized });
        }

        return result;
    }, [filteredProducts, activeCategory]);

    const handleAddToCart = (product: Product, quantity = 1, portion?: PortionSize, weightGrams?: number, multiOffer?: { quantity: number; price: number; label: string }) => {
        const basePrice = (product.salePrice && product.salePrice < product.price)
            ? product.salePrice
            : product.price;

        // För multiköp använder vi alltid baspriset per styck, 
        // eftersom CartContext beräknar rabatten dynamiskt baserat på totalt antal.
        const itemPrice = weightGrams
            ? Math.round((basePrice / 1000) * weightGrams * 100) / 100
            : portion
                ? Math.round(basePrice * PORTION_MULTIPLIERS[portion])
                : basePrice;

        addItem({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: itemPrice,
            unit: product.unit,
            image: product.image,
            woocommerce_id: product.woocommerce_id,
            portion,
            portionLabel: portion ? PORTION_LABELS[portion] : undefined,
            weightGrams,
            multiOffers: product.multiOffers,
        }, quantity);

        const weightLabel = weightGrams ? `${weightGrams}g ` : '';
        const label = portion && portion !== 'hel' ? ` (${PORTION_LABELS[portion].toLowerCase()})` : '';
        toast.success(`${weightLabel}${quantity > 1 ? quantity + " " : ""}${product.name}${label} tillagd i varukorgen`, {
            duration: 2500,
            action: {
                label: "Visa varukorg",
                onClick: () => setOpen(true),
            },
        });
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

            <div className="relative z-10 py-8 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-6 md:mb-12">
                        <div className="max-w-xl">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight">Webbutik</h1>
                            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                                Handla dina varor i vår webbutik och få de levererade eller hämta själv.
                            </p>
                        </div>
                    </div>



                    {/* Visual Filter Cards - Focus first, then Categories */}
                    <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-10">
                        <FocusFilterCards
                            activeValue={activeTag || null}
                            onChange={(value) => handleTagChange(value)}
                        />
                        <CategoryFilterCards
                            activeValue={activeCategory}
                            onChange={handleCategoryChange}
                        />
                    </div>

                    {/* Subcategory Chips - shows when a category is selected */}
                    <SubcategoryChips
                        category={activeCategory}
                        activeSubcategory={activeSubcategory}
                        onSubcategoryChange={handleSubcategoryChange}
                        className="mb-4"
                    />

                    {/* Detail Category Chips - shows when a subcategory is selected */}
                    <DetailCategoryChips
                        category={activeCategory}
                        subcategory={activeSubcategory}
                        activeDetailCategory={activeDetailCategory}
                        onDetailCategoryChange={handleDetailCategoryChange}
                        className="mb-6"
                    />

                    {/* Active Filter Badges - clickable to remove filters */}
                    <ActiveFilterBadges
                        category={activeCategory}
                        subcategory={activeSubcategory}
                        detailCategory={activeDetailCategory}
                        focusTag={activeTag || null}
                        searchTerm={searchTerm}
                        onClearCategory={() => updateFilters({ category: null, subcategory: null, detailCategory: null })}
                        onClearSubcategory={() => updateFilters({ subcategory: null, detailCategory: null })}
                        onClearDetailCategory={() => updateFilters({ detailCategory: null })}
                        onClearFocusTag={() => updateFilters({ tag: "" })}
                        onClearSearch={() => {
                            setSearchTerm("");
                            updateFilters({ search: "" });
                        }}
                        onClearAll={() => {
                            setSearchTerm("");
                            updateFilters({ category: null, subcategory: null, detailCategory: null, tag: "", search: "" });
                        }}
                        className="mb-4"
                    />

                    {/* Search */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                        <SearchAutocomplete
                            products={products}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onSelectProduct={(product) => handleQuickView(product)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground/70 pb-4 border-b border-border/20">
                        <span className="font-medium">{isLoading ? 'Laddar produkter…' : `${filteredProducts.length} produkter`}</span>
                        {(activeCategory || activeTag || searchTerm) && (
                            <button
                                type="button"
                                className="text-primary/80 hover:text-primary transition-colors font-medium"
                                onClick={() => {
                                    setSearchTerm("");
                                    updateFilters({ category: null, subcategory: null, tag: "", search: "" });
                                }}
                            >
                                Nollställ filter
                            </button>
                        )}
                    </div>
                    <div className="mt-4 rounded-xl bg-primary/5 border border-primary/10 px-4 py-2.5 text-[13px] text-primary/70 text-center">
                        🌿 Beställ dagen före önskad leverans för att säkerställa pris och tillgång.
                    </div>

                    <div ref={productsGridRef} className="scroll-mt-24 mt-10 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4 pb-24 md:pb-0">
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))
                        ) : (
                            filteredProducts.slice(0, visibleCount).map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={(item, qty) => handleAddToCart(item, qty)}
                                    onQuickView={(item) => handleQuickView(item)}
                                    setQuickViewButtonRef={(node) => {
                                        quickViewTriggerRefs.current[product.id] = node;
                                    }}
                                />
                            ))
                        )}
                    </div>

                    {!isLoading && filteredProducts.length > visibleCount && (
                        <div className="mt-12 mb-24 flex justify-center w-full">
                            <button
                                onClick={() => setVisibleCount(prev => prev + 40)}
                                className="px-8 py-3.5 bg-white border border-border shadow-sm rounded-full text-base font-medium text-foreground hover:bg-neutral-50 hover:shadow-md transition-all duration-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                Visa fler produkter ({filteredProducts.length - visibleCount} kvar)
                            </button>
                        </div>
                    )}

                    {!isLoading && filteredProducts.length === 0 && (
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
                onAddToCart={(product, quantity, portion, weightGrams, multiOffer) => {
                    handleAddToCart(product as Product, quantity, portion, weightGrams, multiOffer);
                    setQuickViewOpen(false);
                    setOpen(true);
                }}
                returnFocusRef={returnFocusRef}
            />
        </div>
    );
};

export default Webshop;

