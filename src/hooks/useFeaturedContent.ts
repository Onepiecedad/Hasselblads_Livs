import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Type definitions matching PIM data model
export type FeatureCardId = 'godast' | 'nyheter' | 'isasong' | 'erbjudanden';

export interface FeaturedVideo {
    type: 'url' | 'uploaded';
    url: string;
    thumbnailUrl?: string;
    activeCardId: FeatureCardId;
    updatedAt: Date;
    updatedBy: string;
}

export interface FeatureCard {
    id: FeatureCardId;
    title: string;
    productIds: string[];
    isActive?: boolean;
    video?: FeaturedVideo;
    updatedAt: Date;
}

export interface HomepageSettings {
    featuredVideo?: FeaturedVideo; // Legacy field — kept for backward compat
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
    const isFacebookUrl = url.includes('facebook.com');
    if (isFacebookUrl) {
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

// Card metadata
const CARD_IDS: FeatureCardId[] = ['godast', 'nyheter', 'isasong', 'erbjudanden'];

export function getCardTitle(cardId: FeatureCardId): string {
    const titles: Record<FeatureCardId, string> = {
        godast: 'Godast just nu',
        nyheter: 'Nyheter',
        isasong: 'I säsong',
        erbjudanden: 'Erbjudanden',
    };
    return titles[cardId];
}

// Default settings for fallback
const DEFAULT_FEATURE_CARDS: HomepageSettings['featureCards'] = {
    godast: { id: 'godast', title: 'Godast just nu', productIds: [], updatedAt: new Date() },
    nyheter: { id: 'nyheter', title: 'Nyheter', productIds: [], updatedAt: new Date() },
    isasong: { id: 'isasong', title: 'I säsong', productIds: [], updatedAt: new Date() },
    erbjudanden: { id: 'erbjudanden', title: 'Erbjudanden', productIds: [], updatedAt: new Date() },
};

const DEFAULT_SETTINGS: HomepageSettings = {
    featureCards: DEFAULT_FEATURE_CARDS,
    updatedAt: new Date(),
};

/**
 * Represents a card that has a video configured.
 * Used by the carousel to render only cards with videos.
 */
export interface CardWithVideo {
    cardId: FeatureCardId;
    title: string;
    video: FeaturedVideo;
    embedInfo: VideoEmbedInfo;
    productIds: string[];
}

/**
 * Hook to subscribe to homepage settings from Firebase in real-time.
 * Returns all cards that have videos configured, plus helpers.
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

                    // Parse feature cards, reading video from each card
                    const parseCard = (cardId: FeatureCardId): FeatureCard => {
                        const rawCard = data.featureCards?.[cardId];
                        if (!rawCard) return DEFAULT_FEATURE_CARDS[cardId];

                        const card: FeatureCard = {
                            id: cardId,
                            title: rawCard.title || getCardTitle(cardId),
                            productIds: rawCard.productIds || [],
                            isActive: rawCard.isActive,
                            updatedAt: rawCard.updatedAt?.toDate?.() || new Date(),
                        };

                        // Read video from card if present
                        if (rawCard.video && rawCard.video.url) {
                            card.video = {
                                type: rawCard.video.type || 'url',
                                url: rawCard.video.url,
                                thumbnailUrl: rawCard.video.thumbnailUrl,
                                activeCardId: cardId,
                                updatedAt: rawCard.video.updatedAt?.toDate?.() || new Date(),
                                updatedBy: rawCard.video.updatedBy || 'system',
                            };
                        }
                        // Backward compat: if no card videos exist, fall back to global featuredVideo
                        else if (data.featuredVideo?.url && data.featuredVideo.activeCardId === cardId) {
                            card.video = {
                                type: data.featuredVideo.type || 'url',
                                url: data.featuredVideo.url,
                                thumbnailUrl: data.featuredVideo.thumbnailUrl,
                                activeCardId: cardId,
                                updatedAt: data.featuredVideo.updatedAt?.toDate?.() || new Date(),
                                updatedBy: data.featuredVideo.updatedBy || 'system',
                            };
                        }

                        return card;
                    };

                    setSettings({
                        featureCards: {
                            godast: parseCard('godast'),
                            nyheter: parseCard('nyheter'),
                            isasong: parseCard('isasong'),
                            erbjudanden: parseCard('erbjudanden'),
                        },
                        updatedAt: data.updatedAt?.toDate?.() || new Date(),
                    });
                } else {
                    setSettings(DEFAULT_SETTINGS);
                }
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                console.error('Error fetching homepage settings:', err);
                setError(err);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Compute: cards that have a video configured
    const cardsWithVideo: CardWithVideo[] = CARD_IDS
        .filter(cardId => {
            const card = settings.featureCards[cardId];
            return card?.video?.url;
        })
        .map(cardId => {
            const card = settings.featureCards[cardId];
            return {
                cardId,
                title: card.title || getCardTitle(cardId),
                video: card.video!,
                embedInfo: getVideoEmbedInfo(card.video!.url),
                productIds: card.productIds || [],
            };
        });

    // Helper function to get product IDs for a specific feature card
    const getCardProducts = (cardId: FeatureCardId): string[] => {
        const card = settings.featureCards[cardId];
        return card?.productIds || [];
    };

    // Helper to get video for a specific card
    const getCardVideo = (cardId: FeatureCardId): FeaturedVideo | undefined => {
        return settings.featureCards[cardId]?.video;
    };

    return {
        settings,
        featureCards: settings.featureCards,
        cardsWithVideo,
        getCardProducts,
        getCardVideo,
        isLoading,
        error,
    };
}
