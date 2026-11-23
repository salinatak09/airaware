"use client";

import * as React from "react";
import { AeroMascot } from "../aero-mascot";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wind,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export function StepWelcome({
  onNext,
  onSignIn,
}: {
  onNext: () => void;
  onSignIn: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center max-w-xl mx-auto space-y-6">
      {/* Brand Tag & Mascot */}
      <div className="space-y-4">
        <Badge variant="mint" icon={<Sparkles className="h-3.5 w-3.5" />} className="py-1 px-3.5 text-xs font-bold">
          AI Urban Health Shield
        </Badge>

        <AeroMascot
          mood="welcome"
          size="lg"
          showSpeechBubble={true}
          speechText="Hi! I'm Aero, your friendly clean air buddy. Let's protect your family!"
        />
      </div>

      {/* Main Title & Tagline */}
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-mint text-brand-forest-900 shadow-xs">
            <Wind className="h-5 w-5 stroke-[2.5]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-forest-900">
            AirAware
          </h1>
        </div>
        <p className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-brand-forest-800 to-emerald-700 bg-clip-text text-transparent">
          Breathe smarter. Live better.
        </p>
        <p className="text-xs sm:text-sm text-brand-forest-800/70 max-w-md mx-auto leading-relaxed">
          The all-in-one assistant helping families outsmart urban smog with real-time station alerts, pediatric protection, and clean-air habits.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left pt-2">
        <div className="rounded-2xl bg-[#F0FAF5] p-3.5 border border-brand-mint-200 shadow-xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-mint text-brand-forest-900 mb-2">
            <Wind className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold text-brand-forest-900">Hyperlocal Air</h4>
          <p className="text-[11px] text-brand-forest-700/70 mt-0.5 leading-snug">
            Real-time PM2.5 and 72-hour forecast windows.
          </p>
        </div>

        <div className="rounded-2xl bg-[#FFF8E8] p-3.5 border border-brand-cream-300 shadow-xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 mb-2">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold text-brand-forest-900">Family Shield</h4>
          <p className="text-[11px] text-brand-forest-700/70 mt-0.5 leading-snug">
            Tailored rules for kids, asthma, and seniors.
          </p>
        </div>

        <div className="rounded-2xl bg-[#F0F9FF] p-3.5 border border-brand-sky-300 shadow-xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-800 mb-2">
            <Sparkles className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold text-brand-forest-900">Habit Streaks</h4>
          <p className="text-[11px] text-brand-forest-700/70 mt-0.5 leading-snug">
            Fun XP rewards and clean-air family badges.
          </p>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="w-full space-y-3 pt-2">
        <Button
          variant="forest"
          size="lg"
          onClick={onNext}
          className="w-full sm:w-auto min-w-[240px] text-base font-bold shadow-md gap-2"
        >
          <span>Get Started</span>
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-xs text-brand-forest-700/70">
          Already using AirAware?{" "}
          <button
            type="button"
            onClick={onSignIn}
            className="font-bold text-brand-forest-900 underline hover:text-brand-forest-700 transition-colors"
          >
            Sign In here
          </button>
        </p>
      </div>
    </div>
  );
}
