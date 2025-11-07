import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface CTAAction {
  label: string;
  href: string;
  variant?: "default" | "outline" | "secondary";
}

interface CTASectionProps {
  title: string;
  description?: string;
  primaryAction: CTAAction;
  secondaryAction?: CTAAction;
  className?: string;
  children?: ReactNode;
}

const CTASection = ({ title, description, primaryAction, secondaryAction, className, children }: CTASectionProps) => (
  <section className={cn("rounded-3xl bg-primary text-primary-foreground p-10 text-center space-y-6", className)}>
    <h2 className="text-3xl font-semibold">{title}</h2>
    {description && <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">{description}</p>}
    {children}
    <div className="flex flex-wrap justify-center gap-4">
      <Button asChild size="lg" variant={primaryAction.variant ?? "secondary"}>
        <Link to={primaryAction.href}>{primaryAction.label}</Link>
      </Button>
      {secondaryAction && (
        <Button asChild size="lg" variant={secondaryAction.variant ?? "outline"}>
          <Link to={secondaryAction.href}>{secondaryAction.label}</Link>
        </Button>
      )}
    </div>
  </section>
);

export default CTASection;
