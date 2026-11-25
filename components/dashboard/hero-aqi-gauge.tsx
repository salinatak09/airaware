"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAqiTheme } from "@/lib/colors";
import { ShieldAlert, MapPin, Database, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroAqiGaugeProps {
  aqi: number;
  cityName?: string;
  stationName?: string;
  updatedAt?: string;
  dominantPollutantLabel?: string;
  categoryLabel?: string;
  healthSummary?: string;
  usAqi?: number;
  isDemo?: boolean;
  dataSource?: string;
  dataAge?: string;
  onToggleDemo?: () => void;
  className?: string;
}

export function HeroAqiGauge({
  aqi = 105,
  cityName = "Connaught Place, New Delhi",
  stationName = "CAMS Regional Grid Point",
  updatedAt = "Just now",
  dominantPollutantLabel = "PM2.5",
  categoryLabel,
  healthSummary,
  usAqi,
  isDemo = false,
  dataSource = "Open-Meteo CAMS Model",
  dataAge = "Just now",
  onToggleDemo,
  className,
}: HeroAqiGaugeProps) {
  const theme = getAqiTheme(aqi);

  // Gauge calculation: Arc from -180 deg to 0 deg (or 180 to 360)
  // Max AQI mapped to 500 for CPCB NAQI standard
  const clampedAqi = Math.min(500, Math.max(0, aqi));
  const progressRatio = clampedAqi / 500; // 0 to 1
  const needleRotation = -90 + progressRatio * 180; // -90 deg (0 AQI) to +90 deg (500 AQI)

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
              <span className="text-[10px] text-brand-forest-700/60 block leading-none mt-0.5">
                {stationName} • {dataAge || updatedAt}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Live / Demo indicator */}
            {isDemo ? (
              <button
                type="button"
                onClick={onToggleDemo}
                className="cursor-pointer rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[9px] font-black uppercase text-amber-900 tracking-wider hover:bg-amber-500/20 transition-colors"
                title="Click to switch to Live Open-Meteo Model"
              >
                Demo Mode
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[9px] font-black uppercase text-emerald-800 tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Model
              </span>
            )}

            {/* Dominant Pollutant Chip */}
            {dominantPollutantLabel && (
              <span className="rounded-full bg-white/80 border border-brand-forest-700/10 px-2.5 py-0.5 text-[10px] font-bold text-brand-forest-800">
                Anchor: {dominantPollutantLabel}
              </span>
            )}

            <Badge className={cn("px-3 py-1 text-xs font-bold uppercase", theme.badgeClass)}>
              {categoryLabel || theme.label}
            </Badge>
          </div>
        </div>

        {/* Circular / Semi-Circular Gauge Display */}
        <div className="relative mt-4 flex flex-col items-center justify-center pt-2 pb-0">
          <div className="relative w-64 h-36 sm:w-72 sm:h-40 flex items-center justify-center overflow-hidden">
            {/* SVG Arc Gauge */}
            <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
              <defs>
                {/* 6 Indian CPCB regulatory colors gradient */}
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />        {/* Good 0-50 */}
                  <stop offset="20%" stopColor="#84CC16" />       {/* Satisfactory 51-100 */}
                  <stop offset="40%" stopColor="#EAB308" />       {/* Moderate 101-200 */}
                  <stop offset="60%" stopColor="#F97316" />       {/* Poor 201-300 */}
                  <stop offset="80%" stopColor="#EF4444" />       {/* Very Poor 301-400 */}
                  <stop offset="100%" stopColor="#881337" />      {/* Severe 401-500 */}
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
              500 Sev
            </div>
          </div>

          {/* Large Hero Score & Category Text */}
          <div className="text-center mt-1">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className={cn("text-6xl sm:text-7xl font-black tracking-tight", theme.textClass)}>
                {aqi}
              </span>
              <span className="text-xs font-extrabold uppercase text-brand-forest-700/60">
                NAQI
              </span>
            </div>
            <p className="text-sm sm:text-base font-extrabold text-brand-forest-900 mt-0.5">
              CPCB Index: <span style={{ color: theme.colorHex }}>{categoryLabel || theme.label}</span>
            </p>
            {usAqi !== undefined && (
              <span className="text-[11px] text-brand-forest-700/60 font-medium block mt-0.5">
                US EPA Equivalent: <strong>{usAqi} AQI</strong>
              </span>
            )}
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
              {healthSummary || theme.actionGuidance}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-forest-700/60">
            <Database className="h-3 w-3" />
            <span>{isDemo ? "Curated Demo" : "CAMS Model"}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
