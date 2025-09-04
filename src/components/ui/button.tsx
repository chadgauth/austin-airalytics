import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-base hover:shadow-lg hover:bg-neutral-400 active:scale-[0.98] hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-white shadow-base hover:shadow-lg hover:bg-red-600 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 active:scale-[0.98] hover:-translate-y-0.5",
        outline:
          "border border-neutral-200 bg-background shadow-sm hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700 dark:bg-neutral-900/50 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:border-neutral-600",
        secondary:
          "bg-secondary text-secondary-foreground shadow-base hover:shadow-md hover:bg-secondary-600 active:scale-[0.98]",
        ghost:
          "hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-neutral-600",
        gradient:
          "bg-gradient-to-r from-neutral-500 to-neutral-600 text-white shadow-lg hover:shadow-xl hover:from-neutral-400 hover:to-neutral-500 active:scale-[0.98] hover:-translate-y-0.5",
        glass:
          "glass text-foreground hover:bg-white/20 dark:glass-dark dark:text-neutral-100 hover:shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-12 rounded-lg px-6 has-[>svg]:px-4 text-base",
        xl: "h-14 rounded-lg px-8 has-[>svg]:px-5 text-lg",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
