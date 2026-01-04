import usePageMetadata from "@/hooks/usePageMetadata";

const Checkout = () => {
    usePageMetadata({
        title: "Kassa | Hasselblads Livs",
        description: "Slutför din beställning från Hasselblads Livs.",
        canonicalPath: "/kassa",
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative h-[300px] md:h-[400px] overflow-hidden">
                <img
                    src="/Bilder%20frukt/Butik1-frukt.jpg"
                    alt="Hasselblads Livs kassa"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                        Kassa
                    </h1>
                    <p className="text-lg text-white/90 max-w-xl drop-shadow-md">
                        Slutför din beställning
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 max-w-2xl text-center">
                    <div className="rounded-3xl border border-border/70 bg-card p-12">
                        <h2 className="text-2xl font-bold mb-4">Webbutik kommer snart</h2>
                        <p className="text-muted-foreground mb-6">
                            Vi arbetar på att lansera vår webbutik. Under tiden är du välkommen att kontakta oss för att göra en beställning.
                        </p>
                        <a
                            href="tel:031272792"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                        >
                            Ring oss: 031-27 27 92
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Checkout;
