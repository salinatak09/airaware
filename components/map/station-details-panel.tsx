"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldCheck,
  Radio,
  AlertTriangle,
  Clock,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExploreMapItem } from "@/types/api";

interface StationDetailsPanelProps {
  station: ExploreMapItem | null;
  onClose: () => void;
  onUpvoteCommunityReport?: (id: string) => void;
}

export function StationDetailsPanel({
  station,
  onClose,
  onUpvoteCommunityReport,
}: StationDetailsPanelProps) {
  if (!station) return null;

  const isOfficial = station.type === "ground_station";
  const isModeled = station.type === "modeled";
  const isCommunity = station.type === "community_report";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        role="region"
        aria-label="Monitoring station details"
        className="w-full lg:w-96 bg-white border-2 border-brand-forest-700/10 rounded-3xl shadow-card overflow-hidden flex flex-col max-h-[85vh] z-20 min-w-0"
      >
        {/* Panel Header */}
        <div
          className="p-4 sm:p-5 text-white relative flex flex-col justify-between"
          style={{
            backgroundColor:
              station.category === "severe"
                ? "#7F1D1D"
                : station.category === "very_poor"
                ? "#991B1B"
                : station.category === "poor"
                ? "#C2410C"
                : station.category === "moderate"
                ? "#B45309"
                : station.category === "satisfactory"
                ? "#4D7C0F"
                : "#047857",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              {/* Type Badge */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {isOfficial ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white border border-white/30">
                    <ShieldCheck className="h-3 w-3" />
                    Official CPCB Station
                  </span>
                ) : isModeled ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-900/40 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-purple-100 border border-purple-300/40">
                    <Radio className="h-3 w-3" />
                    Modeled Grid Location
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-900/40 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-100 border border-amber-300/40">
                    <AlertTriangle className="h-3 w-3" />
                    Citizen Report
                  </span>
                )}
                <span className="text-[10px] text-white/80 font-semibold">
                  {station.distanceKm} km {station.direction}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-white leading-tight pt-1">
                {station.name}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-black/20 hover:bg-black/40 h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center text-white transition-colors active:scale-95 shrink-0"
              aria-label="Close station details"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* AQI Display */}
          <div className="mt-4 pt-3 border-t border-white/20 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{station.aqi}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                {station.categoryLabel}
              </span>
            </div>
            <span className="text-xs font-extrabold text-white/80 bg-black/20 px-2 py-0.5 rounded-lg">
              PM2.5: {station.pollutants.pm25} µg/m³
            </span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-brand-forest-800">
          {/* Data Provenance & Source Information */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-brand-forest-700">
              <span className="uppercase tracking-wider">Data Source</span>
              <span className="flex items-center gap-1 font-semibold text-slate-500">
                <Clock className="h-3 w-3" />
                {station.dataAge}
              </span>
            </div>
            <p className="font-extrabold text-brand-forest-950 text-xs">
              {station.sourceName}
            </p>
            {isModeled && (
              <p className="text-[10px] text-purple-900 bg-purple-50 p-2 rounded-xl font-medium leading-relaxed border border-purple-200">
                ⚠️ <strong>Note:</strong> Modeled points represent mathematical atmospheric dispersion estimates from high-resolution meteorological models. They are NOT certified ground station measurements.
              </p>
            )}
            {isCommunity && station.communityDetails && (
              <div className="mt-2 pt-2 border-t border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-900">
                    Report Type: {station.communityDetails.reportType.replace(/_/g, " ")}
                  </span>
                  <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-black text-[10px] uppercase">
                    {station.communityDetails.severity} Severity
                  </span>
                </div>
                <p className="text-slate-700 italic text-[11px]">
                  &ldquo;{station.communityDetails.description}&rdquo;
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {station.communityDetails.upvotes} citizens confirmed
                  </span>
                  {onUpvoteCommunityReport && (
                    <button
                      type="button"
                      onClick={() => onUpvoteCommunityReport(station.id)}
                      className="inline-flex items-center gap-1 font-bold text-brand-forest-900 hover:text-brand-forest-700 text-[11px] bg-brand-mint/40 hover:bg-brand-mint px-2 py-1 rounded-lg transition-colors"
                    >
                      <ThumbsUp className="h-3 w-3" /> Confirm Report
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pollutant Breakdown */}
          <div className="space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-brand-forest-900 block">
              Key Pollutant Concentrations
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* PM2.5 */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-slate-600">PM2.5</span>
                  <span className="font-black text-brand-forest-950">
                    {station.pollutants.pm25} µg/m³
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${Math.min(100, (station.pollutants.pm25 / 250) * 100)}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-500 block text-right mt-0.5">
                  Limit: 60 µg/m³
                </span>
              </div>

              {/* PM10 */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-slate-600">PM10</span>
                  <span className="font-black text-brand-forest-950">
                    {station.pollutants.pm10} µg/m³
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, (station.pollutants.pm10 / 400) * 100)}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-500 block text-right mt-0.5">
                  Limit: 100 µg/m³
                </span>
              </div>

              {/* NO2 */}
              {station.pollutants.no2 !== undefined && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-slate-600">NO2</span>
                    <span className="font-black text-brand-forest-950">
                      {station.pollutants.no2} µg/m³
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, (station.pollutants.no2 / 80) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 block text-right mt-0.5">
                    Limit: 80 µg/m³
                  </span>
                </div>
              )}

              {/* O3 / Ozone */}
              {station.pollutants.o3 !== undefined && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-slate-600">Ozone (O3)</span>
                    <span className="font-black text-brand-forest-950">
                      {station.pollutants.o3} µg/m³
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, (station.pollutants.o3 / 100) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 block text-right mt-0.5">
                    Limit: 100 µg/m³
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Weather Integration */}
          {station.weather && (
            <div className="p-3.5 rounded-2xl bg-brand-mint-50/50 border border-brand-mint-200 flex items-center justify-around text-center">
              <div>
                <span className="text-[10px] text-brand-forest-700 uppercase font-bold block">
                  Temp
                </span>
                <span className="font-black text-brand-forest-950 text-sm">
                  {station.weather.temperatureC}°C
                </span>
              </div>
              <div className="h-6 w-px bg-brand-mint-300" />
              <div>
                <span className="text-[10px] text-brand-forest-700 uppercase font-bold block">
                  Humidity
                </span>
                <span className="font-black text-brand-forest-950 text-sm">
                  {station.weather.humidityPercent}%
                </span>
              </div>
              <div className="h-6 w-px bg-brand-mint-300" />
              <div>
                <span className="text-[10px] text-brand-forest-700 uppercase font-bold block">
                  Wind
                </span>
                <span className="font-black text-brand-forest-950 text-sm">
                  {station.weather.windSpeedKmh} km/h ({station.weather.windDirectionCompass})
                </span>
              </div>
            </div>
          )}

          {/* Health Advisory */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
            <span className="font-black text-xs uppercase tracking-wider text-amber-950 block">
              Health Advisory
            </span>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              {station.healthAdvisory.summary}
            </p>
            <div className="text-[11px] text-amber-800 font-bold pt-1">
              {station.healthAdvisory.maskRequired ? "😷 N95/KF94 Mask Recommended Outdoors" : "Breathe freely"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-brand-forest-700/10 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-semibold">
            Lat: {station.latitude.toFixed(4)}, Lon: {station.longitude.toFixed(4)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-bold"
          >
            Done
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
