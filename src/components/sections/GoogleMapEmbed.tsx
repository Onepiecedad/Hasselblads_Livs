import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface GoogleMapEmbedProps {
  src: string;
  title: string;
  className?: string;
  height?: number;
}

const GoogleMapEmbed = ({ src, title, className, height = 420 }: GoogleMapEmbedProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px" },
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden rounded-3xl border border-border/70 bg-muted/40", className)}
      style={{ minHeight: height }}
    >
      {isVisible ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          Laddar karta …
        </div>
      )}
    </div>
  );
};

export default GoogleMapEmbed;
