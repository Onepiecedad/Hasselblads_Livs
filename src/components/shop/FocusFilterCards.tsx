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
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
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
                            aria-selected={isActive ? "true" : "false"}
                            onClick={() => handleSelect(card.filterValue)}
                            className={cn(
                                "group relative overflow-hidden",
                                "aspect-[2.5/1] sm:aspect-[2/1]",
                                "transition-all duration-300 ease-out",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                isActive
                                    ? "ring-4 ring-primary ring-inset z-10"
                                    : "hover:brightness-105"
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

                            {/* Text label - positioned to match homepage */}
                            <div
                                className={cn(
                                    "absolute inset-0 flex items-center p-3 sm:p-6 md:p-8",
                                    card.textPosition === "right" && "justify-center",
                                    card.textPosition === "left" && "justify-start"
                                )}
                            >
                                <h3
                                    className={cn(
                                        "text-[#2F5852] font-semibold leading-tight tracking-tight",
                                        "text-sm sm:text-2xl md:text-3xl lg:text-4xl",
                                        card.textPosition === "right" && "text-center",
                                        card.textPosition === "left" && "text-left",
                                        isActive && "underline underline-offset-4 decoration-2"
                                    )}
                                >
                                    {card.name.split('\n').map((line, i, arr) => (
                                        <span key={i}>
                                            {line}
                                            {i < arr.length - 1 && <br />}
                                        </span>
                                    ))}
                                </h3>
                            </div>

                            {/* Active indicator */}
                            {isActive && (
                                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
