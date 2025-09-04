import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CheckboxListProps {
  options: string[] | { value: string; count: number }[];
  selected: string[];
  onChange: (value: string, checked: boolean) => void;
  label?: string;
  maxHeight?: string;
  renderOption?: (option: string | { value: string; count: number }) => React.ReactNode;
  gridCols?: number;
  containerClassName?: string;
}

export function CheckboxList({
  options,
  selected,
  onChange,
  label,
  maxHeight = "max-h-32",
  renderOption,
  gridCols,
  containerClassName,
}: CheckboxListProps) {
  const containerClasses = gridCols
    ? `grid grid-cols-${gridCols} gap-2 ${maxHeight} overflow-y-auto`
    : `space-y-2 ${maxHeight} overflow-y-auto ${containerClassName || ""}`;

  return (
    <div>
      {label && <div className="text-base font-medium mb-3 block">{label}</div>}
      <div className={containerClasses}>
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value;
          const isSelected = selected.includes(value);

          return (
            <div
              key={value}
              className={cn(
                "flex items-center space-x-2 p-2 rounded transition-all duration-200",
                isSelected
                  ? "bg-primary-100 text-primary-800"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/40",
                isSelected ? "hover:bg-primary-50" : "hover:bg-muted/40",
              )}
            >
              <Checkbox
                id={`checkbox-${value}`}
                checked={isSelected}
                onCheckedChange={(checked) => onChange(value, checked as boolean)}
                className="data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
              />
              <Label htmlFor={`checkbox-${value}`} className="text-sm flex-1 cursor-pointer">
                {renderOption ? renderOption(option) : (
                  typeof option === 'string' ? option : `${option.value} (${option.count})`
                )}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}