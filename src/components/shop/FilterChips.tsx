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
      className={cn("flex items-center gap-3 overflow-x-auto pb-2", className)}
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
              "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              "border-border/70 bg-muted/40 hover:border-primary/60 hover:bg-primary/5",
              isActive && "border-primary bg-primary text-primary-foreground shadow-sm",
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
