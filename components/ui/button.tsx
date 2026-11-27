import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest-800 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-mint text-brand-forest-900 shadow-sm hover:bg-brand-mint-500 hover:shadow-md",
        forest:
          "bg-brand-forest text-white shadow-sm hover:bg-brand-forest-800 hover:shadow-md",
        cream:
          "bg-brand-cream text-brand-forest-900 border border-brand-cream-300 hover:bg-brand-cream-300",
        sky:
          "bg-brand-sky text-brand-forest-900 hover:bg-brand-sky-400",
        lavender:
          "bg-brand-lavender text-brand-forest-900 hover:bg-brand-lavender-400",
        peach:
          "bg-brand-peach text-brand-forest-900 hover:bg-brand-peach-400",
        soft:
          "bg-brand-mint-50 text-brand-forest-900 border border-brand-mint-200 hover:bg-brand-mint-100",
        outline:
          "border-2 border-brand-forest-700/20 bg-transparent text-brand-forest-900 hover:bg-brand-mint-50 hover:border-brand-mint-400",
        ghost:
          "text-brand-forest-900 hover:bg-brand-forest-50",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600",
      },
      size: {
        default: "min-h-[44px] h-11 px-5 py-2.5",
        sm: "min-h-[38px] h-9 px-3.5 text-xs rounded-xl",
        lg: "min-h-[48px] h-13 px-7 text-base rounded-2xl",
        icon: "min-h-[44px] min-w-[44px] h-11 w-11 rounded-xl",
        pill: "min-h-[44px] h-11 px-6 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-current" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
