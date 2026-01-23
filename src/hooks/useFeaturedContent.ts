import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Type definitions matching the implementation plan
export type FeatureCardId = 'godast' | 'nyheter' | 'isasong' | 'erbjudanden';

export interface FeatureCard {
    id: FeatureCardId;
    title: string;
    productIds: string[];
    isActive: boolean;
    updatedAt: Date;
}

export interface FeaturedVideo {
    type: 'url' | 'uploaded';
    url: string;
    thumbnailUrl?: string;
    activeCardId: FeatureCardId;
    updatedAt: Date;
    updatedBy: string;
}

export interface HomepageSettings {
    featuredVideo: FeaturedVideo;
    featureCards: {
        godast: FeatureCard;
        nyheter: FeatureCard;
        isasong: FeatureCard;
        erbjudanden: FeatureCard;
    };
    updatedAt: Date;
}

// Helper function to parse video URLs and generate embed info
export interface VideoEmbedInfo {
    type: 'instagram' | 'youtube' | 'facebook' | 'direct';
    embedUrl: string;
    thumbnailUrl?: string;
}

export function getVideoEmbedInfo(url: string): VideoEmbedInfo {
    // Instagram Reel
    const instagramMatch = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
    if (instagramMatch) {
        return {
            type: 'instagram',
            embedUrl: `https://www.instagram.com/reel/${instagramMatch[1]}/embed`,
        };
    }

    // YouTube - supports various formats
    const youtubeMatch = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]+)/
    );
    if (youtubeMatch) {
        return {
            type: 'youtube',
            embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
            thumbnailUrl: `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`,
        };
    }

    // Facebook Reel/Video
    const facebookMatch = url.match(/facebook\.com\/(?:reel|watch|.*\/videos)\/(\d+)/);
    if (facebookMatch) {
        return {
            type: 'facebook',
            embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`,
        };
    }

    // Default: direct video URL (Cloudinary, etc.)
    return {
        type: 'direct',
        embedUrl: url,
    };
}

// Default settings for fallback
const DEFAULT_VIDEO: FeaturedVideo = {
    type: 'url',
    url: 'https://www.facebook.com/reel/850613071270264/',
    activeCardId: 'godast',
    updatedAt: new Date(),
    updatedBy: 'system',
};

const DEFAULT_FEATURE_CARDS: HomepageSettings['featureCards'] = {
    godast: { id: 'godast', title: 'Godast just nu', productIds: [], isActive: true, updatedAt: new Date() },
    nyheter: { id: 'nyheter', title: 'Nyheter', productIds: [], isActive: false, updatedAt: new Date() },
    isasong: { id: 'isasong', title: 'I säsong', productIds: [], isActive: false, updatedAt: new Date() },
    erbjudanden: { id: 'erbjudanden', title: 'Erbjudanden', productIds: [], isActive: false, updatedAt: new Date() },
};

const DEFAULT_SETTINGS: HomepageSettings = {
    featuredVideo: DEFAULT_VIDEO,
    featureCards: DEFAULT_FEATURE_CARDS,
    updatedAt: new Date(),
};

/**
 * Hook to subscribe to homepage settings from Firebase in real-time.
 * Used on the public website to display dynamic content.
 */
export function useFeaturedContent() {
    const [settings, setSettings] = useState<HomepageSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const docRef = doc(db, 'organizations/hasselblad_common/settings/homepage');

        const unsubscribe = onSnapshot(
            docRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setSettings({
                        featuredVideo: {
                            type: data.featuredVideo?.type || 'url',
                            url: data.featuredVideo?.url || DEFAULT_VIDEO.url,
                            thumbnailUrl: data.featuredVideo?.thumbnailUrl,
                            activeCardId: data.featuredVideo?.activeCardId || 'godast',
                            updatedAt: data.featuredVideo?.updatedAt?.toDate?.() || new Date(),
                            updatedBy: data.featuredVideo?.updatedBy || 'system',
                        },
                        featureCards: {
                            godast: data.featureCards?.godast || DEFAULT_FEATURE_CARDS.godast,
                            nyheter: data.featureCards?.nyheter || DEFAULT_FEATURE_CARDS.nyheter,
                            isasong: data.featureCards?.isasong || DEFAULT_FEATURE_CARDS.isasong,
                            erbjudanden: data.featureCards?.erbjudanden || DEFAULT_FEATURE_CARDS.erbjudanden,
                        },
                        updatedAt: data.updatedAt?.toDate?.() || new Date(),
                    });
                } else {
                    // Document doesn't exist yet, use defaults
                    setSettings(DEFAULT_SETTINGS);
                }
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                console.error('Error fetching homepage settings:', err);
                setError(err);
                setIsLoading(false);
                // Keep using defaults on error
            }
        );

        return () => unsubscribe();
    }, []);

    // Computed: get active card based on video settings
    const activeCard = settings.featureCards[settings.featuredVideo.activeCardId];

    // Computed: get embed info for current video
    const videoEmbedInfo = getVideoEmbedInfo(settings.featuredVideo.url);

    return {
        settings,
        featuredVideo: settings.featuredVideo,
        featureCards: settings.featureCards,
        activeCard,
        activeCardId: settings.featuredVideo.activeCardId,
        videoEmbedInfo,
        isLoading,
        error,
    };
}
