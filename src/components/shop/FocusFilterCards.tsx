import { cn } from "@/lib/utils";
import { focusCards } from "@/lib/focusCards";

interface FocusFilterCardsProps {
    activeValue: string | null;
    onChange: (value: string | null) => void;
    className?: string;
}

const FocusFilterCards = ({ activeValue, onChange, className }: FocusFilterCardsProps) => {
    const handleSelect = (filterValue: string) => {
        onChange(activeValue === filterValue ? null : filterValue);
    };

    return (
        <div className={cn("w-full", className)}>
            <p className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground/70 font-medium">
                Handplockat
            </p>
            <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
                role="listbox"
                aria-label="Filtrera på handplockade kategorier"
                aria-orientation="horizontal"
            >
                {focusCards.map((card) => {
                    const isActive = card.filterValue === activeValue;

                    return (
                        <button
                            key={card.filterValue}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            onClick={() => handleSelect(card.filterValue)}
                            className={cn(
                                "group relative overflow-hidden rounded-2xl",
                                // Larger aspect ratio for more visual impact
                                "aspect-[4/3] sm:aspect-[3/2]",
                                "transition-all duration-300 ease-out",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                isActive
                                    ? "ring-3 ring-primary shadow-xl scale-[1.02]"
                                    : "hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5"
                            )}
                        >
                            {/* Background Image */}
                            <img
                                src={card.image}
                                alt=""
                                className={cn(
                                    "absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500",
                                    isActive ? "scale-105" : "group-hover:scale-105"
                                )}
                                loading="lazy"
                            />

                            {/* Text label - positioned based on textPosition setting */}
                            <div
                                className={cn(
                                    "absolute inset-0 flex items-center p-4 sm:p-5 md:p-6",
                                    card.textPosition === "right" && "justify-end text-right",
                                    card.textPosition === "left" && "justify-start text-left",
                                    card.textPosition === "center" && "justify-center text-center"
                                )}
                            >
                                <span
                                    className={cn(
                                        "text-[#2F5852] font-bold leading-tight tracking-tight",
                                        // Much larger text sizes
                                        "text-xl sm:text-2xl md:text-3xl lg:text-4xl",
                                        isActive && "underline underline-offset-4 decoration-2"
                                    )}
                                >
                                    {card.name}
                                </span>
                            </div>

                            {/* Active indicator */}
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

export default FocusFilterCards;
