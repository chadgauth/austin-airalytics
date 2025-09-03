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

  // Determine if to use logarithmic scaling based on range width and min > 0
  const isLogarithmic = min > 0 && (max - min) > 100;

  let sliderMin: number;
  let sliderMax: number;
  let sliderMinProp: number;
  let sliderMaxProp: number;
  let onValueChangeHandler: (value: number[]) => void;

  if (isLogarithmic) {
    // Logarithmic scaling calculations
    const logMin = Math.log10(min);
    const logMax = Math.log10(max);
    const logRange = logMax - logMin;

    // Convert actual values to slider positions (0-100)
    sliderMin = minValue <= min ? 0 : Math.max(0, ((Math.log10(minValue) - logMin) / logRange) * 100);
    sliderMax = maxValue >= max ? 100 : Math.min(100, ((Math.log10(maxValue) - logMin) / logRange) * 100);

    sliderMinProp = 0;
    sliderMaxProp = 100;

    // Convert slider positions back to actual values
    const actualValueFromSlider = (sliderValue: number) => {
      if (sliderValue === 0) return min;
      if (sliderValue === 100) return max;
      return Math.round(10 ** (logMin + logRange * (sliderValue / 100)));
    };

    onValueChangeHandler = (value: number[]) => {
      const [newSliderMin, newSliderMax] = value;
      const newMin = actualValueFromSlider(newSliderMin);
      const newMax = actualValueFromSlider(newSliderMax);
      onChange(newMin, newMax);
    };
  } else {
    // Linear scaling
    sliderMin = minValue;
    sliderMax = maxValue;
    sliderMinProp = min;
    sliderMaxProp = max;

    onValueChangeHandler = (value: number[]) => {
      const [newMin, newMax] = value;
      onChange(newMin, newMax);
    };
  }

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
          value={[sliderMin, sliderMax]}
          onValueChange={onValueChangeHandler}
          min={sliderMinProp}
          max={sliderMaxProp}
          step={isLogarithmic ? 1 : step}
          className="w-full"
          volumes={volumes}
        />
        <div className="flex gap-2 mt-1">
          <div className="flex-1 text-center">
            <Input
              id={`min-${label}`}
              type="number"
              value={minValue}
              onChange={(e) => onMinChange(e.target.value)}
              step={step}
              min={min}
              max={max}
              className="h-6 mx-auto w-full text-xs"
            />
            <Label htmlFor={`min-${label}`} className="text-xs block mt-1">
              Min ({format(minValue)})
            </Label>
          </div>
          <div className="flex-1 text-center">
            <Input
              id={`max-${label}`}
              type="number"
              value={maxValue}
              onChange={(e) => onMaxChange(e.target.value)}
              step={step}
              min={min}
              max={max}
              className="h-6 mx-auto w-full text-xs"
            />
            <Label htmlFor={`max-${label}`} className="text-xs block mt-1">
              Max ({format(maxValue)})
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}