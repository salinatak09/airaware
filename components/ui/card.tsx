import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-3xl border transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-white border-brand-forest-700/10 shadow-card text-brand-forest-900",
        elevated:
          "bg-white border-transparent shadow-card-hover text-brand-forest-900",
        soft:
          "bg-[#F0FAF5] border-brand-mint-200 shadow-soft text-brand-forest-900",
        cream:
          "bg-[#FFF8E8] border-brand-cream-300 shadow-soft text-brand-forest-900",
        sky:
          "bg-[#F0F9FF] border-brand-sky-300 shadow-soft text-brand-forest-900",
        lavender:
          "bg-[#F6F4FF] border-brand-lavender-300 shadow-soft text-brand-forest-900",
        peach:
          "bg-[#FFF5EF] border-brand-peach-300 shadow-soft text-brand-forest-900",
        forest:
          "bg-brand-forest-900 border-transparent text-white shadow-card",
        glass:
          "bg-white/80 backdrop-blur-md border-white/60 shadow-soft text-brand-forest-900",
      },
      interactive: {
        true: "cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 active:translate-y-0",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, interactive, className }))}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 sm:p-7", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg sm:text-xl font-bold tracking-tight text-inherit",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-brand-forest-800/70 leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 sm:p-7 sm:pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 sm:p-7 sm:pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
