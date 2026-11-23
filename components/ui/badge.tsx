import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none border",
  {
    variants: {
      variant: {
        default:
          "bg-brand-mint-100 text-brand-forest-900 border-brand-mint-300",
        forest:
          "bg-brand-forest-900 text-brand-mint-300 border-transparent",
        mint:
          "bg-brand-mint-100 text-brand-forest-900 border-brand-mint-200",
        cream:
          "bg-brand-cream text-brand-forest-900 border-brand-cream-300",
        sky:
          "bg-brand-sky-100 text-[#0c4a6e] border-brand-sky-300",
        lavender:
          "bg-brand-lavender-100 text-[#4c1d95] border-brand-lavender-300",
        peach:
          "bg-brand-peach-100 text-[#7c2d12] border-brand-peach-300",
        yellow:
          "bg-brand-yellow-100 text-[#713f12] border-brand-yellow-300",
        outline:
          "border-brand-forest-700/20 text-brand-forest-900 bg-transparent",

        // Strict AQI Severity Badges
        aqiGood:
          "bg-[#E0F5EB] text-[#175C48] border-[#C1EBD7]",
        aqiModerate:
          "bg-[#FFFBEA] text-[#854D0E] border-[#FFF4C2]",
        aqiSensitive:
          "bg-[#FFF7ED] text-[#9A3412] border-[#FFEDD5]",
        aqiUnhealthy:
          "bg-[#FEF2F2] text-[#991B1B] border-[#FEE2E2]",
        aqiVeryUnhealthy:
          "bg-[#FAF5FF] text-[#6B21A8] border-[#F3E8FF]",
        aqiHazardous:
          "bg-[#FFF1F2] text-[#4C0519] border-[#FFE4E6]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}

export { Badge, badgeVariants };
