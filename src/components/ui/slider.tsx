import * as SliderPrimitive from "@radix-ui/react-slider";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  volumes?: number[];
  // Range filter specific props
  label?: string;
  minValue?: number;
  maxValue?: number;
  onRangeChange?: (min: number, max: number) => void;
  onMinChange?: (value: string) => void;
  onMaxChange?: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (value: number) => string;
}

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      volumes,
      label,
      minValue,
      maxValue,
      onRangeChange,
      onMinChange,
      onMaxChange,
      min = 0,
      max = 100,
      step = 1,
      formatValue,
      ...props
    },
    ref,
  ) => {
    const maxVolume = volumes ? Math.max(...volumes) : 0;

    // Determine if to use logarithmic scaling based on range width and min > 0
    const isLogarithmic = min > 0 && max - min > 100;

    let sliderMin: number;
    let sliderMax: number;
    let sliderMinProp: number;
    let sliderMaxProp: number;
    let onValueChangeHandler: (value: number[]) => void;

    if (isLogarithmic && minValue !== undefined && maxValue !== undefined) {
      // Logarithmic scaling calculations
      const logMin = Math.log10(min);
      const logMax = Math.log10(max);
      const logRange = logMax - logMin;

      // Convert actual values to slider positions (0-100)
      sliderMin =
        minValue <= min
          ? 0
          : Math.max(0, ((Math.log10(minValue) - logMin) / logRange) * 100);
      sliderMax =
        maxValue >= max
          ? 100
          : Math.min(100, ((Math.log10(maxValue) - logMin) / logRange) * 100);

      sliderMinProp = 0;
      sliderMaxProp = 100;

      // Convert slider positions back to actual values
      const actualValueFromSlider = (sliderValue: number) => {
        if (sliderValue === 0) return min;
        if (sliderValue === 100) return max;
        return Math.round(10 ** (logMin + logRange * (sliderValue / 100)));
      };

      onValueChangeHandler = (value: number[]) => {
        if (!value || !Array.isArray(value) || value.length < 2) return;
        const [newSliderMin, newSliderMax] = value;
        const newMin = actualValueFromSlider(newSliderMin);
        const newMax = actualValueFromSlider(newSliderMax);
        onRangeChange?.(newMin, newMax);
      };
    } else {
      // Linear scaling
      sliderMin = minValue ?? min;
      sliderMax = maxValue ?? max;
      sliderMinProp = min;
      sliderMaxProp = max;

      onValueChangeHandler = (value: number[]) => {
        if (!value || !Array.isArray(value) || value.length < 2) return;
        const [newMin, newMax] = value;
        onRangeChange?.(newMin, newMax);
      };
    }

    const sliderValue = [sliderMin, sliderMax];

    const isRangeFilter =
      label && minValue !== undefined && maxValue !== undefined;

    if (isRangeFilter) {
      return (
        <div className="space-y-1">
          <div className="text-base font-medium pb-3">{label}</div>
            <SliderPrimitive.Root
              ref={ref}
              value={sliderValue}
              onValueChange={onValueChangeHandler}
              min={sliderMinProp}
              max={sliderMaxProp}
              step={isLogarithmic ? 1 : step}
              className={cn(
                "relative h-14 pt-10 flex w-full touch-none select-none items-center",
                className,
              )}
              {...props}
            >
              {volumes?.map((volume, index) => {
                const volumePosition = isLogarithmic
                  ? (index / volumes.length) * 100
                  : min + (index / volumes.length) * (max - min);
                const isSelected = volumePosition >= sliderMin && volumePosition <= sliderMax;
                const gapPx = volumes.length < 50 ? 1 : 0
                return (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: <fixing this later if needs>
                    key={index}
                    className="absolute bottom-full bg-primary-600 rounded-xs"
                    style={{
                      left: `${(index / volumes.length) * 100}%`,
                      width: `calc(${100 / volumes.length}% - ${gapPx}px)`,
                      bottom: 12,
                      height:
                        maxVolume > 0
                          ? `${Math.min((volume / maxVolume) * 80, 80)}%`
                          : "8%",
                      minHeight: "3px",
                      opacity: isSelected ? 0.9 : 0.3,
                    }}
                  />
                );
              })}
              <SliderPrimitive.Track className="relative h-1 w-full grow rounded-full bg-secondary">
                <SliderPrimitive.Range className="absolute h-full bg-primary" />
              </SliderPrimitive.Track>
              <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary bg-background shadow-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50" />
              <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary bg-background shadow-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50" />
            </SliderPrimitive.Root>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id={`min-${label}`}
                  type="number"
                  value={minValue}
                  onChange={(e) => onMinChange?.(e.target.value)}
                  step={step}
                  min={min}
                  max={max}
                  className="h-8 w-full text-sm border-primary-300 focus:border-primary-500"
                />
                <Label
                  htmlFor={`min-${label}`}
                  className="text-xs text-muted-foreground block mb-1"
                >
                  Min
                </Label>
              </div>
              <div className="flex-1">
                <Input
                  id={`max-${label}`}
                  type="number"
                  value={maxValue}
                  onChange={(e) => onMaxChange?.(e.target.value)}
                  step={step}
                  min={min}
                  max={max}
                  className="h-8 w-full text-sm border-primary-300 focus:border-primary-500"
                />
                <Label
                  htmlFor={`max-${label}`}
                  className="text-xs text-muted-foreground block mb-1"
                >
                  Max
                </Label>
              </div>
            </div>
          </div>
      );
    }

    // Original slider for non-range-filter usage
    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-15 flex w-full touch-none select-none items-center",
          className,
        )}
        {...props}
      >
        {volumes?.map((volume, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: <fixing this later if needs>
            key={index}
            className="absolute h-6 bottom-full bg-primary-600 opacity-80 rounded-xs"
            style={{
              left: `${(index / volumes.length) * 100}%`,
              width: `${100 / volumes.length}%`,
              height:
                maxVolume > 0
                  ? `${Math.min((volume / maxVolume) * 60, 60)}%`
                  : "8%",
              minHeight: "2px",
            }}
          />
        ))}
        <SliderPrimitive.Track className="relative h-1 w-full grow rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary bg-background shadow-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50" />
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary bg-background shadow-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    );
  },
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

