"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, CloudFog, CloudDrizzle, Wind, ArrowRight } from "lucide-react";
import { getAqiTheme } from "@/lib/colors";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ForecastDay {
  day: string;
  date: string;
  minAqi: number;
  maxAqi: number;
  dominantCategory: string;
  condition: string;
  icon: React.ElementType;
}

const FORECAST_DAYS: ForecastDay[] = [
  { day: "Tomorrow", date: "Tue, Nov 24", minAqi: 75, maxAqi: 175, dominantCategory: "Unhealthy", condition: "Dense Fog", icon: CloudFog },
  { day: "Wednesday", date: "Wed, Nov 25", minAqi: 65, maxAqi: 155, dominantCategory: "Sensitive", condition: "Breezy Smog", icon: Wind },
  { day: "Thursday", date: "Thu, Nov 26", minAqi: 50, maxAqi: 130, dominantCategory: "Sensitive", condition: "Mild Sunshine", icon: Sun },
  { day: "Friday", date: "Fri, Nov 27", minAqi: 85, maxAqi: 195, dominantCategory: "Unhealthy", condition: "Cold Inversion", icon: CloudFog },
  { day: "Saturday", date: "Sat, Nov 28", minAqi: 60, maxAqi: 140, dominantCategory: "Sensitive", condition: "Weekend Haze", icon: Sun },
];

export function ForecastPreview({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6 bg-white border-2 border-brand-forest-700/10 shadow-card", className)}>
      <div className="flex items-center justify-between pb-4 border-b border-brand-mint-100">
        <div>
          <h3 className="text-base font-bold text-brand-forest-900">5-Day Air Quality Outlook</h3>
          <p className="text-xs text-brand-forest-700/60 mt-0.5">
            Predictive modeling based on wind patterns and temperature inversions
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

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {FORECAST_DAYS.map((item) => {
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
                <div className="my-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-xs mx-auto text-brand-forest-800">
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-lg font-black" style={{ color: theme.colorHex }}>
                    {item.maxAqi}
                  </span>
                  <span className="text-[10px] text-brand-forest-700/60 font-semibold">
                    / {item.minAqi}
                  </span>
                </div>
                <span
                  className="mt-1 inline-block rounded px-1.5 py-0.2 text-[9px] font-extrabold uppercase"
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
