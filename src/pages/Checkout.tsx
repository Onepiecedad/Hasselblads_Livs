import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { addItemsAndRedirectToCheckout } from "@/lib/woocommerce";
import usePageMetadata from "@/hooks/usePageMetadata";
import { Loader2, ShoppingBag, ExternalLink, AlertTriangle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Checkout = () => {
    usePageMetadata({
        title: "Kassa | Hasselblads Livs",
        description: "Slutför din beställning från Hasselblads Livs.",
        canonicalPath: "/kassa",
    });

    const { items, clearCart } = useCart();
    const [status, setStatus] = useState<'loading' | 'redirecting' | 'empty' | 'missing_ids'>('loading');

    useEffect(() => {
        if (!items || items.length === 0) {
            setStatus('empty');
            return;
        }

        const validItems = items.filter(item => item.woocommerce_id);

        if (validItems.length === 0) {
            console.group('🛒 [Checkout] Produkter saknar woocommerce_id');
            items.forEach((item, i) => {
                console.warn(`  ${i + 1}. "${item.name}" (ID: ${item.id}, WC: ${item.woocommerce_id ?? 'SAKNAS'})`);
            });
            console.groupEnd();
            setStatus('missing_ids');
            return;
        }

        setStatus('redirecting');
        addItemsAndRedirectToCheckout(items, clearCart);
    }, [items, clearCart]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Laddar varukorg...</p>
                </div>
            </div>
        );
    }

    if (status === 'empty') {
        return (
            <div className="min-h-screen bg-background">
                <section className="relative h-[300px] md:h-[400px] overflow-hidden">
                    <img src="/Bilder%20frukt/Butik1-frukt.jpg" alt="Hasselblads Livs kassa" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                    <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">Kassa</h1>
                    </div>
                </section>
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 max-w-2xl text-center">
                        <div className="rounded-3xl border border-border/70 bg-card p-12">
                            <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold mb-4">Din varukorg är tom</h2>
                            <p className="text-muted-foreground mb-6">
                                Lägg till produkter i varukorgen för att fortsätta till kassan.
                            </p>
                            <Button asChild size="lg">
                                <Link to="/webbutik">Börja handla</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (status === 'redirecting') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Skickar till kassan...</h2>
                    <p className="text-muted-foreground mb-4">
                        Du skickas nu till vår säkra betalningslösning.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-primary">
                        <ExternalLink className="h-4 w-4" />
                        <span>hasselbladslivs.se</span>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'missing_ids') {
        return (
            <div className="min-h-screen bg-background">
                <section className="relative h-[300px] md:h-[400px] overflow-hidden">
                    <img src="/Bilder%20frukt/Butik1-frukt.jpg" alt="Hasselblads Livs kassa" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                    <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">Kassa</h1>
                    </div>
                </section>
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 max-w-2xl text-center">
                        <div className="rounded-3xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-12">
                            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold mb-4">Beställ via telefon</h2>
                            <p className="text-muted-foreground mb-2">
                                Online-beställning är inte tillgänglig för dessa produkter just nu.
                            </p>
                            <p className="text-muted-foreground mb-8">
                                Ring oss gärna så hjälper vi dig med din beställning!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button asChild size="lg">
                                    <a href="tel:031876350" className="gap-2">
                                        <Phone className="h-4 w-4" />
                                        Ring 031-87 63 50
                                    </a>
                                </Button>
                                <Button asChild size="lg" variant="outline">
                                    <Link to="/webbutik">Tillbaka till butiken</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return null;
};

export default Checkout;
