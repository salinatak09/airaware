"use client";

import * as React from "react";
import { AeroMascot, AeroMood } from "@/components/onboarding/aero-mascot";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface AeroCoachCardProps {
  aqi: number;
  userName?: string;
  activeMemberName?: string;
  className?: string;
}

export function AeroCoachCard({
  aqi = 185,
  userName = "Rohit",
  activeMemberName = "Aarav",
  className,
}: AeroCoachCardProps) {
  const getCoachSpeech = () => {
    if (aqi > 200) {
      return {
        mood: "household" as AeroMood,
        greeting: "Alert Mode Active!",
        tip: `${userName}, particulate levels are hazardous today (AQI ${aqi}). Keep all bedroom HEPA purifiers running and keep ${activeMemberName} indoors until afternoon dispersion.`,
        actionText: "Check Pediatric Guide",
        actionHref: "/ai-buddy",
      };
    }
    if (aqi > 150) {
      return {
        mood: "household" as AeroMood,
        greeting: "Cautionary Smog Advisory",
        tip: `${userName}, morning smog is thick (AQI ${aqi}). Pack ${activeMemberName}'s N95 mask for school. The safest window for outdoor play is 2:00 PM – 4:30 PM!`,
        actionText: "View 2 PM Safe Window",
        actionHref: "/my-day",
      };
    }
    if (aqi > 100) {
      return {
        mood: "lifestyle" as AeroMood,
        greeting: "Moderate Air Alert",
        tip: `Air is moderately hazy (AQI ${aqi}). Sensitive family members should take brief breaks during prolonged outdoor play.`,
        actionText: "Plan Day",
        actionHref: "/my-day",
      };
    }
    return {
      mood: "welcome" as AeroMood,
      greeting: "Fresh Air Day!",
      tip: `Air quality is great today (AQI ${aqi}). Wonderful time to open diagonal windows and enjoy outdoor sports with ${activeMemberName}!`,
      actionText: "Open Sanctuaries Map",
      actionHref: "/explore",
    };
  };

  const coach = getCoachSpeech();

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-6 sm:p-7 border-2 border-brand-mint-200/90 bg-gradient-to-br from-[#F0FAF5] via-white to-[#FFF8E8] shadow-card",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="shrink-0 flex flex-col items-center">
          <AeroMascot mood={coach.mood} size="md" />
          <Badge variant="mint" className="text-[10px] mt-1 font-bold">
            Aero AI Coach
          </Badge>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="rounded-full bg-brand-forest-900 px-2.5 py-0.5 text-[10px] font-black uppercase text-brand-mint-300">
              {coach.greeting}
            </span>
            <span className="text-xs font-semibold text-brand-forest-700/60">
              Personalized for {activeMemberName}
            </span>
          </div>

          <h4 className="text-lg font-extrabold text-brand-forest-900 leading-snug">
            &ldquo;{coach.tip}&rdquo;
          </h4>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <Link href={coach.actionHref}>
              <Button size="sm" variant="forest" className="font-bold gap-1.5 text-xs shadow-xs">
                <span>{coach.actionText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link href="/ai-buddy">
              <Button size="sm" variant="soft" className="font-bold gap-1.5 text-xs">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Chat with Aero</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
