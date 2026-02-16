import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryLabel } from "@/lib/categoryHierarchy";

interface BreadcrumbsProps {
    category: string | null;
    subcategory: string | null;
    detailCategory?: string | null;
    searchTerm?: string;
    focusTag?: string | null;
    className?: string;
}

const Breadcrumbs = ({
    category,
    subcategory,
    detailCategory,
    searchTerm,
    focusTag,
    className,
}: BreadcrumbsProps) => {
    // Don't render if we're at the root level
    if (!category && !searchTerm && !focusTag) {
        return null;
    }

    const getFocusLabel = (tag: string): string => {
        const labels: Record<string, string> = {
            godast: "Godast just nu",
            nyheter: "Nyheter",
            isasong: "I säsong",
            erbjudanden: "Erbjudanden",
        };
        return labels[tag] || tag;
    };

    return (
        <nav
            aria-label="Brödsmulor"
            className={cn("flex items-center text-sm text-muted-foreground", className)}
        >
            <ol className="flex items-center flex-wrap gap-1">
                {/* Home */}
                <li className="flex items-center">
                    <Link
                        to="/"
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                        <Home className="w-3.5 h-3.5" />
                        <span className="sr-only sm:not-sr-only">Hem</span>
                    </Link>
                </li>

                <li className="flex items-center">
                    <ChevronRight className="w-3.5 h-3.5 mx-1 text-muted-foreground/50" />
                </li>

                {/* Webbutik */}
                <li className="flex items-center">
                    {category || focusTag || searchTerm ? (
                        <Link
                            to="/webbutik"
                            className="hover:text-foreground transition-colors"
                        >
                            Webbutik
                        </Link>
                    ) : (
                        <span className="text-foreground font-medium">Webbutik</span>
                    )}
                </li>

                {/* Focus/tag filter */}
                {focusTag && !category && (
                    <>
                        <li className="flex items-center">
                            <ChevronRight className="w-3.5 h-3.5 mx-1 text-muted-foreground/50" />
                        </li>
                        <li>
                            <span className="text-foreground font-medium">
                                {getFocusLabel(focusTag)}
                            </span>
                        </li>
                    </>
                )}

                {/* Category */}
                {category && (
                    <>
                        <li className="flex items-center">
                            <ChevronRight className="w-3.5 h-3.5 mx-1 text-muted-foreground/50" />
                        </li>
                        <li>
                            {subcategory ? (
                                <Link
                                    to={`/webbutik?kategori=${category}`}
                                    className="hover:text-foreground transition-colors"
                                >
                                    {getCategoryLabel(category)}
                                </Link>
                            ) : (
                                <span className="text-foreground font-medium">
                                    {getCategoryLabel(category)}
                                </span>
                            )}
                        </li>
                    </>
                )}

                {/* Subcategory */}
                {subcategory && (
                    <>
                        <li className="flex items-center">
                            <ChevronRight className="w-3.5 h-3.5 mx-1 text-muted-foreground/50" />
                        </li>
                        <li>
                            {detailCategory ? (
                                <Link
                                    to={`/webbutik?kategori=${category}&underkategori=${subcategory}`}
                                    className="hover:text-foreground transition-colors"
                                >
                                    {subcategory}
                                </Link>
                            ) : (
                                <span className="text-foreground font-medium">{subcategory}</span>
                            )}
                        </li>
                    </>
                )}

                {/* Detail Category */}
                {detailCategory && (
                    <>
                        <li className="flex items-center">
                            <ChevronRight className="w-3.5 h-3.5 mx-1 text-muted-foreground/50" />
                        </li>
                        <li>
                            <span className="text-foreground font-medium">{detailCategory}</span>
                        </li>
                    </>
                )}

                {/* Search term */}
                {searchTerm && (
                    <>
                        <li className="flex items-center">
                            <ChevronRight className="w-3.5 h-3.5 mx-1 text-muted-foreground/50" />
                        </li>
                        <li>
                            <span className="text-foreground font-medium">
                                Sök: "{searchTerm}"
                            </span>
                        </li>
                    </>
                )}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
