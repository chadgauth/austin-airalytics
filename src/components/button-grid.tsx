import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface ButtonGridProps {
  label: string;
  options: ButtonOption[];
  selected: string[] | Record<string, boolean>;
  onChange: (value: string, checked: boolean) => void;
  className?: string;
}

export function ButtonGrid({
  label,
  options,
  selected,
  onChange,
  className,
}: ButtonGridProps) {
  const columns =
    options.length === 1 ? 1 : options.length === 3 ? 3 : 2;

  return (
    <div className={className}>
      <div className="text-base font-medium mb-3 block">{label}</div>
      <div
        className={cn("grid border border-primary-300 rounded-xl overflow-hidden", {
          "grid-cols-1": columns === 1,
          "grid-cols-2": columns === 2,
          "grid-cols-3": columns === 3,
        })}
      >
        {options.map((option, index) => {
          const isSelected = Array.isArray(selected)
            ? selected.includes(option.value)
            : selected[option.value] || false;
          const isLastInRow = (index + 1) % columns === 0;
          const isInLastRow = index >= options.length - columns;

          return (
            <button
              key={option.value}
              type="button"
              className={cn(
                "cursor-pointer relative w-full p-3 text-center transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-400 focus-visible:ring-offset-1",
                isSelected
                  ? "bg-primary-100 text-primary-800 border-primary-300"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/40",
                !isLastInRow && "border-r border-primary-300",
                !isInLastRow && "border-b border-primary-300",
                isSelected ? "hover:bg-primary-50" : "hover:bg-muted/40",
              )}
              onClick={() => onChange(option.value, !isSelected)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(option.value, !isSelected);
                }
              }}
            >
              <div className="flex flex-col items-center space-y-1">
                {option.icon && (
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors duration-200 ${
                      isSelected
                        ? "bg-primary-600 text-primary-100"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {option.icon}
                  </div>
                )}
                <span
                  className={`text-xs text-center font-medium transition-colors duration-200 ${
                    isSelected ? "" : "text-muted-foreground"
                  }`}
                >
                  {option.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
