import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button when user scrolls down 400px
            setIsVisible(window.scrollY > 400);
        };

        window.addEventListener("scroll", toggleVisibility, { passive: true });
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // Only show on mobile (md breakpoint and below)
    return (
        <button
            onClick={scrollToTop}
            aria-label="Tillbaka till toppen"
            className={`
        fixed bottom-8 right-8
        w-12 h-12
        bg-white/80 backdrop-blur-md
        border border-black/5
        text-primary
        hover:bg-primary hover:text-white hover:border-transparent
        rounded-full
        shadow-sm hover:shadow-lg
        flex items-center justify-center
        transition-all duration-500 ease-out
        ${isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8 pointer-events-none"
                }
        active:scale-95
        z-50
      `}
        >
            <ChevronUp className="h-5 w-5 stroke-[1.5]" />
        </button>
    );
};

export default ScrollToTop;
