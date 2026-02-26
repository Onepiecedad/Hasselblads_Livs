import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryLabel } from "@/lib/categoryHierarchy";

interface ActiveFilterBadgesProps {
    category: string | null;
    subcategory: string | null;
    detailCategory?: string | null;
    focusTag: string | null;
    searchTerm: string;
    onClearCategory: () => void;
    onClearSubcategory: () => void;
    onClearDetailCategory?: () => void;
    onClearFocusTag: () => void;
    onClearSearch: () => void;
    onClearAll: () => void;
    className?: string;
}

const ActiveFilterBadges = ({
    category,
    subcategory,
    detailCategory,
    focusTag,
    searchTerm,
    onClearCategory,
    onClearSubcategory,
    onClearDetailCategory,
    onClearFocusTag,
    onClearSearch,
    onClearAll,
    className,
}: ActiveFilterBadgesProps) => {
    const getFocusLabel = (tag: string): string => {
        const labels: Record<string, string> = {
            godast: "Godast just nu",
            nyheter: "Nyheter",
            isasong: "I säsong",
            erbjudanden: "Erbjudanden",
        };
        return labels[tag] || tag;
    };

    const hasActiveFilters = category || subcategory || detailCategory || focusTag || searchTerm;

    if (!hasActiveFilters) {
        return null;
    }

    return (
        <div
            className={cn(
                "flex items-center gap-2 flex-wrap",
                className
            )}
        >

            <div className="flex items-center gap-2 flex-wrap">
                {/* Category badge */}
                {category && !subcategory && (
                    <FilterBadge
                        label={getCategoryLabel(category)}
                        onClear={onClearCategory}
                    />
                )}

                {/* Category + Subcategory badges */}
                {category && subcategory && (
                    <>
                        <FilterBadge
                            label={getCategoryLabel(category)}
                            onClear={() => {
                                onClearCategory();
                                onClearSubcategory();
                            }}
                        />
                        <FilterBadge
                            label={subcategory}
                            onClear={onClearSubcategory}
                        />
                    </>
                )}

                {/* Detail category badge */}
                {detailCategory && onClearDetailCategory && (
                    <FilterBadge
                        label={detailCategory}
                        onClear={onClearDetailCategory}
                    />
                )}

                {/* Focus tag badge */}
                {focusTag && (
                    <FilterBadge
                        label={getFocusLabel(focusTag)}
                        onClear={onClearFocusTag}
                    />
                )}

                {/* Search term badge */}
                {searchTerm && (
                    <FilterBadge
                        label={`"${searchTerm}"`}
                        onClear={onClearSearch}
                        variant="search"
                    />
                )}

                {/* Clear all button - only show if more than one filter */}
                {(category || focusTag) && (searchTerm || subcategory || (category && focusTag)) && (
                    <button
                        type="button"
                        onClick={onClearAll}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                    >
                        Rensa alla
                    </button>
                )}
            </div>
        </div>
    );
};

interface FilterBadgeProps {
    label: string;
    onClear: () => void;
    variant?: "default" | "search";
}

const FilterBadge = ({ label, onClear, variant = "default" }: FilterBadgeProps) => {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                variant === "search"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-primary/10 text-primary border border-primary/20"
            )}
        >
            {label}
            <button
                type="button"
                onClick={onClear}
                className={cn(
                    "p-0.5 rounded-full transition-colors",
                    variant === "search"
                        ? "hover:bg-amber-200"
                        : "hover:bg-primary/20"
                )}
                aria-label={`Ta bort filter: ${label}`}
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </span>
    );
};

export default ActiveFilterBadges;
