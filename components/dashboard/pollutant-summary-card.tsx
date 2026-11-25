"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubIndexDetail } from "@/types/aqi";
import { cn } from "@/lib/utils";

export interface PollutantSummaryCardProps {
  pm25?: number;
  pm10?: number;
  no2?: number;
  o3?: number;
  so2?: number;
  co?: number; // in mg/m³
  subIndices?: Record<string, SubIndexDetail>;
  className?: string;
}

export function PollutantSummaryCard({
  pm25 = 95,
  pm10 = 168,
  no2 = 44,
  o3 = 32,
  so2 = 12,
  co = 1.4,
  subIndices,
  className,
}: PollutantSummaryCardProps) {
  const getSubIndexPill = (key: string, concentration: number) => {
    if (subIndices && subIndices[key]) {
      const si = subIndices[key];
      return {
        label: si.categoryLabel,
        subIndex: si.subIndex,
        badgeStyle: { backgroundColor: si.color + "20", color: si.color, borderColor: si.color + "40" },
      };
    }
    // Fallback heuristic if subIndices not provided
    return {
      label: concentration > 100 ? "Poor" : concentration > 50 ? "Moderate" : "Satisfactory",
      subIndex: Math.round(concentration),
      badgeStyle: { backgroundColor: "#eab30820", color: "#854d0e", borderColor: "#eab30840" },
    };
  };

  const pollutants = [
    {
      key: "pm25",
      name: "PM2.5",
      fullName: "Fine Particulate Matter",
      value: pm25,
      unit: "µg/m³",
      cpcbLimit: "30 µg/m³ (Good)",
      desc: "Penetrates deep into alveolar sacs and enters blood circulation.",
    },
    {
      key: "pm10",
      name: "PM10",
      fullName: "Inhalable Coarse Dust",
      value: pm10,
      unit: "µg/m³",
      cpcbLimit: "50 µg/m³ (Good)",
      desc: "Resuspension from road dust, construction sites, and dry topsoil.",
    },
    {
      key: "no2",
      name: "NO2",
      fullName: "Nitrogen Dioxide",
      value: no2,
      unit: "µg/m³",
      cpcbLimit: "40 µg/m³ (Good)",
      desc: "Traffic exhaust & domestic gas stoves; triggers airway hyperactivity.",
    },
    {
      key: "o3",
      name: "O3",
      fullName: "Ground-Level Ozone",
      value: o3,
      unit: "µg/m³",
      cpcbLimit: "50 µg/m³ (Good)",
      desc: "Secondary photochemical pollutant driven by sunlight and VOCs.",
    },
    {
      key: "co",
      name: "CO",
      fullName: "Carbon Monoxide",
      value: co,
      unit: "mg/m³",
      cpcbLimit: "1.0 mg/m³ (Good)",
      desc: "Incomplete combustion from vehicle exhausts; binds hemoglobin.",
    },
    {
      key: "so2",
      name: "SO2",
      fullName: "Sulphur Dioxide",
      value: so2,
      unit: "µg/m³",
      cpcbLimit: "40 µg/m³ (Good)",
      desc: "Industrial boilers & diesel emissions; causes throat irritation.",
    },
  ];

  return (
    <Card className={cn("p-6 bg-white border-2 border-brand-forest-700/10 shadow-card", className)}>
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-brand-mint-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-brand-forest-900">Atmospheric Pollutants & CPCB Sub-Indices</h3>
          <p className="text-xs text-brand-forest-700/60 mt-0.5">
            Evaluated against Central Pollution Control Board (CPCB) India National Air Standards
          </p>
        </div>
        <Badge variant="cream" className="text-[10px] font-bold">
          6 Chemical Compounds
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {pollutants.map((item) => {
          const { label, subIndex, badgeStyle } = getSubIndexPill(item.key, item.value);

          return (
            <div
              key={item.key}
              className="flex flex-col justify-between rounded-2xl bg-[#F7FAF7] p-4 border border-brand-mint-200/80 shadow-xs hover:border-brand-mint-400 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-brand-forest-900">{item.name}</span>
                  <span
                    className="rounded-md px-2 py-0.5 text-[9px] font-black uppercase border"
                    style={badgeStyle}
                  >
                    Sub-Index {subIndex} ({label})
                  </span>
                </div>
                <p className="text-[10px] text-brand-forest-700/60 leading-tight mt-0.5 truncate">
                  {item.fullName}
                </p>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-brand-forest-900">{item.value}</span>
                  <span className="text-[11px] font-semibold text-brand-forest-700/60">{item.unit}</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-brand-mint-200/60">
                <span className="text-[9px] text-brand-forest-700/60 block font-medium">
                  CPCB Target: &lt; {item.cpcbLimit}
                </span>
                <p className="text-[10px] text-brand-forest-800/80 leading-tight mt-1 line-clamp-2">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
