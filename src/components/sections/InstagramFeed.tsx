import { Instagram, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

// Instagram placeholder images
const instagramImages = [
    "https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1467453678174-768ec283a940?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1457296898342-cdd24585d095?auto=format&fit=crop&w=400&q=80",
];

// Slideshow images for the right panel
const slideshowImages = [
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1610348725531-acac70f49b4f?auto=format&fit=crop&w=800&q=80",
];

const InstagramFeed = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-advance slideshow
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);

    return (
        <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
                {/* Two windows side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">

                    {/* Left Window - Instagram Feed */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* Window Header */}
                        <div className="bg-gradient-to-r from-primary to-primary/90 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <Instagram className="h-6 w-6 text-white" />
                                <div>
                                    <h3 className="text-lg font-bold text-white">@hasselbladslivs</h3>
                                    <p className="text-white/80 text-sm">Följ oss på Instagram</p>
                                </div>
                            </div>
                        </div>

                        {/* Instagram Grid */}
                        <div className="p-4">
                            <div className="grid grid-cols-3 gap-2">
                                {instagramImages.map((image, index) => (
                                    <a
                                        key={index}
                                        href="https://www.instagram.com/hasselbladslivs"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative aspect-square overflow-hidden rounded-lg"
                                    >
                                        <img
                                            src={image}
                                            alt={`Instagram post ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                            <Instagram className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                    </a>
                                ))}
                            </div>

                            {/* Instagram Button */}
                            <div className="mt-4 text-center">
                                <Button variant="outline" size="sm" asChild className="w-full">
                                    <a
                                        href="https://www.instagram.com/hasselbladslivs"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2"
                                    >
                                        <Instagram className="h-4 w-4" />
                                        Följ oss på Instagram
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Window - Image Slideshow */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* Window Header */}
                        <div className="bg-gradient-to-r from-primary to-primary/90 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-6 flex items-center justify-center">
                                    <span className="text-white text-lg">📸</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Från vår butik</h3>
                                    <p className="text-white/80 text-sm">Dagsfärska produkter</p>
                                </div>
                            </div>
                        </div>

                        {/* Slideshow */}
                        <div className="p-4">
                            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                                {slideshowImages.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`Butiksbild ${index + 1}`}
                                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                            }`}
                                    />
                                ))}

                                {/* Navigation arrows */}
                                <button
                                    onClick={prevSlide}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                                    aria-label="Föregående bild"
                                >
                                    <ChevronLeft className="h-5 w-5 text-gray-700" />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                                    aria-label="Nästa bild"
                                >
                                    <ChevronRight className="h-5 w-5 text-gray-700" />
                                </button>

                                {/* Dots indicator */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                                    {slideshowImages.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                                                    ? 'bg-white w-6'
                                                    : 'bg-white/60 hover:bg-white/80'
                                                }`}
                                            aria-label={`Gå till bild ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Caption */}
                            <p className="mt-4 text-center text-muted-foreground text-sm">
                                Varje dag levereras färska frukter och grönsaker till vår butik
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InstagramFeed;
