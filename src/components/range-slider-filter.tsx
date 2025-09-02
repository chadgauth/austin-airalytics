import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface RangeSliderFilterProps {
  label: string;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  min: number;
  max: number;
  step: number;
  formatValue?: (value: number) => string;
  volumes?: number[];
}

export function RangeSliderFilter({
  label,
  minValue,
  maxValue,
  onChange,
  onMinChange,
  onMaxChange,
  min,
  max,
  step,
  formatValue,
  volumes,
}: RangeSliderFilterProps) {
  const format = formatValue || ((v: number) => v.toString());

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-sm">{label}</Label>
        <span className="text-xs text-muted-foreground">
          {format(minValue)} - {format(maxValue)}
        </span>
      </div>
      <div className="px-2 pt-6">
        <Slider
          value={[minValue, maxValue]}
          onValueChange={(value: number[]) => {
            const [newMin, newMax] = value;
            onChange(newMin, newMax);
          }}
          min={min}
          max={max}
          step={step}
          className="w-full"
          volumes={volumes}
        />
        <div className="flex gap-2 mt-1">
          <div className="flex-1 text-center">
            <Input
              id={`min-${label}`}
              type="number"
              value={format(minValue)}
              onChange={(e) => onMinChange(e.target.value)}
              step={step}
              min={min}
              max={max}
              className="h-6 mx-auto w-full text-xs"
            />
            <Label htmlFor={`min-${label}`} className="text-xs block mt-1">
              Min
            </Label>
          </div>
          <div className="flex-1 text-center">
            <Input
              id={`max-${label}`}
              type="number"
              value={format(maxValue)}
              onChange={(e) => onMaxChange(e.target.value)}
              step={step}
              min={min}
              max={max}
              className="h-6 mx-auto w-full text-xs"
            />
            <Label htmlFor={`max-${label}`} className="text-xs block mt-1">
              Max
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}