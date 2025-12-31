import { Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

// Social media placeholder images
const socialImages = [
    "https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1467453678174-768ec283a940?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1457296898342-cdd24585d095?auto=format&fit=crop&w=400&q=80",
];

const InstagramFeed = () => {
    return (
        <section className="py-24 md:py-32 bg-transparent">
            <div className="container mx-auto px-4">
                <div className="text-center mb-20">
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <span className="font-accent text-5xl md:text-7xl text-primary/60">följ vår vardag</span>
                        <div className="decorative-line" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold text-primary tracking-tight mb-8">Sociala medier</h2>
                    <p className="text-muted-foreground text-xl md:text-2xl max-w-3xl mx-auto text-balance font-medium opacity-70 leading-relaxed">
                        Följ vårt dagliga arbete i butiken. Vi uppdaterar löpande med nyanlända varor och inspiration för köket.
                    </p>
                </div>

                {/* Two windows side by side - Refined styles */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">

                    {/* Left Window - Instagram Feed */}
                    <div className="bg-white rounded-3xl soft-shadow border border-border/50 overflow-hidden transition-all duration-500 hover:shadow-2xl">
                        {/* Header Header */}
                        <div className="px-8 py-6 border-b border-border/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center">
                                        <Instagram className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">@hasselbladslivs</h3>
                                        <p className="text-muted-foreground text-sm">Instagram</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" asChild className="rounded-full">
                                    <a href="https://www.instagram.com/hasselbladslivs" target="_blank" rel="noopener noreferrer">
                                        Följ
                                    </a>
                                </Button>
                            </div>
                        </div>

                        {/* Instagram Grid */}
                        <div className="p-6">
                            <div className="grid grid-cols-3 gap-3">
                                {socialImages.map((image, index) => (
                                    <a
                                        key={index}
                                        href="https://www.instagram.com/hasselbladslivs"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative aspect-square overflow-hidden rounded-xl"
                                    >
                                        <img
                                            src={image}
                                            alt={`Instagram post ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                                            <Instagram className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Window - Facebook Feed */}
                    <div className="bg-white rounded-3xl soft-shadow border border-border/50 overflow-hidden transition-all duration-500 hover:shadow-2xl">
                        {/* Window Header */}
                        <div className="px-8 py-6 border-b border-border/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center">
                                        <Facebook className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">Hasselblads Livs</h3>
                                        <p className="text-muted-foreground text-sm">Facebook</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" asChild className="rounded-full">
                                    <a href="https://www.facebook.com/hasselbladslivs" target="_blank" rel="noopener noreferrer">
                                        Följ
                                    </a>
                                </Button>
                            </div>
                        </div>

                        {/* Facebook Grid */}
                        <div className="p-6">
                            <div className="grid grid-cols-3 gap-3">
                                {socialImages.map((image, index) => (
                                    <a
                                        key={index}
                                        href="https://www.facebook.com/hasselbladslivs"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative aspect-square overflow-hidden rounded-xl"
                                    >
                                        <img
                                            src={image}
                                            alt={`Facebook post ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                                            <Facebook className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InstagramFeed;
