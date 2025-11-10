import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CTAButtonsProps {
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  className?: string;
}

const hoverMotionClass = "transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0";

const CTAButtons = ({ primary, secondary, className }: CTAButtonsProps) => (
  <div className={cn("flex flex-wrap gap-4", className)}>
    <Button asChild size="lg" className={hoverMotionClass}>
      <Link to={primary.href}>{primary.label}</Link>
    </Button>
    {secondary && (
      <Button asChild size="lg" variant="outline" className={hoverMotionClass}>
        <Link to={secondary.href}>{secondary.label}</Link>
      </Button>
    )}
  </div>
);

export default CTAButtons;
