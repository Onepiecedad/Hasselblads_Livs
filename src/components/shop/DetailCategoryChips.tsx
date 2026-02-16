import { cn } from "@/lib/utils";
import { getDetailCategories } from "@/lib/categoryHierarchy";

interface DetailCategoryChipsProps {
    category: string | null;
    subcategory: string | null;
    activeDetailCategory: string | null;
    onDetailCategoryChange: (detailCategory: string | null) => void;
    className?: string;
}

const DetailCategoryChips = ({
    category,
    subcategory,
    activeDetailCategory,
    onDetailCategoryChange,
    className,
}: DetailCategoryChipsProps) => {
    // Don't show if no category or subcategory is selected
    if (!category || !subcategory) return null;

    const detailCategories = getDetailCategories(category, subcategory);

    // Don't show if subcategory has no detail categories
    if (detailCategories.length === 0) return null;

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            <span className="text-sm font-medium text-muted-foreground mr-1">
                Typ:
            </span>

            {/* "Visa alla" chip */}
            <button
                type="button"
                onClick={() => onDetailCategoryChange(null)}
                className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                    !activeDetailCategory
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-foreground/70 border-border/50 hover:bg-muted/50 hover:text-foreground hover:border-border"
                )}
            >
                Alla
            </button>

            {/* Detail category chips */}
            {detailCategories.map((detail) => {
                const isActive = activeDetailCategory === detail;
                return (
                    <button
                        key={detail}
                        type="button"
                        onClick={() => onDetailCategoryChange(isActive ? null : detail)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                            isActive
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-white text-foreground/70 border-border/50 hover:bg-muted/50 hover:text-foreground hover:border-border"
                        )}
                    >
                        {detail}
                    </button>
                );
            })}
        </div>
    );
};

export default DetailCategoryChips;
