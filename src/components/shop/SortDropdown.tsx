import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type SortOption = {
  label: string;
  value: string;
};

interface SortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
}

const SortDropdown = ({ options, value, onChange }: SortDropdownProps) => (
  <div className="w-full sm:w-64">
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label="Sortera produkter">
        <SelectValue placeholder="Sortera" />
      </SelectTrigger>
      <SelectContent align="end">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default SortDropdown;
