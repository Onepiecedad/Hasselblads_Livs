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

    // Facebook Reel/Video - supports multiple URL formats
    // Examples: 
    // - facebook.com/reel/850613071270264
    // - facebook.com/share/v/abc123
    // - facebook.com/watch?v=123
    // - facebook.com/user/videos/123
    const isFacebookUrl = url.includes('facebook.com');
    if (isFacebookUrl) {
        // For Facebook, always use the plugins/video.php embed format
        // This works for most Facebook video types
        return {
            type: 'facebook',
            embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=267&height=476`,
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

// Module-level cache to persist settings across navigations (singleton pattern)
let cachedSettings: HomepageSettings | null = null;
let featuredUnsubscribeRef: (() => void) | null = null;

/**
 * Hook to subscribe to homepage settings from Firebase in real-time.
 * Uses singleton subscription pattern to avoid duplicate Firestore listeners.
 */
export function useFeaturedContent() {
    const [settings, setSettings] = useState<HomepageSettings>(cachedSettings || DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(!cachedSettings);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // If we already have cached settings, use them immediately
        if (cachedSettings) {
            setSettings(cachedSettings);
            setIsLoading(false);
        }

        // If we already have an active subscription, don't create another
        if (featuredUnsubscribeRef) {
            return;
        }

        const docRef = doc(db, 'organizations/hasselblad_common/settings/homepage');

        featuredUnsubscribeRef = onSnapshot(
            docRef,
            (snapshot) => {
                let newSettings: HomepageSettings;
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    newSettings = {
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
                    };
                } else {
                    newSettings = DEFAULT_SETTINGS;
                }
                // Update cache
                cachedSettings = newSettings;
                setSettings(newSettings);
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                console.error('Error fetching homepage settings:', err);
                setError(err);
                setIsLoading(false);
            }
        );

        // Don't unsubscribe - keep the subscription active for real-time updates
    }, []);

    // Computed: get active card based on video settings
    const activeCard = settings.featureCards[settings.featuredVideo.activeCardId];

    // Computed: get embed info for current video
    const videoEmbedInfo = getVideoEmbedInfo(settings.featuredVideo.url);

    // Helper function to get product IDs for a specific feature card
    const getCardProducts = (cardId: FeatureCardId): string[] => {
        const card = settings.featureCards[cardId];
        return card?.productIds || [];
    };

    return {
        settings,
        featuredVideo: settings.featuredVideo,
        featureCards: settings.featureCards,
        activeCard,
        activeCardId: settings.featuredVideo.activeCardId,
        videoEmbedInfo,
        getCardProducts,
        isLoading,
        error,
    };
}
