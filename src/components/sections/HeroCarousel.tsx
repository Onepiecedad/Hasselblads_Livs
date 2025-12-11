import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Placeholder images - replace with actual product/store images
const carouselImages = [
    {
        src: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
        alt: "Färska grönsaker",
        title: "Färskt varje dag",
        subtitle: "Handplockat för bästa kvalitet",
    },
    {
        src: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80",
        alt: "Frukt och grönt",
        title: "Säsongens bästa",
        subtitle: "Lokalt odlat när det är möjligt",
    },
    {
        src: "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1200&q=80",
        alt: "Delikatesser",
        title: "Delikatesser",
        subtitle: "Noga utvalda smakupplevelser",
    },
];

const HeroCarousel = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
        };
    }, [emblaApi, onSelect]);

    // Auto-scroll
    useEffect(() => {
        if (!emblaApi) return;
        const interval = setInterval(() => {
            emblaApi.scrollNext();
        }, 5000);
        return () => clearInterval(interval);
    }, [emblaApi]);

    return (
        <section className="py-16 bg-muted/20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold">Upptäck vårt sortiment</h2>
                    <p className="mt-3 text-muted-foreground">
                        Kvalitet och smak i varje produkt
                    </p>
                </div>

                <div className="relative max-w-5xl mx-auto">
                    <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
                        <div className="flex">
                            {carouselImages.map((image, index) => (
                                <div
                                    key={index}
                                    className="flex-[0_0_100%] min-w-0 relative aspect-[16/9]"
                                >
                                    <img
                                        src={image.src}
                                        alt={image.alt}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute bottom-8 left-8 text-white">
                                        <h3 className="text-2xl md:text-3xl font-bold mb-2">
                                            {image.title}
                                        </h3>
                                        <p className="text-lg opacity-90">{image.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation buttons */}
                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg"
                        onClick={scrollPrev}
                        aria-label="Föregående bild"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg"
                        onClick={scrollNext}
                        aria-label="Nästa bild"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>

                    {/* Dots indicator */}
                    <div className="flex justify-center gap-2 mt-6">
                        {carouselImages.map((_, index) => (
                            <button
                                key={index}
                                className={`w-2 h-2 rounded-full transition-colors ${index === selectedIndex ? "bg-primary" : "bg-muted-foreground/30"
                                    }`}
                                onClick={() => emblaApi?.scrollTo(index)}
                                aria-label={`Gå till bild ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroCarousel;
