import { Link } from "react-router-dom";
import { useFeaturedContent, getVideoEmbedInfo } from "@/hooks/useFeaturedContent";
import { Loader2 } from "lucide-react";

/**
 * FeaturedContent - Displays the "Aktuellt" section on the homepage.
 * 
 * Features:
 * - Shows video from Firebase (supports Instagram, YouTube, Facebook, or direct URLs)
 * - Links the video to the currently active feature card (focus filter)
 * - Real-time updates when admin changes settings in PIM app
 */
const FeaturedContent = () => {
    const { featuredVideo, activeCardId, isLoading, error } = useFeaturedContent();

    // Get embed information for the video URL
    const embedInfo = getVideoEmbedInfo(featuredVideo.url);

    // Use activeCardId directly for the focus parameter
    // Webshop.tsx handles the mapping from card ID to product tag internally
    const focusParam = activeCardId;

    // Render video based on type
    const renderVideo = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-full bg-muted/20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
                </div>
            );
        }

        if (error) {
            // Fallback to default Facebook embed on error
            return (
                <iframe
                    src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F850613071270264%2F&show_text=false&width=267&t=0"
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    title="Video från butiken"
                />
            );
        }

        switch (embedInfo.type) {
            case 'instagram': {
                // Instagram embeds don't work reliably on mobile
                // Instead, show a clickable area that opens Instagram directly
                const instagramUrl = featuredVideo.url;
                return (
                    <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-purple-600 via-pink-500 to-orange-400 rounded-lg group cursor-pointer"
                    >
                        {/* Instagram-style gradient background */}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors rounded-lg" />

                        {/* Play button */}
                        <div className="relative z-10 flex flex-col items-center gap-4 text-white">
                            <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                            <span className="text-lg font-semibold">Se på Instagram</span>
                        </div>

                        {/* Instagram logo */}
                        <div className="absolute bottom-4 right-4">
                            <svg className="w-8 h-8 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </div>
                    </a>
                );
            }

            case 'youtube':
                return (
                    <iframe
                        src={`${embedInfo.embedUrl}?autoplay=0&rel=0&modestbranding=1`}
                        className="w-full h-full"
                        style={{ border: 'none' }}
                        frameBorder="0"
                        allowFullScreen={true}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        title="YouTube video"
                    />
                );

            case 'facebook':
                return (
                    <iframe
                        src={embedInfo.embedUrl}
                        className="w-full h-full"
                        style={{ border: 'none' }}
                        scrolling="no"
                        frameBorder="0"
                        allowFullScreen={true}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        title="Facebook video"
                    />
                );

            case 'direct':
            default:
                return (
                    <video
                        src={embedInfo.embedUrl}
                        className="w-full h-full object-cover"
                        controls
                        playsInline
                        preload="metadata"
                    >
                        Din webbläsare stöder inte videouppspelning.
                    </video>
                );
        }
    };

    return (
        <section className="py-10 md:py-14 bg-transparent">
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">Aktuellt</h2>
                </div>

                {/* Video container - Video can now be played */}
                <div className="flex justify-center">
                    <div
                        className="rounded-2xl overflow-hidden shadow-lg w-[280px] md:w-[340px]"
                        style={{ aspectRatio: '9/16' }}
                    >
                        {renderVideo()}
                    </div>
                </div>

                {/* CTA button to webshop */}
                <div className="flex justify-center mt-6">
                    <Link
                        to={`/webbutik?tag=${focusParam}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold text-base transition-all duration-300 hover:bg-primary/90 hover:scale-105 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
                        aria-label={`Se ${activeCardId === 'godast' ? 'godast just nu' : activeCardId} i webbutiken`}
                    >
                        Se {
                            activeCardId === 'godast' ? 'godast just nu' :
                                activeCardId === 'nyheter' ? 'nyheter' :
                                    activeCardId === 'isasong' ? 'varor i säsong' :
                                        'erbjudanden'
                        } i webbutiken
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedContent;
