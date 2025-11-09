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
    { name: "Säsong & Erbjudanden", path: "/säsong" },
    { name: "Hemleverans", path: "/hemleverans" },
    { name: "Butiken", path: "/butiken" },
    { name: "Om oss", path: "/om-oss" },
    { name: "Kundservice", path: "/kundservice" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Notice Bar */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm">
        <p>Fri hemleverans i Mölndal vid order över 400 kr.</p>
      </div>
      
      <nav className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3" aria-label="Hasselblads Livs startsida">
            <img
              src={hasselbladsSymbol}
              alt="Hasselblads Livs logotyp"
              className="h-12 w-12 rounded-full object-cover object-top sm:h-14 sm:w-14"
              decoding="async"
            />
            <span className="hidden text-2xl font-semibold uppercase tracking-[0.25em] text-primary sm:block">
              Hasselblads Livs
            </span>
            <span className="sr-only sm:hidden">Hasselblads Livs</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              aria-label="Öppna varukorgen"
              aria-haspopup="dialog"
            >
              <div className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </div>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
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
            className="md:hidden py-4 space-y-2 border-t border-border"
          >
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 text-base font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
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
