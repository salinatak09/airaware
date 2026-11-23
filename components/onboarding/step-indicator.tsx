"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  MapPin,
  Users,
  CalendarCheck,
  Home,
  Sliders,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

const STEP_LABELS = [
  { step: 1, title: "Welcome", icon: Sparkles },
  { step: 2, title: "Location", icon: MapPin },
  { step: 3, title: "Household", icon: Users },
  { step: 4, title: "Lifestyle", icon: CalendarCheck },
  { step: 5, title: "Home", icon: Home },
  { step: 6, title: "Preferences", icon: Sliders },
];

export function StepIndicator({
  currentStep,
  totalSteps = 6,
  onStepClick,
  className,
}: StepIndicatorProps) {
  const progressPercent = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Top Header with Step Counter */}
      <div className="flex items-center justify-between text-xs font-bold text-brand-forest-900">
        <span className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-mint text-[11px] font-black text-brand-forest-900">
            {currentStep}
          </span>
          <span>
            Step {currentStep} of {totalSteps}: {STEP_LABELS[currentStep - 1]?.title}
          </span>
        </span>
        <span className="text-brand-forest-700/60 font-semibold">{progressPercent}% Completed</span>
      </div>

      {/* Animated Multi-segment Progress Bar */}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-brand-mint-100 p-0.5">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-mint via-brand-forest-600 to-brand-forest"
          initial={false}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      {/* Step Pills for Tablet & Desktop */}
      <div className="hidden sm:grid grid-cols-6 gap-2 pt-1">
        {STEP_LABELS.map((item) => {
          const Icon = item.icon;
          const isDone = item.step < currentStep;
          const isCurrent = item.step === currentStep;

          return (
            <button
              key={item.step}
              type="button"
              disabled={!isDone && !isCurrent}
              onClick={() => onStepClick?.(item.step)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl py-1.5 px-2 text-[11px] font-bold transition-all select-none",
                isCurrent
                  ? "bg-brand-forest text-white shadow-xs"
                  : isDone
                  ? "bg-brand-mint-100 text-brand-forest-900 hover:bg-brand-mint-200 cursor-pointer"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
              )}
            >
              {isDone ? (
                <Check className="h-3 w-3 stroke-[3] text-brand-forest-800" />
              ) : (
                <Icon className="h-3 w-3" />
              )}
              <span className="truncate">{item.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
