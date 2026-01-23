import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Product } from "@/lib/products";

interface SearchAutocompleteProps {
    products: Product[];
    value: string;
    onChange: (value: string) => void;
    onSelectProduct?: (product: Product) => void;
}

const SearchAutocomplete = ({
    products,
    value,
    onChange,
    onSelectProduct,
}: SearchAutocompleteProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter products based on search term
    const suggestions = useMemo(() => {
        if (!value || value.length < 2) return [];

        const term = value.toLowerCase();
        return products
            .filter(
                (product) =>
                    product.name.toLowerCase().includes(term) ||
                    product.description?.toLowerCase().includes(term) ||
                    product.category?.toLowerCase().includes(term)
            )
            .slice(0, 6); // Limit to 6 suggestions
    }, [products, value]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || suggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                    handleSelect(suggestions[highlightedIndex]);
                }
                break;
            case "Escape":
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }
    };

    const handleSelect = (product: Product) => {
        onChange(product.name);
        setIsOpen(false);
        setHighlightedIndex(-1);
        onSelectProduct?.(product);
    };

    const handleClear = () => {
        onChange("");
        inputRef.current?.focus();
    };

    return (
        <div ref={containerRef} className="relative flex-1 max-w-lg">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
            <Input
                ref={inputRef}
                type="search"
                placeholder="Sök produkter..."
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setIsOpen(true);
                    setHighlightedIndex(-1);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                className="pl-12 pr-10 h-12 rounded-2xl border-border/40 bg-card/50 backdrop-blur-sm text-base placeholder:text-muted-foreground/50"
                aria-label="Sök produkter"
                aria-expanded={isOpen && suggestions.length > 0}
                aria-haspopup="listbox"
                aria-controls="search-suggestions"
                autoComplete="off"
            />

            {/* Clear button */}
            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                    aria-label="Rensa sökning"
                >
                    <X className="h-4 w-4 text-muted-foreground" />
                </button>
            )}

            {/* Suggestions dropdown */}
            {isOpen && suggestions.length > 0 && (
                <ul
                    id="search-suggestions"
                    role="listbox"
                    aria-label="Sökförslag"
                    className="absolute top-full left-0 right-0 mt-2 bg-background border border-border/60 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    {suggestions.map((product, index) => (
                        <li
                            key={product.id}
                            role="option"
                            aria-selected={index === highlightedIndex ? true : undefined}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${index === highlightedIndex
                                ? "bg-primary/10"
                                : "hover:bg-muted/50"
                                }`}
                            onClick={() => handleSelect(product)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                        >
                            <img
                                src={product.image}
                                alt=""
                                className="h-10 w-10 rounded-lg object-cover bg-muted"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{product.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {product.origin?.flag} {product.category} · {product.price} kr
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* No results message */}
            {isOpen && value.length >= 2 && suggestions.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border/60 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-sm text-muted-foreground text-center">
                        Inga produkter hittades för "{value}"
                    </p>
                </div>
            )}
        </div>
    );
};

export default SearchAutocomplete;
