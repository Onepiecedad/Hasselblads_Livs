import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TwoColumnTextImageProps {
  title: string;
  description?: ReactNode;
  image: { src: string; alt: string };
  children: ReactNode;
  imagePosition?: "left" | "right";
  className?: string;
}

const TwoColumnTextImage = ({ title, description, image, children, imagePosition = "right", className }: TwoColumnTextImageProps) => {
  const isImageLeft = imagePosition === "left";

  return (
    <section className={cn("grid gap-10 md:grid-cols-2", className)}>
      <div className={cn("space-y-4", isImageLeft && "md:order-2")}
      >
        <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
        {description && <p className="text-lg text-muted-foreground">{description}</p>}
        <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">{children}</div>
      </div>
      <div className={cn("overflow-hidden rounded-3xl", isImageLeft && "md:order-1")}
      >
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
};

export default TwoColumnTextImage;
