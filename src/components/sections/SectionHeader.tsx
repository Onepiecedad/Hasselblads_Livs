import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  eyebrowIcon?: ReactNode;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

const SectionHeader = ({ eyebrow, eyebrowIcon, title, description, align = "center", className }: SectionHeaderProps) => {
  const alignmentClass = align === "center" ? "text-center" : "text-left";
  const eyebrowLayout = align === "center" ? "justify-center" : "justify-start";

  return (
    <div className={cn("mb-10", alignmentClass, className)}>
      {(eyebrow || eyebrowIcon) && (
        <span
          className={cn(
            "mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/80",
            eyebrowLayout === "justify-center" ? "mx-auto" : "",
            "bg-muted/30",
          )}
        >
          {eyebrowIcon && <span className="text-primary">{eyebrowIcon}</span>}
          {eyebrow && <span>{eyebrow}</span>}
        </span>
      )}
      <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
      {description && (
        <p className={cn("mt-4 text-lg text-muted-foreground", align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl")}>{description}</p>
      )}
    </div>
  );
};

export default SectionHeader;
