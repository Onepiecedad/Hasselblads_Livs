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
        md:hidden
        fixed bottom-6 right-4
        w-10 h-10
        bg-primary/90 backdrop-blur-sm
        text-white
        rounded-full
        shadow-lg
        flex items-center justify-center
        transition-all duration-300 ease-out
        ${isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none"
                }
        active:scale-95
        z-40
      `}
        >
            <ChevronUp className="h-5 w-5" />
        </button>
    );
};

export default ScrollToTop;
