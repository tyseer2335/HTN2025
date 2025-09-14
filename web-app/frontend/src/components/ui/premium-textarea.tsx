import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "gradient";
  showCounter?: boolean;
  maxLength?: number;
}

const PremiumTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = "default", showCounter = false, maxLength, value, ...props }, ref) => {
    const variants = {
      default: "border-surface-hover focus:border-foreground bg-surface",
      gradient: "border-transparent bg-snapchat-yellow/10 focus:shadow-glow/20",
    };

    const characterCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-foreground/50 focus:ring-offset-2 focus:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none",
            variants[variant],
            showCounter && "pb-8",
            className
          )}
          ref={ref}
          maxLength={maxLength}
          value={value}
          {...props}
        />
        {showCounter && (
          <div className="absolute bottom-2 right-3 text-xs text-text-muted">
            {characterCount}
            {maxLength && ` / ${maxLength}`}
          </div>
        )}
      </div>
    );
  }
);
PremiumTextarea.displayName = "PremiumTextarea";

export { PremiumTextarea };