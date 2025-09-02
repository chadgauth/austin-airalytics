import * as SliderPrimitive from "@radix-ui/react-slider";
import React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  volumes?: number[];
}

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, volumes, ...props }, ref) => {
  const maxVolume = volumes ? Math.max(...volumes) : 0;

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-6 flex w-full touch-none select-none items-center",
        className,
      )}
      {...props}
    >
        {volumes?.map((volume, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: <fixing this later if needs>
            key={index}
            className="absolute bottom-full bg-blue-500 opacity-90 rounded-sm"
            style={{
              left: `${(index / volumes.length) * 100}%`,
              width: `${100 / volumes.length}%`,
              height: maxVolume > 0 ? `${(volume / maxVolume) * 100}%` : '0%',
              minHeight: '2px',
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
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
