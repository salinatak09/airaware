"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Home,
  Wind,
  Filter,
  Fan,
  Sparkles,
  Timer,
  AlertCircle,
  CheckCircle2,
  Power,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { PageTitle, SectionTitle, Subtitle } from "@/components/ui/typography";
import { useToast } from "@/components/ui/toast";

interface RoomStatus {
  id: string;
  name: string;
  aqi: number;
  pm25: number;
  co2: number;
  purifierActive: boolean;
  purifierSpeed: "Auto" | "Quiet" | "Turbo" | "Off";
}

export default function IndoorAirPage() {
  const { toast } = useToast();

  const [rooms, setRooms] = React.useState<RoomStatus[]>([
    { id: "r-1", name: "Baby Nursery", aqi: 18, pm25: 4.2, co2: 520, purifierActive: true, purifierSpeed: "Quiet" },
    { id: "r-2", name: "Living Room", aqi: 32, pm25: 8.5, co2: 640, purifierActive: true, purifierSpeed: "Auto" },
    { id: "r-3", name: "Master Bedroom", aqi: 42, pm25: 11.8, co2: 780, purifierActive: true, purifierSpeed: "Auto" },
    { id: "r-4", name: "Kitchen", aqi: 88, pm25: 28.0, co2: 950, purifierActive: false, purifierSpeed: "Off" },
  ]);

  const togglePurifier = (roomId: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        const next = !r.purifierActive;
        toast({
          type: next ? "success" : "info",
          title: `${r.name} Purifier`,
          message: next ? "Air purifier activated on Auto mode." : "Purifier placed in standby.",
        });
        return {
          ...r,
          purifierActive: next,
          purifierSpeed: next ? "Auto" : "Off",
          aqi: next ? Math.max(15, r.aqi - 20) : r.aqi + 20,
        };
      })
    );
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge variant="mint" icon={<Home className="h-3.5 w-3.5" />}>
              Home Sanctuary Defense
            </Badge>
            <PageTitle className="mt-1">Indoor Air Quality</PageTitle>
            <Subtitle className="mt-1">
              Monitor room-by-room purity, manage air purifier filters, and optimize clean ventilation.
            </Subtitle>
          </div>

          <Button
            variant="forest"
            size="sm"
            onClick={() =>
              toast({
                type: "success",
                title: "Sanctuary Boost Activated",
                message: "All indoor purifiers set to High Dispersion for 30 minutes.",
              })
            }
            className="gap-2 font-bold shadow-xs"
          >
            <Fan className="h-4 w-4" />
            <span>Boost All Purifiers</span>
          </Button>
        </div>

        {/* Indoor Vitals Banner */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Avg Indoor AQI"
            value="34"
            unit="Good"
            icon={<Sparkles className="h-4 w-4 text-brand-forest-800" />}
            subtitle="76% cleaner than outside"
            variant="mint"
          />
          <MetricCard
            title="Avg PM2.5 Indoors"
            value="9.8"
            unit="µg/m³"
            icon={<Wind className="h-4 w-4 text-brand-forest-800" />}
            subtitle="Below WHO 15 µg/m³ limit"
            variant="cream"
          />
          <MetricCard
            title="CO2 Carbon Level"
            value="680"
            unit="ppm"
            icon={<AlertCircle className="h-4 w-4 text-brand-forest-800" />}
            subtitle="Fresh air ventilation healthy"
            variant="sky"
          />
          <MetricCard
            title="Living HEPA Lifespan"
            value="78%"
            unit="Healthy"
            icon={<Filter className="h-4 w-4 text-brand-forest-800" />}
            subtitle="Replace in 42 days"
            variant="lavender"
          />
        </div>

        {/* Room By Room Monitor */}
        <section className="space-y-4">
          <SectionTitle>Room-by-Room Sanctuary Sensors</SectionTitle>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className="p-5 border-2 border-brand-forest-700/10 bg-white shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-base text-brand-forest-900">{room.name}</h4>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase"
                      style={{
                        backgroundColor: room.aqi <= 50 ? "#E0F5EB" : "#FFFBEA",
                        color: room.aqi <= 50 ? "#175C48" : "#854D0E",
                      }}
                    >
                      AQI {room.aqi}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-brand-forest-900">{room.aqi}</span>
                    <span className="text-xs text-brand-forest-700/60 font-semibold">
                      PM2.5: {room.pm25} µg/m³
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-brand-forest-800/80">
                    <span>CO2 Level</span>
                    <span className="font-bold">{room.co2} ppm</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-brand-mint-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Fan
                      className={`h-4 w-4 ${
                        room.purifierActive ? "animate-spin text-emerald-600" : "text-slate-400"
                      }`}
                    />
                    <span className="text-xs font-semibold text-brand-forest-800">
                      {room.purifierSpeed}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => togglePurifier(room.id)}
                    className={`rounded-xl p-2 transition-colors ${
                      room.purifierActive
                        ? "bg-brand-mint text-brand-forest-900 shadow-xs"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                    aria-label="Toggle purifier"
                  >
                    <Power className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Smart Ventilation Window Timer */}
        <section className="rounded-3xl border-2 border-brand-sky-300 bg-[#F0F9FF] p-6 sm:p-8 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-sky-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                  Smart Home Cross-Ventilation Timer
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-brand-forest-900">
                Recommended Window Flush: 2:00 PM – 2:20 PM
              </h3>
              <p className="text-xs text-brand-forest-800/80 max-w-xl">
                Open diagonal windows for 20 minutes while outdoor particulate is at its diurnal minimum. Flush
                accumulated CO2 and kitchen cooking VOCs before evening inversion.
              </p>
            </div>

            <Button
              variant="forest"
              onClick={() =>
                toast({
                  type: "success",
                  title: "Ventilation Timer Armed",
                  message: "You will receive a phone notification at 2:00 PM to open windows.",
                })
              }
              className="gap-2 font-bold shrink-0"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Set 2 PM Flush Reminder</span>
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
