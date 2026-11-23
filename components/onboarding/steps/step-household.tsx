"use client";

import * as React from "react";
import { AeroMascot } from "../aero-mascot";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { OnboardingState } from "@/types/onboarding";
import { cn } from "@/lib/utils";

const SENSITIVITIES = [
  { id: "asthma", label: "Asthma", desc: "Bronchial sensitivity to PM2.5 & cold air" },
  { id: "allergic_rhinitis", label: "Seasonal Allergies", desc: "Sneezing, pollen, dust triggers" },
  { id: "copd", label: "COPD / Bronchitis", desc: "Chronic lung irritation" },
  { id: "frequent_cough", label: "Frequent Night Cough", desc: "Smog-induced throat irritation" },
];

const ACTIVITY_PATTERNS = [
  { id: "early_risers", label: "Early Morning Risers", desc: "Active between 6:00 AM – 8:00 AM" },
  { id: "active_kids", label: "Outdoor School Kids", desc: "Daily afternoon playground sports" },
  { id: "pets_at_home", label: "Indoor Pets", desc: "Additional dander & daily dog walks" },
  { id: "night_owls", label: "Evening Commuters", desc: "Outdoors during evening traffic peaks" },
];

export function StepHousehold({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: {
  data: OnboardingState["household"];
  onChange: (household: OnboardingState["household"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const updateCount = (key: "adults" | "children" | "seniors", delta: number) => {
    const nextVal = Math.max(key === "adults" ? 1 : 0, data[key] + delta);
    onChange({ ...data, [key]: nextVal });
  };

  const toggleSensitivity = (id: string) => {
    const list = data.respiratorySensitivities.includes(id)
      ? data.respiratorySensitivities.filter((s) => s !== id)
      : [...data.respiratorySensitivities, id];
    onChange({ ...data, respiratorySensitivities: list });
  };

  const toggleActivityPattern = (id: string) => {
    const list = data.activityPatterns.includes(id)
      ? data.activityPatterns.filter((p) => p !== id)
      : [...data.activityPatterns, id];
    onChange({ ...data, activityPatterns: list });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <AeroMascot mood="household" size="md" />
        <h2 className="text-2xl sm:text-3xl font-black text-brand-forest-900">
          Who lives in your home?
        </h2>
        <p className="text-xs sm:text-sm text-brand-forest-800/70 max-w-md">
          Children and seniors breathe 30% more air relative to their body weight. We adjust safety thresholds accordingly.
        </p>
      </div>

      {/* Household Steppers Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Adults */}
        <div className="flex flex-col items-center justify-between rounded-2xl bg-white p-3.5 border border-brand-mint-200/80 shadow-xs">
          <span className="text-xs font-bold text-brand-forest-900">Adults</span>
          <span className="text-2xl font-black text-brand-forest-900 my-1">{data.adults}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={data.adults <= 1}
              onClick={() => updateCount("adults", -1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-brand-forest-900 hover:bg-slate-200 disabled:opacity-30"
              aria-label="Decrease adults"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateCount("adults", 1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-mint-100 text-brand-forest-900 hover:bg-brand-mint-200"
              aria-label="Increase adults"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Children */}
        <div className="flex flex-col items-center justify-between rounded-2xl bg-white p-3.5 border border-brand-mint-200/80 shadow-xs">
          <span className="text-xs font-bold text-brand-forest-900">Children</span>
          <span className="text-2xl font-black text-brand-forest-900 my-1">{data.children}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={data.children <= 0}
              onClick={() => updateCount("children", -1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-brand-forest-900 hover:bg-slate-200 disabled:opacity-30"
              aria-label="Decrease children"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateCount("children", 1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-sky text-sky-950 hover:bg-brand-sky-400"
              aria-label="Increase children"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Seniors */}
        <div className="flex flex-col items-center justify-between rounded-2xl bg-white p-3.5 border border-brand-mint-200/80 shadow-xs">
          <span className="text-xs font-bold text-brand-forest-900">Seniors (65+)</span>
          <span className="text-2xl font-black text-brand-forest-900 my-1">{data.seniors}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={data.seniors <= 0}
              onClick={() => updateCount("seniors", -1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-brand-forest-900 hover:bg-slate-200 disabled:opacity-30"
              aria-label="Decrease seniors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateCount("seniors", 1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-cream-300 text-amber-950 hover:bg-brand-cream-400"
              aria-label="Increase seniors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Optional Respiratory Sensitivity Preferences */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-800">
            Respiratory Health Conditions (Optional)
          </span>
          <span className="text-[10px] text-brand-forest-700/60 font-semibold">User provided</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SENSITIVITIES.map((s) => {
            const isChecked = data.respiratorySensitivities.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSensitivity(s.id)}
                className={cn(
                  "flex items-start gap-2.5 rounded-2xl p-3 text-left border transition-all cursor-pointer",
                  isChecked
                    ? "bg-[#FFF5EF] border-brand-peach-400 shadow-xs text-brand-forest-900"
                    : "bg-white border-brand-forest-700/10 text-brand-forest-800 hover:bg-slate-50"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border",
                    isChecked
                      ? "bg-brand-peach border-brand-peach-400 text-[#7c2d12]"
                      : "border-slate-300 bg-white"
                  )}
                >
                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
                <div>
                  <h6 className="text-xs font-bold leading-tight">{s.label}</h6>
                  <p className="text-[10px] text-brand-forest-700/60 leading-tight mt-0.5">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pregnancy-related Sensitivity Toggle */}
      <div
        onClick={() => onChange({ ...data, pregnancySensitivity: !data.pregnancySensitivity })}
        className={cn(
          "flex items-center justify-between rounded-2xl p-3.5 border transition-all cursor-pointer",
          data.pregnancySensitivity
            ? "bg-[#FFF8E8] border-brand-yellow-300 shadow-xs"
            : "bg-white border-brand-forest-700/10 hover:bg-slate-50"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <Heart className="h-4 w-4 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-brand-forest-900">
              Expecting Mother / Pregnancy in Household
            </h5>
            <p className="text-[10px] text-brand-forest-700/70">
              Lowers maternal PM2.5 tolerance guidelines during peak gestation.
            </p>
          </div>
        </div>

        <div
          className={cn(
            "h-5 w-9 rounded-full transition-colors relative flex items-center p-0.5",
            data.pregnancySensitivity ? "bg-amber-500" : "bg-slate-200"
          )}
        >
          <div
            className={cn(
              "h-4 w-4 rounded-full bg-white shadow-xs transition-transform",
              data.pregnancySensitivity ? "translate-x-4" : "translate-x-0"
            )}
          />
        </div>
      </div>

      {/* Household Activity Patterns */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-800">
          Household Patterns
        </span>
        <div className="grid grid-cols-2 gap-2">
          {ACTIVITY_PATTERNS.map((p) => {
            const isSelected = data.activityPatterns.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleActivityPattern(p.id)}
                className={cn(
                  "p-2.5 rounded-2xl border text-left text-xs transition-all",
                  isSelected
                    ? "bg-[#F0FAF5] border-brand-mint-400 text-brand-forest-900 font-bold shadow-xs"
                    : "bg-white border-brand-forest-700/10 text-brand-forest-700/80 hover:bg-slate-50"
                )}
              >
                <span>{p.label}</span>
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
