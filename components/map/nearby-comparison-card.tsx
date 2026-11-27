"use client";

import * as React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NearbyAreaComparison } from "@/types/api";

interface NearbyComparisonProps {
  areas: NearbyAreaComparison[];
  onSelectArea: (areaId: string) => void;
  selectedAreaId?: string;
}

export function NearbyComparisonSection({
  areas,
  onSelectArea,
  selectedAreaId,
}: NearbyComparisonProps) {
  if (!areas || areas.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-wider text-brand-forest-900">
          Nearby Neighborhoods Comparison
        </h4>
        <span className="text-[11px] text-brand-forest-700/80 font-medium">
          Relative to your area
        </span>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((area) => {
          const isSelected = selectedAreaId === area.id;
          const isWorse = area.deltaVsUser > 20;
          const isCleaner = area.deltaVsUser < -20;

          return (
            <div
              key={area.id}
              onClick={() => onSelectArea(area.id)}
              className={cn(
                "cursor-pointer rounded-2xl border-2 p-3.5 transition-all duration-200 bg-white hover:border-brand-forest-700/30 flex items-center justify-between shadow-xs select-none",
                isSelected
                  ? "border-brand-forest-800 ring-2 ring-brand-forest-800/10 bg-brand-mint-50/40"
                  : "border-brand-forest-700/10"
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-brand-forest-950">
                    {area.name}
                  </span>
                  {area.type === "ground_station" ? (
                    <span className="rounded bg-emerald-100 text-emerald-800 px-1 py-0.2 text-[8px] font-black uppercase">
                      CPCB
                    </span>
                  ) : area.type === "modeled" ? (
                    <span className="rounded bg-purple-100 text-purple-800 px-1 py-0.2 text-[8px] font-black uppercase">
                      MODEL
                    </span>
                  ) : (
                    <span className="rounded bg-amber-100 text-amber-800 px-1 py-0.2 text-[8px] font-black uppercase">
                      REPORT
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  {area.distanceKm} km away • PM2.5: {area.pm25} µg/m³
                </div>

                {/* Delta Badge */}
                <div className="flex items-center gap-1 pt-0.5">
                  {isWorse ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-red-700 bg-red-50 px-1.5 py-0.5 rounded-md">
                      <ArrowUpRight className="h-3 w-3" />
                      +{area.deltaVsUser} worse
                    </span>
                  ) : isCleaner ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      <ArrowDownRight className="h-3 w-3" />
                      {area.deltaVsUser} cleaner
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      <Minus className="h-3 w-3" />
                      Similar level
                    </span>
                  )}
                </div>
              </div>

              {/* AQI Pill */}
              <div
                className="h-10 w-10 rounded-full flex flex-col items-center justify-center text-white font-black text-xs shadow-xs shrink-0 ml-3"
                style={{ backgroundColor: area.color }}
              >
                {area.aqi}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
