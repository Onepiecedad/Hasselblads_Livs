import { cn } from "@/lib/utils";
import { categoryCards } from "@/lib/categoryCards";
import { Leaf } from "lucide-react";

interface CategoryFilterCardsProps {
    activeValue: string | null; // Single-select: one category at a time
    onChange: (value: string | null) => void;
    className?: string;
}

const CategoryFilterCards = ({ activeValue, onChange, className }: CategoryFilterCardsProps) => {
    const handleSelect = (filterValue: string) => {
        if (filterValue === "alla") {
            // "Alla" clears the selection
            onChange(null);
        } else if (activeValue === filterValue) {
            // Clicking same category again clears it
            onChange(null);
        } else {
            // Select new category
            onChange(filterValue);
        }
    };

    const isAllaActive = !activeValue;

    return (
        <div className={cn("w-full", className)}>
            <p className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground/70 font-medium">
                Avdelningar
            </p>
            <div
                className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-3 scrollbar-elegant scroll-smooth-x scroll-snap-x -mx-4 px-4 sm:mx-0 sm:px-0"
                role="listbox"
                aria-label="Filtrera på avdelning"
                aria-orientation="horizontal"
                aria-multiselectable="false"
            >


                {/* Category cards - single-select */}
                {categoryCards.map((card) => {
                    const isActive = activeValue === card.filterValue;
                    return (
                        <button
                            key={card.filterValue}
                            type="button"
                            role="option"
                            aria-selected={isActive ? "true" : "false"}
                            onClick={() => handleSelect(card.filterValue || "")}
                            className={cn(
                                "group flex-shrink-0 relative overflow-hidden rounded-2xl scroll-snap-start",
                                // Larger size
                                "w-24 sm:w-28 h-28 sm:h-32",
                                "transition-all duration-300 ease-out",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                isActive
                                    ? "ring-3 ring-primary shadow-xl scale-[1.02]"
                                    : "hover:shadow-lg hover:scale-[1.02]"
                            )}
                        >
                            {card.image ? (
                                <div
                                    className={cn(
                                        "absolute inset-0 w-full h-full transition-transform duration-500",
                                        isActive ? "scale-105" : "group-hover:scale-105"
                                    )}
                                    style={card.bgColor ? { backgroundColor: card.bgColor } : undefined}
                                >
                                    <img
                                        src={card.image}
                                        alt={card.name}
                                        className={cn(
                                            "w-full h-full object-cover",
                                            card.filterImageClassName || card.imageClassName
                                        )}
                                        loading="lazy"
                                    />
                                </div>
                            ) : (
                                /* Text-based fallback for categories without illustrations */
                                <div
                                    className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-0.5 p-2"
                                    style={{ backgroundColor: card.bgColor || '#2F5852' }}
                                >
                                    {card.titleLines.map((line, i) => (
                                        <span
                                            key={i}
                                            className="text-xs sm:text-sm font-bold text-[#2F5852] leading-tight tracking-wide"
                                        >
                                            {line}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Active indicator - checkmark */}
                            {isActive && (
                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryFilterCards;
