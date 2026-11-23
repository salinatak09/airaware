"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAqiTheme } from "@/lib/colors";
import { ShieldCheck, Wind, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroAqiGaugeProps {
  aqi: number;
  cityName?: string;
  stationName?: string;
  updatedAt?: string;
  className?: string;
}

export function HeroAqiGauge({
  aqi = 185,
  cityName = "Connaught Place, New Delhi",
  stationName = "CPCB Mandir Marg Station",
  updatedAt = "Just now",
  className,
}: HeroAqiGaugeProps) {
  const theme = getAqiTheme(aqi);

  // Gauge calculation: Arc from -180 deg to 0 deg (or 180 to 360)
  // Max AQI mapped to 400 for proportional sweep
  const clampedAqi = Math.min(400, Math.max(0, aqi));
  const progressRatio = clampedAqi / 400; // 0 to 1
  const needleRotation = -90 + progressRatio * 180; // -90 deg (0 AQI) to +90 deg (400 AQI)

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-2 bg-white shadow-soft transition-all duration-300",
        theme.borderClass,
        className
      )}
    >
      {/* Top Header Strip */}
      <div className={cn("p-6 pb-2 sm:p-7 sm:pb-3", theme.bgClass)}>
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 shadow-xs text-brand-forest-900">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-forest-900">{cityName}</span>
              <span className="text-[10px] text-brand-forest-700/60 block leading-none">
                {stationName} • {updatedAt}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Demo data badge */}
            <span className="rounded-full bg-white/90 border border-brand-forest-700/10 px-2.5 py-0.5 text-[9px] font-black uppercase text-brand-forest-700 tracking-wider">
              Demo Simulation
            </span>
            <Badge className={cn("px-3 py-1 text-xs font-bold uppercase", theme.badgeClass)}>
              {theme.label}
            </Badge>
          </div>
        </div>

        {/* Circular / Semi-Circular Gauge Display */}
        <div className="relative mt-4 flex flex-col items-center justify-center pt-2 pb-0">
          <div className="relative w-64 h-36 sm:w-72 sm:h-40 flex items-center justify-center overflow-hidden">
            {/* SVG Arc Gauge */}
            <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
              <defs>
                {/* 6 regulatory colors gradient */}
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#78D6B0" />        {/* Good 0-50 */}
                  <stop offset="25%" stopColor="#FFE58A" />       {/* Moderate 51-100 */}
                  <stop offset="45%" stopColor="#FB923C" />       {/* Sensitive 101-150 */}
                  <stop offset="65%" stopColor="#EF4444" />       {/* Unhealthy 151-200 */}
                  <stop offset="85%" stopColor="#A855F7" />       {/* Very Unhealthy 201-300 */}
                  <stop offset="100%" stopColor="#881337" />      {/* Hazardous 301+ */}
                </linearGradient>

                <filter id="needleShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Background Track Arc (Radius 80, stroke 14) */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Colored Spectrum Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Dynamic Animated Pointer / Needle */}
              <motion.g
                initial={{ rotate: -90 }}
                animate={{ rotate: needleRotation }}
                transition={{ type: "spring", stiffness: 90, damping: 15 }}
                style={{ originX: "100px", originY: "100px" }}
              >
                {/* Needle Line */}
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="28"
                  stroke="#175C48"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#needleShadow)"
                />
                {/* Needle Tip Arrow */}
                <polygon points="100,24 96,32 104,32" fill="#175C48" />
              </motion.g>

              {/* Central Pivot Hub */}
              <circle cx="100" cy="100" r="10" fill="#175C48" />
              <circle cx="100" cy="100" r="5" fill="#FFFFFF" />
            </svg>

            {/* Scale Min / Max Tick Labels */}
            <div className="absolute bottom-1 left-2 text-[10px] font-bold text-brand-forest-700/60">
              0 Good
            </div>
            <div className="absolute bottom-1 right-2 text-[10px] font-bold text-brand-forest-700/60">
              400+ Haz
            </div>
          </div>

          {/* Large Hero Score & Category Text */}
          <div className="text-center mt-1">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className={cn("text-6xl sm:text-7xl font-black tracking-tight", theme.textClass)}>
                {aqi}
              </span>
              <span className="text-xs font-extrabold uppercase text-brand-forest-700/60">
                AQI
              </span>
            </div>
            <p className="text-sm sm:text-base font-extrabold text-brand-forest-900 mt-0.5">
              Air Quality: <span style={{ color: theme.colorHex }}>{theme.label}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Advisory Banner Bottom */}
      <div className="p-5 sm:p-6 bg-white border-t border-brand-mint-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFF8E8] text-amber-800 border border-brand-cream-300">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-brand-forest-900 uppercase tracking-wide">
              Family Health Action Guidance
            </h5>
            <p className="mt-0.5 text-xs text-brand-forest-800/80 leading-relaxed max-w-xl">
              {theme.actionGuidance}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <span className="text-[11px] font-semibold text-brand-forest-700/60">
            WHO Guideline: &lt; 15 µg/m³
          </span>
        </div>
      </div>
    </Card>
  );
}
