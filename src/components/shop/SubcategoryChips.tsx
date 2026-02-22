import { cn } from "@/lib/utils";
import { getSubcategories } from "@/lib/categoryHierarchy";

interface SubcategoryChipsProps {
    category: string | null;
    activeSubcategory: string | null;
    onSubcategoryChange: (subcategory: string | null) => void;
    className?: string;
}

const SubcategoryChips = ({
    category,
    activeSubcategory,
    onSubcategoryChange,
    className,
}: SubcategoryChipsProps) => {
    // Don't show if no category selected
    if (!category) return null;

    const subcategories = [...getSubcategories(category)].sort((a, b) =>
        a.localeCompare(b, 'sv')
    );
    // Don't show if category has no subcategories
    if (subcategories.length === 0) return null;

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            <span className="text-sm font-medium text-muted-foreground mr-1">
                Filtrera:
            </span>

            {/* "Visa alla" chip */}
            <button
                type="button"
                onClick={() => onSubcategoryChange(null)}
                className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                    !activeSubcategory
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-foreground/70 border-border/50 hover:bg-muted/50 hover:text-foreground hover:border-border"
                )}
            >
                Alla
            </button>

            {/* Subcategory chips */}
            {subcategories.map((subcategory) => {
                const isActive = activeSubcategory === subcategory;
                return (
                    <button
                        key={subcategory}
                        type="button"
                        onClick={() => onSubcategoryChange(isActive ? null : subcategory)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                            isActive
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-white text-foreground/70 border-border/50 hover:bg-muted/50 hover:text-foreground hover:border-border"
                        )}
                    >
                        {subcategory}
                    </button>
                );
            })}
        </div>
    );
};

export default SubcategoryChips;
