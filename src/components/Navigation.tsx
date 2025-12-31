import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import hasselbladsSymbol from "@/assets/logo-hasselblads-symbol.png";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { items, setOpen } = useCart();

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const navItems = [
    { name: "Webbutik", path: "/webbutik" },
    { name: "Hemleverans", path: "/hemleverans" },
    { name: "Vår butik", path: "/butiken" },
    { name: "Om oss", path: "/om-oss" },
    { name: "Kundservice", path: "/kundservice" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 soft-shadow">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 md:h-24 transition-all duration-300">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-4 group" aria-label="Hasselblads Livs startsida">
              <div className="relative">
                <img
                  src={hasselbladsSymbol}
                  alt="Hasselblads Livs logotyp"
                  className="h-12 w-12 rounded-full object-cover object-top sm:h-16 sm:w-16 transition-transform duration-500 group-hover:scale-110 shadow-md"
                  decoding="async"
                />
              </div>
              <span className="hidden text-xl md:text-2xl font-bold uppercase tracking-[0.3em] text-primary sm:block transition-colors duration-300">
                Hasselblads Livs
              </span>
              <span className="sr-only sm:hidden">Hasselblads Livs</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-10">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-sm font-semibold uppercase tracking-widest transition-all duration-300 hover:text-primary relative py-2 group ${active ? "text-primary" : "text-muted-foreground"
                      }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.name}
                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-transform duration-300 ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                  </Link>
                );
              })}
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full hover:bg-primary/10">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full hover:bg-primary/10">
                <User className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full hover:bg-primary/10"
                onClick={() => setOpen(true)}
                aria-label="Öppna varukorgen"
                aria-haspopup="dialog"
              >
                <ShoppingBag className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-lg animate-in fade-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                aria-label="Meny"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div
              id="mobile-navigation"
              className="lg:hidden py-8 space-y-6 border-t border-border/50 animate-in slide-in-from-top duration-300"
            >
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 text-lg font-bold uppercase tracking-widest transition-colors ${active ? "text-primary" : "text-muted-foreground"
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
    </>
  );
};

export default Navigation;
