"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wind, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PollutantItem {
  key: "pm25" | "pm10" | "no2" | "o3";
  name: string;
  fullName: string;
  value: number;
  unit: string;
  limit: number;
  status: "Safe" | "Moderate" | "Poor" | "Hazardous";
  statusColor: string;
  desc: string;
}

export function PollutantSummaryCard({
  pm25 = 95,
  pm10 = 168,
  no2 = 44,
  o3 = 32,
  className,
}: {
  pm25?: number;
  pm10?: number;
  no2?: number;
  o3?: number;
  className?: string;
}) {
  const pollutants: PollutantItem[] = [
    {
      key: "pm25",
      name: "PM2.5",
      fullName: "Fine Particulate Matter",
      value: pm25,
      unit: "µg/m³",
      limit: 15,
      status: pm25 > 60 ? "Poor" : pm25 > 35 ? "Moderate" : "Safe",
      statusColor: pm25 > 60 ? "text-red-700 bg-red-100 border-red-200" : "text-amber-800 bg-amber-100 border-amber-200",
      desc: "Penetrates deep into alveoli and bloodstream. Chief Delhi winter smog driver.",
    },
    {
      key: "pm10",
      name: "PM10",
      fullName: "Coarse Inhalable Dust",
      value: pm10,
      unit: "µg/m³",
      limit: 45,
      status: pm10 > 100 ? "Poor" : pm10 > 50 ? "Moderate" : "Safe",
      statusColor: pm10 > 100 ? "text-red-700 bg-red-100 border-red-200" : "text-amber-800 bg-amber-100 border-amber-200",
      desc: "Road dust, construction residue. Triggers upper airway coughing and throat scratchiness.",
    },
    {
      key: "no2",
      name: "NO2",
      fullName: "Nitrogen Dioxide",
      value: no2,
      unit: "µg/m³",
      limit: 25,
      status: no2 > 40 ? "Moderate" : "Safe",
      statusColor: no2 > 40 ? "text-amber-800 bg-amber-100 border-amber-200" : "text-emerald-800 bg-emerald-100 border-emerald-200",
      desc: "Combustion byproduct from diesel engines & gas stoves. Inflames bronchial tubes.",
    },
    {
      key: "o3",
      name: "O3",
      fullName: "Ground-Level Ozone",
      value: o3,
      unit: "µg/m³",
      limit: 100,
      status: o3 > 100 ? "Poor" : "Safe",
      statusColor: "text-emerald-800 bg-emerald-100 border-emerald-200",
      desc: "Photochemical smog component. Currently low due to winter cloud blanket.",
    },
  ];

  return (
    <Card className={cn("p-6 bg-white border-2 border-brand-forest-700/10 shadow-card", className)}>
      <div className="flex items-center justify-between pb-4 border-b border-brand-mint-100">
        <div>
          <h3 className="text-base font-bold text-brand-forest-900">Key Pollutants Breakdown</h3>
          <p className="text-xs text-brand-forest-700/60 mt-0.5">
            Measured against World Health Organization (WHO) 24h clean standards
          </p>
        </div>
        <Badge variant="cream" className="text-[10px] font-bold">
          4 Sensors Monitored
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {pollutants.map((item) => (
          <div
            key={item.key}
            className="flex flex-col justify-between rounded-2xl bg-[#F7FAF7] p-4 border border-brand-mint-200/80 shadow-xs hover:border-brand-mint-400 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-brand-forest-900">{item.name}</span>
                <span className={cn("rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase border", item.statusColor)}>
                  {item.status}
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
              <span className="text-[9px] text-brand-forest-700/60 block">
                Standard: &lt; {item.limit} {item.unit}
              </span>
              <p className="text-[10px] text-brand-forest-800/80 leading-tight mt-1 line-clamp-2">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
