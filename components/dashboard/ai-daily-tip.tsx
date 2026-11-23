"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Bot, ArrowRight, Lightbulb } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AiDailyTip({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6 bg-gradient-to-br from-[#FFFDF6] via-[#FFF8E8] to-[#F0FAF5] border-2 border-brand-cream-300 shadow-card", className)}>
      <div className="flex items-center justify-between pb-3 border-b border-brand-cream-300/80">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-brand-forest-900">Aero AI Health Tip of the Day</h4>
            <span className="text-[10px] text-brand-forest-700/60 font-semibold">
              Synthesized by Google Gemini 1.5 Air Engine
            </span>
          </div>
        </div>

        <Badge variant="yellow" className="text-[10px] font-bold gap-1">
          <Sparkles className="h-3 w-3" />
          <span>Daily Insight</span>
        </Badge>
      </div>

      <div className="mt-4 space-y-2">
        <h5 className="text-base font-extrabold text-brand-forest-900">
          Why you should avoid morning cross-ventilation in Delhi
        </h5>
        <p className="text-xs sm:text-sm text-brand-forest-800/80 leading-relaxed">
          Between 6:00 AM and 10:00 AM, thermal radiation cooling traps heavy vehicular and biomass smoke within 50
          meters of the ground. Opening balcony doors during this time pulls toxic PM2.5 directly into bedrooms.
          Wait until <strong>2:00 PM</strong> when solar convection lifts the boundary layer, dropping ambient PM2.5 by
          up to 60%.
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-brand-cream-300/60 flex items-center justify-between">
        <span className="text-[11px] font-bold text-brand-forest-700/70">
          Applicable for: All Family Members
        </span>
        <Link
          href="/ai-buddy"
          className="text-xs font-bold text-brand-forest-900 hover:underline flex items-center gap-1"
        >
          <span>Ask Gemini for more details</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  );
}
