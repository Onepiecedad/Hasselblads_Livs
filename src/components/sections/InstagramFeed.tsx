import { Play } from "lucide-react";

const FeaturedSection = () => {
    return (
        <section className="py-16 md:py-24 bg-transparent">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-primary tracking-tight mb-4">Aktuellt</h2>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium opacity-70 leading-relaxed">
                        Se vad som händer i butiken.
                    </p>
                </div>

                {/* Video Card - centered */}
                <div className="max-w-md mx-auto">
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

                            {/* Video Container - Responsive */}
                            <div className="w-full rounded-xl overflow-hidden bg-muted/30">
                                <div className="relative w-full" style={{ aspectRatio: '9/16', maxWidth: '320px', margin: '0 auto' }}>
                                    <iframe
                                        src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F850613071270264%2F&show_text=false&width=267&t=0"
                                        className="absolute inset-0 w-full h-full"
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
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedSection;
