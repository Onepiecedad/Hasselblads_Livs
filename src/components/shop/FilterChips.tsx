import { cn } from "@/lib/utils";

export type FilterChip = {
  label: string;
  value: string;
};

interface FilterChipsProps {
  chips: FilterChip[];
  activeValue: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  ariaLabel?: string;
}

const FilterChips = ({ chips, activeValue, onChange, className, ariaLabel }: FilterChipsProps) => {
  const handleSelect = (value: string) => {
    onChange(activeValue === value ? null : value);
  };

  return (
    <div
      className={cn("flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-elegant", className)}
      aria-label={ariaLabel}
      role="listbox"
      aria-orientation="horizontal"
    >
      {chips.map((chip) => {
        const isActive = chip.value === activeValue;
        return (
          <button
            key={chip.value}
            type="button"
            role="option"
            aria-selected={isActive}
            onClick={() => handleSelect(chip.value)}
            className={cn(
              "whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
              "bg-transparent border border-border/40 text-foreground/70",
              "hover:border-primary/50 hover:text-primary hover:bg-primary/5",
              isActive && "border-primary/60 bg-primary/10 text-primary shadow-sm",
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
};

export default FilterChips;

