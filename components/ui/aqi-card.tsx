import * as React from "react";
import { Wind, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { getAqiTheme } from "@/lib/colors";
import { cn } from "@/lib/utils";

export interface AqiCardProps {
  aqi: number;
  cityName?: string;
  stationName?: string;
  pm25?: number;
  pm10?: number;
  updatedAt?: string;
  className?: string;
}

export function AqiCard({
  aqi,
  cityName = "Current Location",
  stationName = "Local Station",
  pm25 = 38.5,
  pm10 = 74.2,
  updatedAt = "Just now",
  className,
}: AqiCardProps) {
  const theme = getAqiTheme(aqi);

  const getStatusIcon = () => {
    switch (theme.category) {
      case "good":
        return <CheckCircle2 className="h-6 w-6 text-[#175C48]" />;
      case "moderate":
        return <Sparkles className="h-6 w-6 text-[#854D0E]" />;
      case "sensitive":
        return <AlertTriangle className="h-6 w-6 text-[#9A3412]" />;
      case "unhealthy":
        return <ShieldAlert className="h-6 w-6 text-[#991B1B]" />;
      case "veryUnhealthy":
      case "hazardous":
        return <AlertOctagon className="h-6 w-6 text-white" />;
      default:
        return <Wind className="h-6 w-6" />;
    }
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-2 shadow-soft",
        theme.borderClass,
        className
      )}
    >
      {/* Top Banner with dynamic severity background */}
      <div className={cn("p-6 sm:p-8", theme.bgClass)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold uppercase tracking-wider text-brand-forest-800/70">
                {cityName}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-forest-700/30" />
              <span className="text-xs text-brand-forest-800/60">{stationName}</span>
            </div>
            <h2 className="mt-1 text-2xl font-extrabold text-brand-forest-900 sm:text-3xl">
              Air Quality Index
            </h2>
          </div>

          <Badge
            className={cn("px-4 py-1.5 text-xs font-bold uppercase", theme.badgeClass)}
            icon={getStatusIcon()}
          >
            {theme.label}
          </Badge>
        </div>

        {/* Hero AQI Metric Display */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span
              className={cn("text-6xl sm:text-7xl font-black tracking-tight", theme.textClass)}
            >
              {aqi}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase text-brand-forest-800/60">AQI Score</span>
              <span className="text-xs font-medium text-brand-forest-800/50">Scale: 0 - 500</span>
            </div>
          </div>

          {/* Quick family advisory box */}
          <div className="max-w-md rounded-2xl bg-white/90 p-4 shadow-sm backdrop-blur-sm">
            <p className="text-xs font-bold uppercase text-brand-forest-800">Family Advisory</p>
            <p className="mt-1 text-sm font-medium text-brand-forest-900/90 leading-snug">
              {theme.actionGuidance}
            </p>
          </div>
        </div>
      </div>

      {/* Pollutants Breakdown Bar */}
      <CardContent className="bg-white p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl bg-[#F7FAF7] p-3 text-center border border-brand-mint-100">
            <span className="text-[11px] font-semibold text-brand-forest-700/70">PM2.5</span>
            <p className="text-lg font-bold text-brand-forest-900">{pm25} <span className="text-xs font-normal opacity-70">µg/m³</span></p>
          </div>
          <div className="rounded-2xl bg-[#F7FAF7] p-3 text-center border border-brand-mint-100">
            <span className="text-[11px] font-semibold text-brand-forest-700/70">PM10</span>
            <p className="text-lg font-bold text-brand-forest-900">{pm10} <span className="text-xs font-normal opacity-70">µg/m³</span></p>
          </div>
          <div className="rounded-2xl bg-[#F7FAF7] p-3 text-center border border-brand-mint-100">
            <span className="text-[11px] font-semibold text-brand-forest-700/70">Status</span>
            <p className="text-lg font-bold capitalize text-brand-forest-900">{theme.category}</p>
          </div>
          <div className="rounded-2xl bg-[#F7FAF7] p-3 text-center border border-brand-mint-100">
            <span className="text-[11px] font-semibold text-brand-forest-700/70">Updated</span>
            <p className="text-lg font-bold text-brand-forest-900">{updatedAt}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
