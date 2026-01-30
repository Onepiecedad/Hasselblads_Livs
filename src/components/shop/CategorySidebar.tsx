import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_HIERARCHY, getAllCategories, type CategoryHierarchyItem } from "@/lib/categoryHierarchy";

interface CategorySidebarProps {
    activeCategory: string | null;
    activeSubcategory: string | null;
    onCategoryChange: (category: string | null) => void;
    onSubcategoryChange: (subcategory: string | null) => void;
    className?: string;
}

const CategorySidebar = ({
    activeCategory,
    activeSubcategory,
    onCategoryChange,
    onSubcategoryChange,
    className,
}: CategorySidebarProps) => {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        activeCategory ? new Set([activeCategory]) : new Set()
    );

    const categories = getAllCategories();

    const toggleExpand = (categoryValue: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(categoryValue)) {
                next.delete(categoryValue);
            } else {
                next.add(categoryValue);
            }
            return next;
        });
    };

    const handleCategoryClick = (category: CategoryHierarchyItem) => {
        if (activeCategory === category.value) {
            // Clicking the same category clears it
            onCategoryChange(null);
            onSubcategoryChange(null);
        } else {
            onCategoryChange(category.value);
            onSubcategoryChange(null);
            // Auto-expand when selecting
            setExpandedCategories((prev) => new Set(prev).add(category.value));
        }
    };

    const handleSubcategoryClick = (categoryValue: string, subcategory: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeSubcategory === subcategory && activeCategory === categoryValue) {
            // Clicking same subcategory clears it but keeps category
            onSubcategoryChange(null);
        } else {
            onCategoryChange(categoryValue);
            onSubcategoryChange(subcategory);
        }
    };

    return (
        <aside className={cn("w-64 shrink-0", className)}>
            <div className="sticky top-24 bg-white/80 backdrop-blur-sm rounded-2xl border border-border/30 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border/20">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                        Kategorier
                    </h2>
                </div>

                <nav className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* "Visa alla" option */}
                    <button
                        type="button"
                        onClick={() => {
                            onCategoryChange(null);
                            onSubcategoryChange(null);
                        }}
                        className={cn(
                            "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                            !activeCategory
                                ? "bg-primary text-white shadow-sm"
                                : "text-foreground/80 hover:bg-muted/50 hover:text-foreground"
                        )}
                    >
                        Visa alla produkter
                    </button>

                    {/* Category list */}
                    <ul className="mt-2 space-y-0.5">
                        {categories.map((category) => {
                            const isActive = activeCategory === category.value;
                            const isExpanded = expandedCategories.has(category.value);
                            const hasSubcats = category.subcategories.length > 0;

                            return (
                                <li key={category.value}>
                                    <div
                                        className={cn(
                                            "flex items-center rounded-lg transition-all duration-200",
                                            isActive && !activeSubcategory
                                                ? "bg-primary/10 text-primary"
                                                : isActive
                                                    ? "bg-muted/30"
                                                    : "hover:bg-muted/50"
                                        )}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleCategoryClick(category)}
                                            className={cn(
                                                "flex-1 text-left px-3 py-2.5 text-sm font-medium transition-colors",
                                                isActive && !activeSubcategory
                                                    ? "text-primary"
                                                    : "text-foreground/80 hover:text-foreground"
                                            )}
                                        >
                                            {category.label}
                                        </button>

                                        {hasSubcats && (
                                            <button
                                                type="button"
                                                onClick={(e) => toggleExpand(category.value, e)}
                                                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                                                aria-label={isExpanded ? "Dölj underkategorier" : "Visa underkategorier"}
                                            >
                                                {isExpanded ? (
                                                    <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Subcategories */}
                                    {hasSubcats && isExpanded && (
                                        <ul className="ml-4 mt-1 mb-2 space-y-0.5 border-l-2 border-border/30 pl-3">
                                            {category.subcategories.map((subcategory) => {
                                                const isSubActive = activeSubcategory === subcategory && activeCategory === category.value;
                                                return (
                                                    <li key={subcategory}>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleSubcategoryClick(category.value, subcategory, e)}
                                                            className={cn(
                                                                "w-full text-left px-2 py-1.5 rounded text-sm transition-all duration-200",
                                                                isSubActive
                                                                    ? "bg-primary text-white font-medium shadow-sm"
                                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                                            )}
                                                        >
                                                            {subcategory}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </aside>
    );
};

export default CategorySidebar;
