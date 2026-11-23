import * as React from "react";
import { cn } from "@/lib/utils";
import { getAqiTheme } from "@/lib/colors";

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: "mint" | "forest" | "sky" | "lavender" | "peach" | "yellow";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  variant = "mint",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const getVariantBg = () => {
    switch (variant) {
      case "forest":
        return "bg-brand-forest";
      case "sky":
        return "bg-brand-sky-400";
      case "lavender":
        return "bg-brand-lavender-400";
      case "peach":
        return "bg-brand-peach-400";
      case "yellow":
        return "bg-brand-yellow-400";
      default:
        return "bg-brand-mint";
    }
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || showValue) && (
        <div className="flex justify-between text-xs font-semibold text-brand-forest-800">
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="h-3 w-full overflow-hidden rounded-full bg-brand-forest-700/10 p-0.5">
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", getVariantBg())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Strict AQI Spectrum Indicator showing the 6 regulatory AQI segments
 * with a dynamic marker showing exactly where current AQI falls.
 */
export function AqiSpectrumBar({ aqi, className }: { aqi: number; className?: string }) {
  // Clamp aqi to max 400 for proportional positioning
  const percentage = Math.min(100, Math.max(0, (Math.min(aqi, 400) / 400) * 100));
  const currentTheme = getAqiTheme(aqi);

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex items-center justify-between text-xs font-bold text-brand-forest-800">
        <span>AQI Spectrum Indicator</span>
        <span className="font-extrabold" style={{ color: currentTheme.colorHex }}>
          Current: {aqi} ({currentTheme.label})
        </span>
      </div>

      {/* Spectrum Bar with 6 segments */}
      <div className="relative pt-2">
        {/* Floating Marker */}
        <div
          className="absolute -top-1 -translate-x-1/2 transition-all duration-300"
          style={{ left: `${percentage}%` }}
        >
          <div
            className="h-4 w-4 rounded-full border-2 border-white shadow-md"
            style={{ backgroundColor: currentTheme.colorHex }}
          />
        </div>

        {/* 6 colored spectrum blocks */}
        <div className="grid h-3 w-full grid-cols-6 gap-1 overflow-hidden rounded-full">
          <div className="bg-[#78D6B0] rounded-l-full" title="Good (0-50)" />
          <div className="bg-[#FFE58A]" title="Moderate (51-100)" />
          <div className="bg-[#FB923C]" title="Sensitive (101-150)" />
          <div className="bg-[#EF4444]" title="Unhealthy (151-200)" />
          <div className="bg-[#A855F7]" title="Very Unhealthy (201-300)" />
          <div className="bg-[#881337] rounded-r-full" title="Hazardous (301+)" />
        </div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-[10px] font-semibold text-brand-forest-700/60 pt-0.5">
        <span>0 Good</span>
        <span>50</span>
        <span>100</span>
        <span>150</span>
        <span>200</span>
        <span>300+ Haz</span>
      </div>
    </div>
  );
}
