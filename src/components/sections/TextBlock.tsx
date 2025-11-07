import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TextBlockProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

const TextBlock = ({ title, children, className }: TextBlockProps) => (
  <div className={cn("rounded-3xl bg-muted/30 p-6 md:p-10", className)}>
    {title && <h3 className="text-2xl font-semibold mb-4">{title}</h3>}
    <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">{children}</div>
  </div>
);

export default TextBlock;
