import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface StepsProps {
  steps: StepItem[];
  className?: string;
}

const Steps = ({ steps, className }: StepsProps) => (
  <div className={cn("grid gap-6 md:grid-cols-2", className)}>
    {steps.map((step) => (
      <div key={step.title} className="flex gap-4 rounded-3xl border border-border/60 bg-card p-6">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <step.icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{step.title}</h3>
          <p className="text-muted-foreground leading-relaxed">{step.description}</p>
        </div>
      </div>
    ))}
  </div>
);

export default Steps;
