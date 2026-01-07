import { ShoppingCart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Featured product data - will be replaced with dynamic data later
const featuredProduct = {
    name: "Potatis julpåse",
    description: "Upplev julens smaker med Östra Fornås Potatis julpåse, nyskördade från svenska gårdar.",
    price: "24.90",
    unit: "st",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82ber78?auto=format&fit=crop&w=800&q=80",
    href: "/produkt/potatis-julpase",
};

const FeaturedSection = () => {
    return (
        <section className="py-16 md:py-24 bg-transparent">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-primary tracking-tight mb-4">Aktuellt</h2>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium opacity-70 leading-relaxed">
                        Se vad som händer i butiken och upptäck veckans utvalda produkter.
                    </p>
                </div>

                {/* Two cards side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">

                    {/* Left - Video Card */}
                    <div className="bg-white rounded-2xl soft-shadow border border-border/30 overflow-hidden transition-all duration-500 hover:shadow-xl">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                    <Play className="h-5 w-5 text-white ml-0.5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">Från butiken</h3>
                                    <p className="text-muted-foreground text-sm">Se senaste klippet</p>
                                </div>
                            </div>

                            {/* Video Container */}
                            <div className="flex items-center justify-center rounded-xl overflow-hidden bg-muted/30">
                                <iframe
                                    src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F850613071270264%2F&show_text=false&width=267&t=0"
                                    width="267"
                                    height="400"
                                    style={{ border: 'none', overflow: 'hidden' }}
                                    scrolling="no"
                                    frameBorder="0"
                                    allowFullScreen={true}
                                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                    title="Video från butiken"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right - Product Card */}
                    <div className="bg-white rounded-2xl soft-shadow border border-border/30 overflow-hidden transition-all duration-500 hover:shadow-xl group">
                        <Link to={featuredProduct.href} className="block">
                            {/* Product Image */}
                            <div className="relative aspect-square bg-muted/20 overflow-hidden">
                                <img
                                    src={featuredProduct.image}
                                    alt={featuredProduct.name}
                                    className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>
                        </Link>

                        {/* Product Info */}
                        <div className="p-6">
                            <Link to={featuredProduct.href}>
                                <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {featuredProduct.name}
                                </h3>
                            </Link>
                            <p className="text-muted-foreground text-base mb-4 line-clamp-2">
                                {featuredProduct.description}
                            </p>

                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-3xl font-bold text-primary">{featuredProduct.price} kr</span>
                                    <span className="text-muted-foreground text-sm ml-1">/{featuredProduct.unit}</span>
                                </div>
                                <Button size="lg" className="rounded-lg gap-2">
                                    <ShoppingCart className="h-5 w-5" />
                                    Lägg i varukorg
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedSection;
