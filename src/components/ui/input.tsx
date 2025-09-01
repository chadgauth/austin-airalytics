import { cloneElement, forwardRef, isValidElement } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  children?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, children, ...props }, ref) => {
    const isButton = isValidElement(children) && children.type === "button";

    return (
      <div className="relative">
        {!isButton && children && isValidElement(children) && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {cloneElement(
              children as React.ReactElement<{ className?: string }>,
              {
                className: cn(
                  (children as React.ReactElement<{ className?: string }>).props
                    .className,
                  "w-3.5 h-3.5 text-gray-500",
                ),
              },
            )}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-8 w-full rounded-md bg-gray-100 px-3 py-1.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            !isButton && children && "pl-9",
            isButton && children && "pr-9",
            className,
          )}
          ref={ref}
          {...props}
        />
        {isButton && children && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {children}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
