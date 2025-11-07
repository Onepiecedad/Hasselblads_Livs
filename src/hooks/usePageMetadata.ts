import { useEffect } from "react";

export interface StructuredDataItem {
  id?: string;
  data: Record<string, unknown>;
}

interface PageMetadataOptions {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: "summary" | "summary_large_image";
  structuredData?: StructuredDataItem[];
}

const DEFAULT_OG_IMAGE = "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=1200&q=80&fm=webp";

const setMetaTag = (selector: string, attributes: { [key: string]: string }) => {
  const element = (document.head.querySelector(selector) as HTMLMetaElement | null) ?? (() => {
    const meta = document.createElement("meta");
    document.head.appendChild(meta);
    return meta;
  })();

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

const usePageMetadata = ({
  title,
  description,
  canonicalPath,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  twitterCard = "summary_large_image",
  structuredData = [],
}: PageMetadataOptions) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const origin = window.location?.origin ?? "";
    const canonicalUrl = canonicalPath.startsWith("http") ? canonicalPath : `${origin}${canonicalPath}`;

    let canonicalLink = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);

    setMetaTag("meta[name='description']", { name: "description", content: description });
    setMetaTag("meta[property='og:title']", { property: "og:title", content: title });
    setMetaTag("meta[property='og:description']", { property: "og:description", content: description });
    setMetaTag("meta[property='og:url']", { property: "og:url", content: canonicalUrl });
    setMetaTag("meta[property='og:type']", { property: "og:type", content: ogType });
    setMetaTag("meta[property='og:image']", { property: "og:image", content: ogImage });
    setMetaTag("meta[property='og:site_name']", { property: "og:site_name", content: "Hasselblads Livs" });
    setMetaTag("meta[name='twitter:card']", { name: "twitter:card", content: twitterCard });
    setMetaTag("meta[name='twitter:title']", { name: "twitter:title", content: title });
    setMetaTag("meta[name='twitter:description']", { name: "twitter:description", content: description });
    setMetaTag("meta[name='twitter:image']", { name: "twitter:image", content: ogImage });
    setMetaTag("meta[name='twitter:url']", { name: "twitter:url", content: canonicalUrl });
    setMetaTag("meta[name='twitter:site']", { name: "twitter:site", content: "@hasselbladslivs" });

    const scriptIds: string[] = [];
    structuredData.forEach((item, index) => {
      const scriptId = item.id ?? `structured-data-${canonicalPath.replace(/[^a-z0-9]/gi, "-")}-${index}`;
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = scriptId;
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(item.data);
      scriptIds.push(scriptId);
    });

    return () => {
      document.title = previousTitle;
      scriptIds.forEach((id) => {
        const script = document.getElementById(id);
        if (script) {
          script.remove();
        }
      });
    };
  }, [title, description, canonicalPath, ogImage, ogType, twitterCard, structuredData]);
};

export default usePageMetadata;
