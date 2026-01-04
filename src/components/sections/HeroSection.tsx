import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  backgroundImage?: string;
  imageAlt?: string;
  overlayClassName?: string;
  className?: string;
  children?: ReactNode;
  minHeight?: string;
}

const HeroSection = ({
  eyebrow,
  title,
  description,
  align = "center",
  backgroundImage,
  imageAlt,
  overlayClassName,
  className,
  children,
  minHeight,
}: HeroSectionProps) => {
  const contentAlign = align === "center" ? "mx-auto text-center" : "ml-0 text-left";

  return (
    <section
      className={cn("relative overflow-hidden", className)}
      style={minHeight ? { minHeight } : undefined}
    >
      {backgroundImage && (
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt={imageAlt ?? ""}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60",
              overlayClassName,
            )}
          />
        </div>
      )}
      <div className={cn(
        "relative z-10 container mx-auto px-4 h-full flex items-center",
        minHeight ? "py-8" : "py-16 md:py-24",
        align === "center" ? "justify-center" : "justify-start"
      )}>
        <div className={cn("max-w-3xl", contentAlign)}>
          {eyebrow && (
            <span
              className={cn(
                "uppercase tracking-[0.2em] text-sm md:text-base",
                backgroundImage ? "text-primary-foreground/80" : "text-muted-foreground",
              )}
            >
              {eyebrow}
            </span>
          )}
          <h1
            className={cn(
              "mt-3 text-4xl font-bold md:text-5xl",
              backgroundImage ? "text-primary-foreground" : "text-foreground",
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                "mt-4 text-lg text-primary-foreground/90 md:text-xl",
                !backgroundImage && "text-muted-foreground",
              )}
            >
              {description}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
