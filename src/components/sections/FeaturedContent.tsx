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
            case 'instagram':
                // Simple Instagram embed - no transforms to ensure mobile compatibility
                // The embed will show the full Instagram player including header/footer
                return (
                    <div className="relative w-full h-full overflow-hidden rounded-lg bg-black">
                        <iframe
                            src={embedInfo.embedUrl}
                            className="absolute inset-0 w-full h-full"
                            style={{
                                border: 'none',
                            }}
                            scrolling="no"
                            frameBorder="0"
                            allowFullScreen={true}
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                            title="Instagram video"
                        />
                    </div>
                );

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
