"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, SunMedium } from "lucide-react";
import { getAqiTheme } from "@/lib/colors";
import { HourlyForecastItem } from "@/types/aqi";
import { cn } from "@/lib/utils";

interface HourlyPoint {
  time: string;
  aqi: number;
  pm25: number;
  label: string;
}

const DEFAULT_HOURLY_DATA: HourlyPoint[] = [
  { time: "06:00 AM", aqi: 215, pm25: 120, label: "Peak Inversion" },
  { time: "08:00 AM", aqi: 195, pm25: 105, label: "Rush Hour Smog" },
  { time: "10:00 AM", aqi: 185, pm25: 95, label: "Morning Haze" },
  { time: "12:00 PM", aqi: 135, pm25: 65, label: "Improving" },
  { time: "02:00 PM", aqi: 75, pm25: 35, label: "Best Window" },
  { time: "04:00 PM", aqi: 90, pm25: 42, label: "Safe Play Window" },
  { time: "06:00 PM", aqi: 165, pm25: 80, label: "Evening Traffic" },
  { time: "08:00 PM", aqi: 190, pm25: 98, label: "Night Smog" },
  { time: "10:00 PM", aqi: 205, pm25: 110, label: "Thermal Trap" },
];

function CustomChartTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data: HourlyPoint = payload[0].payload;
    const theme = getAqiTheme(data.aqi);

    return (
      <div className="rounded-2xl border-2 border-brand-mint-300 bg-white p-3 shadow-floating text-left">
        <div className="flex items-center justify-between gap-3 text-xs font-bold text-brand-forest-900">
          <span>{data.time}</span>
          <span
            className="rounded px-1.5 py-0.2 text-[10px] font-extrabold uppercase"
            style={{ backgroundColor: theme.colorHex + "25", color: theme.colorHex }}
          >
            {theme.label}
          </span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="text-2xl font-black text-brand-forest-900">{data.aqi}</span>
          <span className="text-xs font-bold text-brand-forest-700/60">NAQI</span>
        </div>
        <div className="mt-1 text-[11px] text-brand-forest-800/80">
          <span>PM2.5: <strong>{data.pm25} µg/m³</strong></span>
          {data.label && <span className="block text-brand-forest-700/60 mt-0.5">{data.label}</span>}
        </div>
      </div>
    );
  }
  return null;
}

export interface HourlyAqiChartProps {
  hourly?: HourlyForecastItem[];
  className?: string;
}

export function HourlyAqiChart({ hourly, className }: HourlyAqiChartProps) {
  // Convert API forecast data into chart format if provided
  const chartData: HourlyPoint[] = useMemo(() => {
    if (!hourly || hourly.length === 0) {
      return DEFAULT_HOURLY_DATA;
    }

    // Take next 12-24 hours sampled every 2 hours
    const sampled = hourly.filter((_, idx) => idx % 2 === 0).slice(0, 12);
    return sampled.map((item) => {
      let formattedTime = item.time;
      try {
        const d = new Date(item.time);
        formattedTime = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } catch {
        // fallback
      }

      return {
        time: formattedTime,
        aqi: item.indianAqi,
        pm25: item.pm25,
        label: item.indianCategoryLabel,
      };
    });
  }, [hourly]);

  // Find lowest AQI point as safe window
  const safestPoint = [...chartData].sort((a, b) => a.aqi - b.aqi)[0] || chartData[0];

  return (
    <Card className={cn("p-6 bg-white border-2 border-brand-forest-700/10 shadow-card", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-brand-mint-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-brand-forest-900">Diurnal Hourly Forecast</h3>
            <span className="rounded-full bg-brand-sky px-2 py-0.5 text-[10px] font-bold text-[#0c4a6e]">
              24-Hour Horizon
            </span>
          </div>
          <p className="text-xs text-brand-forest-700/60 mt-0.5">
            Modelled hourly particulate trajectory reflecting ground temperature mixing
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="mint" className="text-xs py-1 px-3 gap-1.5 font-bold shadow-xs">
            <SunMedium className="h-3.5 w-3.5 text-emerald-800" />
            <span>Safest Window: {safestPoint.time} ({safestPoint.aqi} NAQI)</span>
          </Badge>
        </div>
      </div>

      <div className="mt-4 h-64 w-full min-w-0" role="region" aria-label="Hourly air quality forecast chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="hourlyAqiFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#78D6B0" stopOpacity={0.6} />
                <stop offset="50%" stopColor="#FFE58A" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F7FAF7" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#175C48", fontWeight: 600 }}
              interval="preserveStartEnd"
              minTickGap={24}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#64748B" }}
              domain={[0, (dataMax: number) => Math.max(300, Math.ceil(dataMax / 50) * 50)]}
            />
            <Tooltip content={<CustomChartTooltip />} />

            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#175C48"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#hourlyAqiFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-brand-mint-100 flex flex-wrap items-center justify-between text-xs text-brand-forest-700/60 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#10b981]" />
            <span>Good (0-50)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#eab308]" />
            <span>Moderate (101-200)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
            <span>Poor (201+)</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>Updated via Open-Meteo CAMS Ensemble</span>
        </div>
      </div>
    </Card>
  );
}
