"use client";

import * as React from "react";
import { AeroMascot } from "../aero-mascot";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { OnboardingState } from "@/types/onboarding";
import { cn } from "@/lib/utils";

const HOME_TYPES = [
  { id: "apartment_highrise", label: "High-Rise Apartment (Floor 5+)", desc: "Less road dust, but higher wind drafts" },
  { id: "apartment_lowrise", label: "Low-Rise Apartment (Floors 1-4)", desc: "Closer to vehicular and street-level PM2.5" },
  { id: "independent_house", label: "Independent House / Villa", desc: "Larger volume, multiple entry air leakages" },
  { id: "townhouse", label: "Townhouse / Duplex", desc: "Multi-level airflow and stairwell drafts" },
];

const VENTILATION_TYPES = [
  { id: "cross_breeze_windows", label: "Cross-Breeze Windows", desc: "Can flush air quickly during 2 PM safe windows" },
  { id: "balcony_sliding", label: "Balcony Sliding Doors", desc: "Large opening, fast air exchange" },
  { id: "central_hvac", label: "Central HVAC with Filters", desc: "Ducted filtered airflow" },
  { id: "sealed_windows", label: "Tightly Sealed Windows", desc: "Blocks smog, but CO2 accumulates quickly" },
];

const COOKING_FUELS = [
  { id: "induction_electric", label: "Induction / Electric", desc: "Zero indoor nitrogen dioxide (NO2) emissions" },
  { id: "piped_gas", label: "Piped Natural Gas (PNG)", desc: "Moderate NO2 & ultrafine cooking emissions" },
  { id: "lpg_cylinder", label: "LPG Gas Cylinder", desc: "Requires steady kitchen exhaust during cooking" },
];

const PURIFIERS = [
  { id: "all_rooms", label: "Purifiers in All Key Rooms", desc: "Bedrooms and living room protected" },
  { id: "single_unit", label: "1 Shared Air Purifier Unit", desc: "Moved between living room and bedroom" },
  { id: "planning_to_buy", label: "Planning to Buy Soon", desc: "Looking for CADR and room-size guidance" },
  { id: "none", label: "No Air Purifiers Yet", desc: "Relying on clean-air habits and masking" },
];

const BUDGETS = [
  { id: "free_habits", label: "Zero-Cost Habits Only", desc: "Timed window flushing & DIY drafts blocking" },
  { id: "low_masks_plants", label: "Low (₹1k – ₹3k)", desc: "N95 masks and air-purifying indoor plants" },
  { id: "moderate_purifiers", label: "Moderate (₹10k – ₹25k)", desc: "Quality HEPA air purifiers and replacement filters" },
  { id: "high_smart_filtration", label: "Comprehensive (₹30k+)", desc: "Laser sensors, smart purifiers in all rooms" },
];

export function StepHome({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: {
  data: OnboardingState["homeEnvironment"];
  onChange: (homeEnvironment: OnboardingState["homeEnvironment"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <AeroMascot mood="home" size="md" />
        <h2 className="text-2xl sm:text-3xl font-black text-brand-forest-900">
          Your Indoor Sanctuary
        </h2>
        <p className="text-xs sm:text-sm text-brand-forest-800/70 max-w-md">
          Urban families spend 90% of their time indoors. Let&apos;s evaluate your home air dynamics and purifier needs.
        </p>
      </div>

      {/* Home Type */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-800">
          Type of Dwelling
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {HOME_TYPES.map((h) => {
            const isSelected = data.homeType === h.id;
            return (
              <div
                key={h.id}
                onClick={() => onChange({ ...data, homeType: h.id as any })}
                className={cn(
                  "p-3 rounded-2xl border text-left cursor-pointer transition-all",
                  isSelected
                    ? "bg-[#F0FAF5] border-brand-mint-400 shadow-xs"
                    : "bg-white border-brand-forest-700/10 hover:bg-slate-50"
                )}
              >
                <h6 className="text-xs font-bold text-brand-forest-900 leading-tight">{h.label}</h6>
                <p className="text-[10px] text-brand-forest-700/60 leading-tight mt-0.5">{h.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ventilation & Cooking Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ventilation Type */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-800">
            Home Ventilation
          </span>
          <div className="space-y-2">
            {VENTILATION_TYPES.map((v) => {
              const isSelected = data.ventilationType === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => onChange({ ...data, ventilationType: v.id as any })}
                  className={cn(
                    "p-2.5 rounded-2xl border text-left cursor-pointer transition-all",
                    isSelected
                      ? "bg-[#F0F9FF] border-brand-sky-300 shadow-xs"
                      : "bg-white border-brand-forest-700/10 hover:bg-slate-50"
                  )}
                >
                  <h6 className="text-xs font-bold text-brand-forest-900 leading-tight">{v.label}</h6>
                  <p className="text-[10px] text-brand-forest-700/60 leading-tight mt-0.5">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cooking Fuel */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-800">
            Kitchen Cooking Fuel
          </span>
          <div className="space-y-2">
            {COOKING_FUELS.map((fuel) => {
              const isSelected = data.cookingFuel === fuel.id;
              return (
                <div
                  key={fuel.id}
                  onClick={() => onChange({ ...data, cookingFuel: fuel.id as any })}
                  className={cn(
                    "p-2.5 rounded-2xl border text-left cursor-pointer transition-all",
                    isSelected
                      ? "bg-[#FFF8E8] border-brand-cream-300 shadow-xs"
                      : "bg-white border-brand-forest-700/10 hover:bg-slate-50"
                  )}
                >
                  <h6 className="text-xs font-bold text-brand-forest-900 leading-tight">{fuel.label}</h6>
                  <p className="text-[10px] text-brand-forest-700/60 leading-tight mt-0.5">{fuel.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Purifiers Availability */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-800">
          Air Purifiers in Home
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PURIFIERS.map((p) => {
            const isSelected = data.purifierAvailability === p.id;
            return (
              <div
                key={p.id}
                onClick={() => onChange({ ...data, purifierAvailability: p.id as any })}
                className={cn(
                  "p-3 rounded-2xl border text-left cursor-pointer transition-all",
                  isSelected
                    ? "bg-[#F0FAF5] border-brand-mint-400 shadow-xs"
                    : "bg-white border-brand-forest-700/10 hover:bg-slate-50"
                )}
              >
                <h6 className="text-xs font-bold text-brand-forest-900 leading-tight">{p.label}</h6>
                <p className="text-[10px] text-brand-forest-700/60 leading-tight mt-0.5">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget for Clean Air */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-800">
          Clean Air Improvement Budget
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BUDGETS.map((b) => {
            const isSelected = data.improvementBudget === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onChange({ ...data, improvementBudget: b.id as any })}
                className={cn(
                  "p-2.5 rounded-2xl border text-left transition-all",
                  isSelected
                    ? "bg-brand-mint text-brand-forest-900 font-bold border-brand-mint-400 shadow-xs"
                    : "bg-white text-brand-forest-800 border-brand-forest-700/10 hover:bg-slate-50"
                )}
              >
                <h6 className="text-xs font-bold leading-tight">{b.label}</h6>
                <p className="text-[9px] text-brand-forest-700/70 leading-tight mt-0.5">{b.desc}</p>
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
