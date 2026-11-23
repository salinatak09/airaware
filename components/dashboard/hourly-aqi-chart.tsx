"use client";

import * as React from "react";
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
import { cn } from "@/lib/utils";

interface HourlyPoint {
  time: string;
  aqi: number;
  pm25: number;
  label: string;
}

const HOURLY_DATA: HourlyPoint[] = [
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
          <span className="text-xs font-bold text-brand-forest-700/60">AQI</span>
        </div>
        <div className="mt-1 text-[11px] text-brand-forest-800/80">
          <span>PM2.5: <strong>{data.pm25} µg/m³</strong></span>
          <span className="block text-brand-forest-700/60 mt-0.5">{data.label}</span>
        </div>
      </div>
    );
  }
  return null;
}

export function HourlyAqiChart({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6 bg-white border-2 border-brand-forest-700/10 shadow-card", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-brand-mint-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-brand-forest-900">24-Hour Diurnal AQI Curve</h3>
            <span className="rounded-full bg-brand-mint-100 px-2 py-0.5 text-[9px] font-extrabold text-brand-forest-900 uppercase">
              Demo Simulation
            </span>
          </div>
          <p className="text-xs text-brand-forest-700/60 mt-0.5">
            Notice how ground inversion peaks at dawn/dusk, while solar heating disperses smog at 2:00 PM.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="mint" className="text-[10px] font-bold gap-1">
            <SunMedium className="h-3 w-3 text-emerald-700" />
            <span>Optimal Window: 2 PM – 4:30 PM</span>
          </Badge>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={HOURLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6} />
                <stop offset="50%" stopColor="#FFE58A" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#78D6B0" stopOpacity={0.15} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
              tick={{ fill: "#175C48", fontSize: 10, fontWeight: 600 }}
            />
            <YAxis
              domain={[0, 250]}
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
              tick={{ fill: "#175C48", fontSize: 10, fontWeight: 600 }}
            />
            <Tooltip content={<CustomChartTooltip />} />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#175C48"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#aqiAreaGradient)"
              activeDot={{ r: 6, fill: "#175C48", stroke: "#78D6B0", strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-brand-mint-100 flex flex-wrap items-center justify-between text-[11px] text-brand-forest-700/70 font-semibold gap-2">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span>Morning Smog Peak (6-9 AM)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>Afternoon Dispersion Dip (1-4 PM)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
          <span>Evening Commute Rise (6-9 PM)</span>
        </span>
      </div>
    </Card>
  );
}
