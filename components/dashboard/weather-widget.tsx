"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import {
  Thermometer,
  Droplets,
  Wind,
  Eye,
} from "lucide-react";
import { WeatherSummary } from "@/types/aqi";
import { cn } from "@/lib/utils";

export interface WeatherWidgetProps {
  weather?: WeatherSummary;
  className?: string;
}

export function WeatherWidget({ weather, className }: WeatherWidgetProps) {
  const temp = weather ? `${weather.temperatureC}°C` : "24°C";
  const apparentTemp = weather ? `Feels like ${weather.apparentTemperatureC}°C` : "Feels like 25°C";
  const humidity = weather ? `${weather.relativeHumidityPercent}%` : "54%";
  const humiditySub = weather?.relativeHumidityPercent && weather.relativeHumidityPercent > 70
    ? "High moisture (Haze driver)"
    : "Comfortable range";

  const wind = weather
    ? `${weather.windSpeedKmh} km/h ${weather.windDirectionCompass}`
    : "8 km/h NW";
  const windSub = weather?.dispersionIndex === "poor"
    ? "Low dispersion (Inversion risk)"
    : weather?.dispersionIndex === "favorable"
    ? "Good ventilation"
    : "Moderate dispersion";

  const desc = weather?.weatherDescription || "Hazy Sunshine";
  const dispersionNote = weather?.dispersionNote ||
    "Calm winds and low thermal mixing trap fine particulates near ground level.";

  const weatherMetrics = [
    {
      label: "Temperature",
      value: temp,
      icon: Thermometer,
      sub: apparentTemp,
      color: "text-amber-700 bg-amber-100",
    },
    {
      label: "Relative Humidity",
      value: humidity,
      icon: Droplets,
      sub: humiditySub,
      color: "text-sky-700 bg-sky-100",
    },
    {
      label: "Surface Wind",
      value: wind,
      icon: Wind,
      sub: windSub,
      color: "text-emerald-700 bg-emerald-100",
    },
    {
      label: "Dispersion Rating",
      value: weather ? weather.dispersionIndex.toUpperCase() : "MODERATE",
      icon: Eye,
      sub: "Boundary layer ventilation",
      color: "text-purple-700 bg-purple-100",
    },
  ];

  return (
    <Card className={cn("p-6 bg-white border-2 border-brand-forest-700/10 shadow-card", className)}>
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-brand-mint-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-brand-forest-900">Local Weather & Atmospheric Dispersion</h3>
          <p className="text-xs text-brand-forest-700/60 mt-0.5">
            {dispersionNote}
          </p>
        </div>
        <span className="rounded-full bg-brand-sky px-2.5 py-0.5 text-[10px] font-bold text-[#0c4a6e]">
          {desc}
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
              <span className="text-[10px] font-medium text-brand-forest-700/60 block mt-0.5 truncate">
                {m.sub}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
