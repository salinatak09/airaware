"use client";

import { ElementType } from "react";
import { Card } from "@/components/ui/card";
import { Sun, CloudFog, Wind, ArrowRight } from "lucide-react";
import { getAqiTheme } from "@/lib/colors";
import { DailyForecastSummary } from "@/types/aqi";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DefaultForecastDay {
  day: string;
  date: string;
  minAqi: number;
  maxAqi: number;
  dominantCategory: string;
  condition: string;
  icon: ElementType;
}

const DEFAULT_FORECAST_DAYS: DefaultForecastDay[] = [
  { day: "Tomorrow", date: "Tue, Nov 24", minAqi: 75, maxAqi: 175, dominantCategory: "Moderate", condition: "Dense Fog", icon: CloudFog },
  { day: "Wednesday", date: "Wed, Nov 25", minAqi: 65, maxAqi: 155, dominantCategory: "Moderate", condition: "Breezy Smog", icon: Wind },
  { day: "Thursday", date: "Thu, Nov 26", minAqi: 50, maxAqi: 130, dominantCategory: "Satisfactory", condition: "Mild Sunshine", icon: Sun },
];

export interface ForecastPreviewProps {
  daily?: DailyForecastSummary[];
  className?: string;
}

export function ForecastPreview({ daily, className }: ForecastPreviewProps) {
  return (
    <Card className={cn("p-6 bg-white border-2 border-brand-forest-700/10 shadow-card", className)}>
      <div className="flex items-center justify-between pb-4 border-b border-brand-mint-100">
        <div>
          <h3 className="text-base font-bold text-brand-forest-900">Multi-Day Air Quality Outlook</h3>
          <p className="text-xs text-brand-forest-700/60 mt-0.5">
            Predictive modeling based on wind dispersion patterns and temperature inversions
          </p>
        </div>
        <Link
          href="/explore"
          className="text-xs font-bold text-brand-forest-800 hover:underline flex items-center gap-1"
        >
          <span>City Heatmap</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {daily && daily.length > 0
          ? daily.map((item) => {
              const theme = getAqiTheme(item.maxAqi);
              return (
                <div
                  key={item.date}
                  className="flex flex-col items-center justify-between rounded-2xl bg-[#F7FAF7] p-3.5 border border-brand-mint-200/80 text-center shadow-xs hover:border-brand-mint-400 transition-colors"
                >
                  <div>
                    <span className="text-xs font-black text-brand-forest-900 block">{item.dayName}</span>
                    <span className="text-[10px] text-brand-forest-700/60 block">{item.date}</span>
                  </div>

                  <div className="my-3 flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-xs border border-brand-mint-200">
                      <Sun className="h-5 w-5 text-amber-500" />
                    </div>
                    <span className="text-[11px] font-bold text-brand-forest-800 mt-1.5 block">
                      {item.dominantCategoryLabel}
                    </span>
                  </div>

                  <div className="w-full pt-2 border-t border-brand-mint-200/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-brand-forest-700/60 text-[10px]">Peak/Min</span>
                      <span className="font-extrabold text-brand-forest-900">
                        {item.maxAqi} / {item.minAqi}
                      </span>
                    </div>

                    <span
                      className="mt-2 block w-full rounded-md py-0.5 text-[9px] font-black uppercase tracking-wider"
                      style={{ backgroundColor: theme.colorHex + "20", color: theme.colorHex }}
                    >
                      Best: {item.cleanestWindow.startTime}
                    </span>
                  </div>
                </div>
              );
            })
          : DEFAULT_FORECAST_DAYS.map((item) => {
              const theme = getAqiTheme(item.maxAqi);
              const Icon = item.icon;

              return (
                <div
                  key={item.day}
                  className="flex flex-col items-center justify-between rounded-2xl bg-[#F7FAF7] p-3.5 border border-brand-mint-200/80 text-center shadow-xs hover:border-brand-mint-400 transition-colors"
                >
                  <div>
                    <span className="text-xs font-black text-brand-forest-900 block">{item.day}</span>
                    <span className="text-[10px] text-brand-forest-700/60 block">{item.date}</span>
                  </div>

                  <div className="my-3 flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-xs border border-brand-mint-200">
                      <Icon className="h-5 w-5 text-brand-forest-800" />
                    </div>
                    <span className="text-[11px] font-bold text-brand-forest-800 mt-1.5 block">
                      {item.condition}
                    </span>
                  </div>

                  <div className="w-full pt-2 border-t border-brand-mint-200/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-brand-forest-700/60 text-[10px]">Peak/Min</span>
                      <span className="font-extrabold text-brand-forest-900">
                        {item.maxAqi} / {item.minAqi}
                      </span>
                    </div>

                    <span
                      className="mt-2 block w-full rounded-md py-0.5 text-[9px] font-black uppercase tracking-wider"
                      style={{ backgroundColor: theme.colorHex + "20", color: theme.colorHex }}
                    >
                      {item.dominantCategory}
                    </span>
                  </div>
                </div>
              );
            })}
      </div>
    </Card>
  );
}
