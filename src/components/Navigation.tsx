import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { LoginModal } from "@/components/auth/LoginModal";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { items, setOpen } = useCart();

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  const isCheckout = location.pathname === '/kassa';

  // ── Scroll-direction aware sticky header ──
  const [headerVisible, setHeaderVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;

      // Show condensed style when scrolled past 40px
      setScrolled(y > 40);

      // Always show header at the very top
      if (y <= 10) {
        setHeaderVisible(true);
      } else if (delta > 8) {
        // Scrolling down fast enough → hide
        setHeaderVisible(false);
        setMobileMenuOpen(false); // close mobile menu on hide
      } else if (delta < -4) {
        // Scrolling up → reveal
        setHeaderVisible(true);
      }

      lastScrollY.current = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: "Webbutik", path: "/webbutik" },
    { name: "Leverans", path: "/hemleverans" },
    { name: "Om oss", path: "/om-oss" },
    { name: "Kontakt", path: "/kundservice" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50
          bg-primary/95 backdrop-blur-md border-b border-white/10
          transition-all duration-300 ease-in-out
          ${headerVisible ? 'translate-y-0' : '-translate-y-full'}
          ${scrolled ? 'shadow-xl' : 'shadow-lg'}
        `}
      >
        <div className="w-full px-4 md:px-8">
          <div
            className={`
              flex items-center justify-between
              transition-all duration-300
              ${scrolled ? 'h-16 md:h-18' : 'h-20 md:h-24'}
            `}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center group" aria-label="Hasselblads Livs startsida">
              <img
                src="/logo-horizontal-green.png"
                alt="Hasselblads Livs logotyp"
                className={`
                  w-auto object-contain transition-all duration-500 group-hover:scale-105 invert brightness-0
                  ${scrolled ? 'h-18 sm:h-20 md:h-24' : 'h-24 sm:h-28 md:h-32'}
                `}
                decoding="async"
              />
            </Link>

            {!isCheckout && (
              <>
                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center space-x-10">
                  {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`text-sm font-semibold uppercase tracking-widest transition-all duration-300 hover:text-white relative py-2 group ${active ? "text-white" : "text-white/70"
                          }`}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.name}
                        <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-white transition-transform duration-300 ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                      </Link>
                    );
                  })}
                </div>

                {/* Right Icons */}
                <div className="flex items-center space-x-2 md:space-x-4">
                  <LoginModal />

                  <button
                    className="relative flex items-center justify-center h-14 w-14 rounded-full text-white hover:bg-white/10 transition-colors md:h-16 md:w-16"
                    onClick={() => setOpen(true)}
                    aria-label="Öppna varukorgen"
                    aria-haspopup="dialog"
                  >
                    <ShoppingBag className="!h-9 !w-9 md:!h-11 md:!w-11" strokeWidth={1.75} />
                    {cartCount > 0 && (
                      <span className="absolute right-0 top-0 flex min-h-6 min-w-6 -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold leading-none text-primary shadow-lg animate-in fade-in zoom-in md:min-h-7 md:min-w-7 md:text-xs">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  {/* Mobile Menu Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden rounded-full text-white hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-navigation"
                    aria-label="Meny"
                  >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          {!isCheckout && mobileMenuOpen && (
            <div
              id="mobile-navigation"
              className="lg:hidden py-8 space-y-6 border-t border-white/20 animate-in slide-in-from-top duration-300"
            >
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 text-lg font-bold uppercase tracking-widest transition-colors ${active ? "text-white" : "text-white/70"
                      }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Spacer to push content below the fixed header */}
      <div className="h-20 md:h-24" aria-hidden="true" />
    </>
  );
};

export default Navigation;
