import { useEffect, useMemo, useState } from "react";

export interface InstagramPost {
  id: string;
  shortcode: string;
  caption: string;
  imageUrl: string;
  thumbnailUrl: string;
  permalink: string;
  takenAt: string | null;
  isVideo: boolean;
  likeCount: number;
  commentCount: number;
  username: string;
}

interface UseInstagramFeedOptions {
  limit?: number;
  username?: string;
}

const DEFAULT_USERNAME = "hasselbladsfruktochgront";

export function useInstagramFeed(options: UseInstagramFeedOptions = {}) {
  const { limit = 6, username = DEFAULT_USERNAME } = options;
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const feedUrl = useMemo(() => {
    const base = import.meta.env.VITE_INSTAGRAM_FEED_URL?.trim() || "/.netlify/functions/instagram-feed";
    const params = new URLSearchParams({ limit: String(limit), username });
    const separator = base.includes("?") ? "&" : "?";

    return `${base}${separator}${params.toString()}`;
  }, [limit, username]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPosts() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(feedUrl, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }

        const payload = await response.json();
        const incomingPosts: InstagramPost[] = Array.isArray(payload?.posts) ? payload.posts : [];

        if (!controller.signal.aborted) {
          setPosts(incomingPosts);
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Instagram feed request failed", err);
        setError(err instanceof Error ? err.message : "Unexpected error");
        setPosts([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchPosts();

    return () => {
      controller.abort();
    };
  }, [feedUrl]);

  return {
    posts,
    isLoading,
    error,
  };
}
