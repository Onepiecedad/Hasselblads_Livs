import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Store, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

const BottomNav = () => {
    const location = useLocation();
    const { items, setOpen } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const cartCount = items.reduce((total, item) => total + item.quantity, 0);

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { name: "Hem", path: "/", icon: Home },
        { name: "Butik", path: "/webbutik", icon: Store },
    ];

    const menuItems = [
        { name: "Leverans", path: "/hemleverans" },
        { name: "Om oss", path: "/om-oss" },
        { name: "Kontakt", path: "/kundservice" },
    ];

    return (
        <>
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Panel */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed bottom-[72px] left-0 right-0 bg-background border-t border-border/60 z-50 animate-in slide-in-from-bottom duration-200 rounded-t-2xl shadow-2xl">
                    <nav className="p-4 space-y-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive(item.path)
                                    ? "bg-primary/10 text-primary"
                                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}

            {/* Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/60 safe-area-pb">
                <div className="flex items-center justify-around h-[72px] px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors ${active
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Icon className={`h-6 w-6 ${active ? "stroke-[2.5]" : ""}`} />
                                <span className={`text-xs ${active ? "font-semibold" : "font-medium"}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}

                    {/* Cart Button */}
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Öppna varukorgen"
                    >
                        <div className="relative">
                            <ShoppingBag className="h-6 w-6" />
                            {cartCount > 0 && (
                                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm">
                                    {cartCount > 99 ? "99+" : cartCount}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-medium">Varukorg</span>
                    </button>

                    {/* Menu Button */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors ${mobileMenuOpen
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        aria-label="Meny"
                        aria-expanded={mobileMenuOpen ? "true" : "false"}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                        <span className="text-xs font-medium">Meny</span>
                    </button>
                </div>
            </nav>
        </>
    );
};

export default BottomNav;
