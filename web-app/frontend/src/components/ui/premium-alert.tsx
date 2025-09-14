import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-surface border-surface-hover text-text-primary",
        destructive: "border-destructive/50 text-destructive [&>svg]:text-destructive bg-destructive/10",
        success: "border-gradient-start/50 text-gradient-start [&>svg]:text-gradient-start bg-gradient-start/10",
        warning: "border-gradient-end/50 text-gradient-end [&>svg]:text-gradient-end bg-gradient-end/10",
        info: "border-gradient-middle/50 text-gradient-middle [&>svg]:text-gradient-middle bg-gradient-middle/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const PremiumAlert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
PremiumAlert.displayName = "PremiumAlert";

const PremiumAlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
PremiumAlertTitle.displayName = "PremiumAlertTitle";

const PremiumAlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
PremiumAlertDescription.displayName = "PremiumAlertDescription";

export { PremiumAlert, PremiumAlertTitle, PremiumAlertDescription };