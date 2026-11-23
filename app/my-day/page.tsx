"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useShell } from "@/components/layout/shell-context";
import {
  CalendarCheck,
  SunMedium,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Car,
  Home,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTitle, SectionTitle, Subtitle } from "@/components/ui/typography";
import { useToast } from "@/components/ui/toast";
import { getAqiTheme } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface ActivitySlot {
  id: string;
  time: string;
  activity: string;
  targetMember: string;
  aqiEstimate: number;
  safety: "safe" | "caution" | "avoid";
  recommendation: string;
  icon: React.ElementType;
}

export default function MyDayPage() {
  const { currentLocation, activeFamilyMember } = useShell();
  const { toast } = useToast();

  const activities: ActivitySlot[] = [
    {
      id: "act-1",
      time: "06:30 AM – 08:00 AM",
      activity: "Morning Jog & Outdoor Exercise",
      targetMember: "Adults",
      aqiEstimate: 165,
      safety: "avoid",
      recommendation: "Smog inversion layer is dense. Substitute with yoga or treadmill indoors.",
      icon: SunMedium,
    },
    {
      id: "act-2",
      time: "08:00 AM – 09:15 AM",
      activity: "School Bus Commute",
      targetMember: "Aarav (Child)",
      aqiEstimate: 152,
      safety: "caution",
      recommendation: "Ensure child-size N95 mask is securely fitted while waiting at the stop.",
      icon: Car,
    },
    {
      id: "act-3",
      time: "01:30 PM – 04:30 PM",
      activity: "Outdoor Park Play & Shopping",
      targetMember: "Whole Family",
      aqiEstimate: 78,
      safety: "safe",
      recommendation: "Optimal window! Solar heating disperses surface particulate. Enjoy fresh air.",
      icon: Sparkles,
    },
    {
      id: "act-4",
      time: "05:30 PM – 07:30 PM",
      activity: "Evening Office Return Commute",
      targetMember: "Commuters",
      aqiEstimate: 140,
      safety: "caution",
      recommendation: "Set vehicle AC to internal recirculation mode to block diesel exhaust.",
      icon: Car,
    },
    {
      id: "act-5",
      time: "09:00 PM – 10:00 PM",
      activity: "Night Bedroom Air Preparation",
      targetMember: "Whole Family",
      aqiEstimate: 120,
      safety: "safe",
      recommendation: "Turn HEPA air purifier to Whisper Sleep mode 30 minutes before bedtime.",
      icon: Home,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge variant="sky" icon={<CalendarCheck className="h-3.5 w-3.5" />}>
              Daily Smog Defense Planner
            </Badge>
            <PageTitle className="mt-1">My Day Schedule</PageTitle>
            <Subtitle className="mt-1">
              Plan daily family routines around the cleanest atmospheric hours in {currentLocation.area}.
            </Subtitle>
          </div>

          <Button
            variant="forest"
            size="sm"
            onClick={() =>
              toast({
                type: "success",
                title: "Schedule Saved",
                message: "Notifications synced to alert you before safe outdoor windows.",
              })
            }
            className="gap-2 font-bold shadow-xs"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Sync Daily Alerts</span>
          </Button>
        </div>

        {/* Personalized Health Shield Alert */}
        <div className="rounded-3xl border-2 border-brand-mint-200 bg-[#F0FAF5] p-6 shadow-soft">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-mint text-brand-forest-900 font-bold shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-brand-forest-900">
                  Active Shield: {activeFamilyMember.name} ({activeFamilyMember.role})
                </h3>
                <span className="rounded-full bg-brand-peach px-2 py-0.5 text-[10px] font-extrabold text-[#7c2d12]">
                  {activeFamilyMember.vulnerability.toUpperCase()} VULNERABILITY
                </span>
              </div>
              <p className="mt-1.5 text-xs text-brand-forest-800/80 leading-relaxed">
                {activeFamilyMember.condition ? (
                  <>
                    Noted condition: <strong>{activeFamilyMember.condition}</strong>. Today&apos;s primary risk is
                    morning micro-particle spikes. Outdoor window between <strong>1:30 PM and 4:30 PM</strong> is
                    cleared for physical activity.
                  </>
                ) : (
                  <>
                    Standard protection active. Limit prolonged strenuous exertion during early morning and late
                    evening traffic peaks.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Hourly Activities Timeline */}
        <section className="space-y-4">
          <SectionTitle>Planned Routines & Safety Guidance</SectionTitle>

          <div className="space-y-3">
            {activities.map((slot) => {
              const theme = getAqiTheme(slot.aqiEstimate);
              const Icon = slot.icon;

              const getSafetyBadge = () => {
                switch (slot.safety) {
                  case "safe":
                    return (
                      <Badge variant="aqiGood" className="gap-1 font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        Safe Window
                      </Badge>
                    );
                  case "caution":
                    return (
                      <Badge variant="aqiSensitive" className="gap-1 font-bold">
                        <AlertTriangle className="h-3 w-3" />
                        Caution
                      </Badge>
                    );
                  default:
                    return (
                      <Badge variant="aqiUnhealthy" className="gap-1 font-bold">
                        <AlertTriangle className="h-3 w-3" />
                        Avoid Outdoor
                      </Badge>
                    );
                }
              };

              return (
                <Card
                  key={slot.id}
                  className={cn(
                    "p-5 sm:p-6 transition-all duration-200 border-2",
                    slot.safety === "safe"
                      ? "bg-white border-brand-mint-200/80 shadow-xs hover:shadow-card"
                      : slot.safety === "caution"
                      ? "bg-white border-amber-200 shadow-xs hover:shadow-card"
                      : "bg-[#FFF5EF] border-brand-peach-300 shadow-xs"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-brand-forest-800">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-brand-forest-700/60 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {slot.time}
                          </span>
                          <span className="text-brand-forest-700/30">•</span>
                          <span className="text-xs font-bold text-brand-forest-800">{slot.targetMember}</span>
                        </div>
                        <h4 className="mt-0.5 text-base font-bold text-brand-forest-900">{slot.activity}</h4>
                        <p className="mt-1 text-xs text-brand-forest-800/80 leading-relaxed max-w-2xl">
                          {slot.recommendation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between shrink-0 pl-14 sm:pl-0">
                      {getSafetyBadge()}
                      <span className="text-xs font-black mt-1" style={{ color: theme.colorHex }}>
                        Est. AQI {slot.aqiEstimate}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
