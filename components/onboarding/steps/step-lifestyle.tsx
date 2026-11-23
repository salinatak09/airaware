"use client";

import * as React from "react";
import { AeroMascot } from "../aero-mascot";
import { Button } from "@/components/ui/button";
import {
  Car,
  Bike,
  Train,
  Footprints,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { OnboardingState } from "@/types/onboarding";
import { cn } from "@/lib/utils";

const SCHEDULES = [
  { id: "standard_9_5", label: "Standard Work (9 AM – 5 PM)", desc: "Exposed to peak morning and evening traffic smog" },
  { id: "morning_school", label: "Morning School (7:30 AM – 2 PM)", desc: "Bus waiting happens during severe inversion peak" },
  { id: "remote_flexible", label: "Remote / Flexible Hours", desc: "Can schedule outdoor excursions around clean air windows" },
  { id: "shift_worker", label: "Night Shift / Variable", desc: "Active during late night temperature inversions" },
];

const COMMUTES = [
  { id: "metro_train", label: "Metro / Train", icon: Train, desc: "Air-conditioned cabins, brief platform exposure" },
  { id: "bus", label: "Public Bus", icon: BusIcon, desc: "Open windows, diesel exhaust exposure" },
  { id: "car_ac", label: "Car (AC Recirculation)", icon: Car, desc: "Sealed cabin blocks 70% coarse particulate" },
  { id: "bike_two_wheeler", label: "Two-Wheeler / Bike", icon: Bike, desc: "High direct respiratory pollution exposure" },
  { id: "walking", label: "Walking", icon: Footprints, desc: "Direct physical exertion near street level" },
];

function BusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 6 16 6 20 10 20 17 4 17 Z" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="16.5" cy="17.5" r="2.5" />
    </svg>
  );
}

const OUTDOOR_OPTIONS = [
  { id: "morning_jog", label: "Morning Jogging" },
  { id: "evening_walk", label: "Evening Dog / Family Walk" },
  { id: "park_visits", label: "Weekend Park Visits" },
  { id: "outdoor_sports", label: "Cricket / Football Sports" },
  { id: "minimal", label: "Mostly Indoors / Minimal" },
];

export function StepLifestyle({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: {
  data: OnboardingState["lifestyle"];
  onChange: (lifestyle: OnboardingState["lifestyle"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const toggleOutdoorActivity = (id: string) => {
    const list = data.outdoorActivities.includes(id)
      ? data.outdoorActivities.filter((a) => a !== id)
      : [...data.outdoorActivities, id];
    onChange({ ...data, outdoorActivities: list });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <AeroMascot mood="lifestyle" size="md" />
        <h2 className="text-2xl sm:text-3xl font-black text-brand-forest-900">
          Daily Routines & Commutes
        </h2>
        <p className="text-xs sm:text-sm text-brand-forest-800/70 max-w-md">
          Tell us when your family travels and exercises so Aero can warn you before peak toxic hours.
        </p>
      </div>

      {/* Schedule Selector */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-800">
          Primary Household Schedule
        </span>
        <div className="space-y-2">
          {SCHEDULES.map((s) => {
            const isSelected = data.workSchedule === s.id;
            return (
              <div
                key={s.id}
                onClick={() => onChange({ ...data, workSchedule: s.id as any })}
                className={cn(
                  "flex items-center justify-between rounded-2xl p-3 border transition-all cursor-pointer",
                  isSelected
                    ? "bg-[#F0FAF5] border-brand-mint-400 shadow-xs"
                    : "bg-white border-brand-forest-700/10 hover:bg-slate-50"
                )}
              >
                <div>
                  <h5 className="text-xs font-bold text-brand-forest-900">{s.label}</h5>
                  <p className="text-[10px] text-brand-forest-700/60 leading-tight mt-0.5">{s.desc}</p>
                </div>
                <div
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    isSelected ? "border-brand-forest-800 bg-brand-forest text-white" : "border-slate-300"
                  )}
                >
                  {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Commute Type Grid */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-800">
          Primary Commute Mode
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COMMUTES.map((c) => {
            const isSelected = data.commuteType === c.id;
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onChange({ ...data, commuteType: c.id as any })}
                className={cn(
                  "flex flex-col items-start p-3 rounded-2xl border text-left transition-all",
                  isSelected
                    ? "bg-[#FFF8E8] border-brand-cream-400 text-brand-forest-900 shadow-xs"
                    : "bg-white border-brand-forest-700/10 text-brand-forest-800 hover:bg-slate-50"
                )}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-brand-forest-800 mb-1.5">
                  <Icon className="h-4 w-4" />
                </div>
                <h6 className="text-xs font-bold leading-tight">{c.label}</h6>
                <p className="text-[9px] text-brand-forest-700/60 leading-tight mt-0.5">{c.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Outdoor Activities */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-800">
          Common Outdoor Activities
        </span>
        <div className="flex flex-wrap gap-2">
          {OUTDOOR_OPTIONS.map((opt) => {
            const isSelected = data.outdoorActivities.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleOutdoorActivity(opt.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-bold border transition-all",
                  isSelected
                    ? "bg-brand-mint text-brand-forest-900 border-brand-mint-400 shadow-xs"
                    : "bg-white text-brand-forest-700 border-brand-forest-700/10 hover:bg-slate-50"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 font-bold">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-bold text-brand-forest-700 hover:underline"
          >
            Skip for now
          </button>

          <Button variant="forest" size="sm" onClick={onNext} className="gap-1.5 font-bold">
            <span>Continue</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
