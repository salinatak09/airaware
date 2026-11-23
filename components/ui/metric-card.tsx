import * as React from "react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  variant?: "mint" | "cream" | "sky" | "lavender" | "peach" | "yellow" | "default";
  className?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  icon,
  subtitle,
  trend,
  trendLabel,
  variant = "default",
  className,
}: MetricCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "mint":
        return "bg-[#F0FAF5] border-brand-mint-200 text-brand-forest-900";
      case "cream":
        return "bg-[#FFF8E8] border-brand-cream-300 text-brand-forest-900";
      case "sky":
        return "bg-[#F0F9FF] border-brand-sky-300 text-brand-forest-900";
      case "lavender":
        return "bg-[#F6F4FF] border-brand-lavender-300 text-brand-forest-900";
      case "peach":
        return "bg-[#FFF5EF] border-brand-peach-300 text-brand-forest-900";
      case "yellow":
        return "bg-[#FFFBEA] border-brand-yellow-300 text-brand-forest-900";
      default:
        return "bg-white border-brand-forest-700/10 text-brand-forest-900";
    }
  };

  return (
    <Card
      className={cn(
        "p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover border",
        getVariantStyles(),
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider opacity-70">
          {title}
        </span>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 shadow-xs backdrop-blur-xs">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">{value}</span>
        {unit && <span className="text-sm font-semibold opacity-70">{unit}</span>}
      </div>

      {(subtitle || trendLabel) && (
        <div className="mt-2 flex items-center gap-2 text-xs font-medium opacity-80">
          {trendLabel && (
            <span
              className={cn(
                "rounded px-1.5 py-0.5 font-semibold",
                trend === "up" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
              )}
            >
              {trendLabel}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </Card>
  );
}
