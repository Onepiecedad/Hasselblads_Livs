import { cn } from "@/lib/utils";
import { categoryCards } from "@/lib/categoryCards";
import { Leaf } from "lucide-react";

interface CategoryFilterCardsProps {
    activeValues: string[]; // Changed to array for multi-select
    onChange: (values: string[]) => void;
    className?: string;
}

const CategoryFilterCards = ({ activeValues, onChange, className }: CategoryFilterCardsProps) => {
    const handleSelect = (filterValue: string) => {
        if (filterValue === "alla") {
            // "Alla" clears all selections
            onChange([]);
        } else {
            // Toggle the category
            if (activeValues.includes(filterValue)) {
                // Remove it
                onChange(activeValues.filter(v => v !== filterValue));
            } else {
                // Add it
                onChange([...activeValues, filterValue]);
            }
        }
    };

    const isAllaActive = activeValues.length === 0;

    return (
        <div className={cn("w-full", className)}>
            <p className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground/70 font-medium">
                Avdelningar
            </p>
            <div
                className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-3 scrollbar-hide scroll-smooth-x scroll-snap-x -mx-4 px-4 sm:mx-0 sm:px-0"
                role="listbox"
                aria-label="Filtrera på avdelning"
                aria-orientation="horizontal"
                aria-multiselectable="true"
            >
                {/* "Alla" button - solid green background */}
                <button
                    type="button"
                    role="option"
                    aria-selected={isAllaActive}
                    onClick={() => handleSelect("alla")}
                    className={cn(
                        "flex-shrink-0 flex flex-col items-center justify-center gap-1.5 scroll-snap-start",
                        // Larger size
                        "w-24 sm:w-28 h-28 sm:h-32 rounded-2xl",
                        "transition-all duration-300 ease-out",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5852] focus-visible:ring-offset-2",
                        // Nice green background
                        "bg-[#2F5852] border-2 border-[#2F5852]",
                        isAllaActive
                            ? "shadow-lg scale-[1.02] ring-2 ring-white ring-offset-2"
                            : "hover:bg-[#3a6b62] hover:shadow-md hover:scale-[1.02]"
                    )}
                >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
                        <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-white">
                        Alla
                    </span>
                </button>

                {/* Category cards - multi-select enabled */}
                {categoryCards.map((card) => {
                    const isActive = activeValues.includes(card.filterValue || "");
                    return (
                        <button
                            key={card.filterValue}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            onClick={() => handleSelect(card.filterValue || "")}
                            className={cn(
                                "flex-shrink-0 relative overflow-hidden rounded-2xl scroll-snap-start",
                                // Larger size
                                "w-24 sm:w-28 h-28 sm:h-32",
                                "transition-all duration-300 ease-out",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                isActive
                                    ? "ring-3 ring-primary shadow-xl scale-[1.02]"
                                    : "hover:shadow-lg hover:scale-[1.02]"
                            )}
                        >
                            {/* Background Image - no text overlay, illustrations have text */}
                            <img
                                src={card.image}
                                alt={card.name}
                                className={cn(
                                    "absolute inset-0 w-full h-full object-cover transition-transform duration-500",
                                    isActive ? "scale-105" : "hover:scale-105"
                                )}
                                loading="lazy"
                            />

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
