import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "gradient";
}

const PremiumInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const variants = {
      default: "border-surface-hover focus:border-snapchat-yellow bg-surface",
      gradient: "border-transparent bg-snapchat-yellow/10 focus:shadow-glow/20",
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-snapchat-yellow/50 focus:ring-offset-2 focus:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
PremiumInput.displayName = "PremiumInput";

export { PremiumInput };