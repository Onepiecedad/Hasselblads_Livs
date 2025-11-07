import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

const SectionHeader = ({ eyebrow, title, description, align = "center", className }: SectionHeaderProps) => (
  <div className={cn("mb-10", align === "center" ? "text-center" : "text-left", className)}>
    {eyebrow && (
      <span className="mb-3 block uppercase tracking-[0.2em] text-xs text-muted-foreground">
        {eyebrow}
      </span>
    )}
    <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
    {description && (
      <p className={cn("mt-4 text-lg text-muted-foreground", align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl")}>{description}</p>
    )}
  </div>
);

export default SectionHeader;
