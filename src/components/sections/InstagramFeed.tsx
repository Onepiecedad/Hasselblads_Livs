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
                                {socialImages.map((image, index) => (
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

                    {/* Right Window - Facebook Feed */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* Window Header */}
                        <div className="bg-gradient-to-r from-primary to-primary/90 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <Facebook className="h-6 w-6 text-white" />
                                <div>
                                    <h3 className="text-lg font-bold text-white">Hasselblads Livs</h3>
                                    <p className="text-white/80 text-sm">Följ oss på Facebook</p>
                                </div>
                            </div>
                        </div>

                        {/* Facebook Grid */}
                        <div className="p-4">
                            <div className="grid grid-cols-3 gap-2">
                                {socialImages.map((image, index) => (
                                    <a
                                        key={index}
                                        href="https://www.facebook.com/hasselbladslivs"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative aspect-square overflow-hidden rounded-lg"
                                    >
                                        <img
                                            src={image}
                                            alt={`Facebook post ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                            <Facebook className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                    </a>
                                ))}
                            </div>

                            {/* Facebook Button */}
                            <div className="mt-4 text-center">
                                <Button variant="outline" size="sm" asChild className="w-full">
                                    <a
                                        href="https://www.facebook.com/hasselbladslivs"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2"
                                    >
                                        <Facebook className="h-4 w-4" />
                                        Följ oss på Facebook
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InstagramFeed;
