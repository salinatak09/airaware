"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useShell } from "@/components/layout/shell-context";
import {
  Compass,
  MapPin,
  Trees,
  Navigation,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTitle, SectionTitle, Subtitle } from "@/components/ui/typography";
import { getAqiTheme } from "@/lib/colors";
import { useToast } from "@/components/ui/toast";

interface CleanSanctuary {
  id: string;
  name: string;
  distance: string;
  type: "Park" | "Indoor Garden" | "Library Sanctuary";
  currentAqi: number;
  perks: string;
}

export default function ExplorePage() {
  const { currentLocation } = useShell();
  const { toast } = useToast();

  const sanctuaries: CleanSanctuary[] = [
    { id: "s-1", name: "Lodhi Gardens Urban Canopy", distance: "2.4 km", type: "Park", currentAqi: 62, perks: "Dense tree buffer drops PM2.5 by 40%" },
    { id: "s-2", name: "National Science Centre (Filtered)", distance: "4.1 km", type: "Indoor Garden", currentAqi: 24, perks: "Centralized commercial MERV-16 air filtration" },
    { id: "s-3", name: "Sunder Nursery Eco Heritage", distance: "5.8 km", type: "Park", currentAqi: 74, perks: "Pristine walking loops with minimal vehicular exhaust" },
  ];

  const neighborhoods = [
    { name: "Lodhi Road", aqi: 62, status: "Moderate", trend: "-12" },
    { name: "Connaught Place", aqi: 142, status: "Sensitive", trend: "+4" },
    { name: "R.K. Puram", aqi: 188, status: "Unhealthy", trend: "+18" },
    { name: "Anand Vihar", aqi: 275, status: "Very Unhealthy", trend: "+32" },
    { name: "Okhla Phase II", aqi: 310, status: "Hazardous", trend: "+15" },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge variant="sky" icon={<Compass className="h-3.5 w-3.5" />}>
              Urban Air Sanctuary Finder
            </Badge>
            <PageTitle className="mt-1">Explore Clean Air Zones</PageTitle>
            <Subtitle className="mt-1">
              Locate nearby green canopies, filtered public spaces, and compare neighborhood pollution in {currentLocation.city}.
            </Subtitle>
          </div>

          <Button
            variant="forest"
            size="sm"
            onClick={() =>
              toast({
                type: "success",
                title: "Sanctuary Map Updated",
                message: "Showing 12 public filtered zones and green parks near you.",
              })
            }
            className="gap-2 font-bold shadow-xs"
          >
            <Navigation className="h-4 w-4" />
            <span>Locate Nearest Clean Zone</span>
          </Button>
        </div>

        {/* Visual Map Canvas / Mockup */}
        <Card className="overflow-hidden border-2 border-brand-mint-200/80 bg-white shadow-card">
          <div className="relative h-64 sm:h-80 w-full bg-gradient-to-br from-[#E0F5EB] via-[#FFF8E8] to-[#DFF2FF] flex flex-col items-center justify-center p-6 text-center">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#175C48_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Interactive map markers mockup */}
            <div className="relative z-10 flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 rounded-2xl bg-white p-3 shadow-card border border-brand-mint-300 animate-bounce">
                <Trees className="h-5 w-5 text-emerald-600" />
                <div className="text-left">
                  <span className="text-xs font-bold text-brand-forest-900 block">Lodhi Gardens</span>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5">
                    AQI 62 • Clean Canopy
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-white p-3 shadow-card border border-orange-300">
                <MapPin className="h-5 w-5 text-orange-600" />
                <div className="text-left">
                  <span className="text-xs font-bold text-brand-forest-900 block">Current Location</span>
                  <span className="text-[10px] font-extrabold text-orange-700 bg-orange-100 rounded px-1.5 py-0.5">
                    AQI 142 • Sensitive
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-6 max-w-md rounded-2xl bg-white/90 p-3 shadow-sm backdrop-blur-xs">
              <p className="text-xs font-medium text-brand-forest-800">
                OpenStreetMap and Leaflet layer connected. Showing live micro-station heatmaps across the National Capital Region.
              </p>
            </div>
          </div>
        </Card>

        {/* Clean Sanctuaries List */}
        <section className="space-y-4">
          <SectionTitle>Top Clean Air Sanctuaries Near You</SectionTitle>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sanctuaries.map((s) => {
              const theme = getAqiTheme(s.currentAqi);
              return (
                <Card
                  key={s.id}
                  className="p-5 border-2 border-brand-forest-700/10 bg-white shadow-card flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <Badge variant="mint" className="text-[10px]">
                        {s.type}
                      </Badge>
                      <span className="text-xs font-bold text-brand-forest-700/60">{s.distance}</span>
                    </div>

                    <h4 className="mt-3 text-base font-bold text-brand-forest-900">{s.name}</h4>
                    <p className="mt-1 text-xs text-brand-forest-800/80 leading-relaxed">{s.perks}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-brand-mint-100 flex items-center justify-between">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-extrabold"
                      style={{
                        backgroundColor: theme.colorHex + "20",
                        color: theme.category === "good" ? "#175C48" : theme.colorHex,
                      }}
                    >
                      AQI {s.currentAqi} {theme.label}
                    </span>

                    <Button
                      size="sm"
                      variant="soft"
                      onClick={() =>
                        toast({
                          type: "info",
                          title: "Directions",
                          message: `Opening navigation to ${s.name} (${s.distance}).`,
                        })
                      }
                      className="text-xs font-bold"
                    >
                      Directions
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Neighborhood Air Comparison */}
        <section className="space-y-4">
          <SectionTitle>City Neighborhood Comparison</SectionTitle>
          <div className="rounded-3xl bg-white border border-brand-forest-700/10 p-5 shadow-card overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-mint-100 text-brand-forest-700/60 uppercase font-bold text-[10px]">
                  <th className="pb-3">Station / Neighborhood</th>
                  <th className="pb-3">AQI Score</th>
                  <th className="pb-3">Severity Category</th>
                  <th className="pb-3">24h Shift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-brand-forest-900">
                {neighborhoods.map((n) => {
                  const theme = getAqiTheme(n.aqi);
                  return (
                    <tr key={n.name} className="hover:bg-[#F0FAF5]/50 transition-colors">
                      <td className="py-3 font-bold">{n.name}</td>
                      <td className="py-3 font-black text-sm" style={{ color: theme.colorHex }}>
                        {n.aqi}
                      </td>
                      <td className="py-3">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase"
                          style={{
                            backgroundColor: theme.colorHex + "20",
                            color: theme.category === "good" ? "#175C48" : theme.colorHex,
                          }}
                        >
                          {n.status}
                        </span>
                      </td>
                      <td className="py-3 text-brand-forest-700/60 font-mono">{n.trend} AQI</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
