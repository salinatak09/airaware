"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Eye,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function WeatherWidget({ className }: { className?: string }) {
  const weatherMetrics = [
    { label: "Temperature", value: "24°C", icon: Thermometer, sub: "Feels like 25°C", color: "text-amber-700 bg-amber-100" },
    { label: "Humidity", value: "54%", icon: Droplets, sub: "Optimal range", color: "text-sky-700 bg-sky-100" },
    { label: "Wind & Direction", value: "8 km/h NW", icon: Wind, sub: "Low dispersion speed", color: "text-emerald-700 bg-emerald-100" },
    { label: "Atmospheric Visibility", value: "2.8 km", icon: Eye, sub: "Hazy smog horizon", color: "text-purple-700 bg-purple-100" },
  ];

  return (
    <Card className={cn("p-6 bg-white border-2 border-brand-forest-700/10 shadow-card", className)}>
      <div className="flex items-center justify-between pb-3 border-b border-brand-mint-100">
        <div>
          <h3 className="text-base font-bold text-brand-forest-900">Local Weather & Dispersion</h3>
          <p className="text-xs text-brand-forest-700/60 mt-0.5">
            Meteorological factors influencing surface particulate trapping
          </p>
        </div>
        <span className="rounded-full bg-brand-sky px-2.5 py-0.5 text-[10px] font-bold text-[#0c4a6e]">
          Hazy Sunshine
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {weatherMetrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="rounded-2xl bg-[#F7FAF7] p-3.5 border border-brand-mint-200/80 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-brand-forest-700/70">{m.label}</span>
                <div className={cn("flex h-6 w-6 items-center justify-center rounded-lg", m.color)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>

              <span className="text-xl font-black text-brand-forest-900 block mt-2">{m.value}</span>
              <span className="text-[10px] font-medium text-brand-forest-700/60 block mt-0.5">
                {m.sub}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
