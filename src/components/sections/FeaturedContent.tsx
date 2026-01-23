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
                // Use clip-path to physically cut off header and footer
                // Combined with scale to fill the container after clipping
                return (
                    <div
                        className="relative w-full h-full overflow-hidden rounded-lg"
                    >
                        <iframe
                            src={embedInfo.embedUrl}
                            className="absolute"
                            style={{
                                border: 'none',
                                width: '100%',
                                height: '100%',
                                // Clip: top 10%, right 0%, bottom 30%, left 0%
                                // This removes header and footer
                                clipPath: 'inset(10% 0 30% 0)',
                                // Scale up to fill the clipped area
                                transform: 'scale(1.7)',
                                transformOrigin: 'center center',
                                pointerEvents: 'auto',
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

                {/* Video container - Links to webshop with active focus filter */}
                <div className="flex justify-center">
                    <Link
                        to={`/webbutik?focus=${focusParam}`}
                        className="group block rounded-2xl overflow-hidden shadow-lg w-[280px] md:w-[340px] transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
                        style={{ aspectRatio: '9/16' }}
                        aria-label={`Se ${activeCardId === 'godast' ? 'godast just nu' : activeCardId} i webbutiken`}
                    >
                        {renderVideo()}
                    </Link>
                </div>

                {/* Optional: Show which focus is active */}
                <p className="text-center mt-4 text-sm text-muted-foreground">
                    Klicka för att se <span className="font-medium text-primary">{
                        activeCardId === 'godast' ? 'godast just nu' :
                            activeCardId === 'nyheter' ? 'nyheter' :
                                activeCardId === 'isasong' ? 'varor i säsong' :
                                    'erbjudanden'
                    }</span> i webbutiken
                </p>
            </div>
        </section>
    );
};

export default FeaturedContent;
