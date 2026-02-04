import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to top of page on route changes
 * Uses smooth scroll for better UX
 */
export function useScrollRestoration() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [pathname]);
}
