"use client";

import * as React from "react";
import { AlertTriangle, ShieldAlert, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SevereAqiBannerProps {
  aqi: number;
  cityName?: string;
  onDismiss?: () => void;
  className?: string;
}

export function SevereAqiBanner({
  aqi,
  cityName = "Central Delhi",
  onDismiss,
  className,
}: SevereAqiBannerProps) {
  const [dismissed, setDismissed] = React.useState(false);

  // Severe alert threshold is AQI >= 150
  if (aqi < 150 || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      className={cn(
        "relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border-2 border-red-300 bg-[#FEF2F2] p-4 text-red-950 shadow-soft animate-in fade-in slide-in-from-top-2",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase text-white tracking-wider">
              High Smog Alert
            </span>
            <span className="text-xs font-bold text-red-900">
              {cityName} AQI: {aqi} (Unhealthy)
            </span>
          </div>
          <p className="mt-1 text-xs text-red-900/90 leading-relaxed">
            Surface particulate inversion is trapping vehicle and biomass exhaust. Children and seniors should wear N95
            masks outdoors and keep residential windows sealed.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pl-12 sm:pl-0">
        <Link href="/my-day">
          <Button size="sm" variant="forest" className="text-xs font-bold gap-1 bg-red-800 hover:bg-red-900 text-white border-none shadow-xs">
            <span>Safe Windows</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-lg p-1.5 text-red-800/70 hover:text-red-950 hover:bg-red-200/50 transition-colors"
          aria-label="Dismiss smog alert"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
