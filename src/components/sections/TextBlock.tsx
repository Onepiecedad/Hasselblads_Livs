import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TextBlockProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

const TextBlock = ({ title, children, className }: TextBlockProps) => (
  <div
    className={cn(
      "rounded-3xl border border-white/50 bg-white/80 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/70 md:p-10",
      className,
    )}
  >
    {title && <h3 className="text-2xl font-semibold mb-4">{title}</h3>}
    <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">{children}</div>
  </div>
);

export default TextBlock;
