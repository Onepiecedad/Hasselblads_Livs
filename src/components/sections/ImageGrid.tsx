import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

interface ImageGridProps {
  images: GalleryImage[];
  className?: string;
}

const ImageGrid = ({ images, className }: ImageGridProps) => {
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);

  return (
    <div className={cn("grid grid-cols-2 gap-4 md:grid-cols-3", className)}>
      {images.map((image) => (
        <button
          key={image.src}
          type="button"
          onClick={() => setActiveImage(image)}
          className="group relative overflow-hidden rounded-3xl border border-border/50 bg-muted/40"
          aria-label={`Visa större bild: ${image.alt}`}
        >
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {image.caption && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-left text-sm text-primary-foreground">
              {image.caption}
            </div>
          )}
        </button>
      ))}

      <Dialog open={Boolean(activeImage)} onOpenChange={(open) => !open && setActiveImage(null)}>
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
          {activeImage && (
            <div className="overflow-hidden rounded-3xl">
              <img src={activeImage.src} alt={activeImage.alt} className="w-full object-cover" loading="lazy" />
              {activeImage.caption && (
                <div className="bg-card p-4 text-sm text-muted-foreground">{activeImage.caption}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageGrid;
