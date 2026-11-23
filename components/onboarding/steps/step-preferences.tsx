"use client";

import * as React from "react";
import { AeroMascot } from "../aero-mascot";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { OnboardingState } from "@/types/onboarding";
import { cn } from "@/lib/utils";

export function StepPreferences({
  data,
  onChange,
  onFinish,
  onBack,
  isSubmitting = false,
}: {
  data: OnboardingState["preferences"];
  onChange: (prefs: OnboardingState["preferences"]) => void;
  onFinish: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}) {
  const toggleNotification = (key: keyof OnboardingState["preferences"]["notifications"]) => {
    onChange({
      ...data,
      notifications: {
        ...data.notifications,
        [key]: !data.notifications[key],
      },
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <AeroMascot mood="preferences" size="md" />
        <h2 className="text-2xl sm:text-3xl font-black text-brand-forest-900">
          Personalize Your Shield
        </h2>
        <p className="text-xs sm:text-sm text-brand-forest-800/70 max-w-md">
          Control how and when Aero alerts your family, your preferred language, and data privacy options.
        </p>
      </div>

      {/* Notification Preferences */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-800">
          Smart Health Notifications
        </span>

        <div className="space-y-2">
          {[
            {
              key: "morningBriefing",
              title: "7:00 AM Morning Smog Briefing",
              desc: "Know whether Aarav needs an N95 mask before leaving for the bus.",
            },
            {
              key: "afternoonVentilationWindow",
              title: "Optimal 2:00 PM Window Flush Reminder",
              desc: "Alerts you during the diurnal minimum to refresh indoor stale air.",
            },
            {
              key: "severeSpikesAlert",
              title: "Urgent Smog & Burning Spikes (AQI > 200)",
              desc: "Immediate advisory if local neighborhood sensor records sudden smoke.",
            },
            {
              key: "filterWashReminders",
              title: "Air Purifier Filter Maintenance",
              desc: "Monthly reminder to vacuum pre-filter mesh and check HEPA life.",
            },
          ].map((item) => {
            const isEnabled = (data.notifications as any)[item.key];
            return (
              <div
                key={item.key}
                onClick={() => toggleNotification(item.key as any)}
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer",
                  isEnabled
                    ? "bg-[#F0FAF5] border-brand-mint-300 shadow-xs"
                    : "bg-white border-brand-forest-700/10 hover:bg-slate-50"
                )}
              >
                <div className="pr-3">
                  <h6 className="text-xs font-bold text-brand-forest-900">{item.title}</h6>
                  <p className="text-[10px] text-brand-forest-700/60 leading-tight mt-0.5">{item.desc}</p>
                </div>

                <div
                  className={cn(
                    "h-5 w-9 shrink-0 rounded-full transition-colors relative flex items-center p-0.5",
                    isEnabled ? "bg-brand-forest" : "bg-slate-200"
                  )}
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full bg-white shadow-xs transition-transform",
                      isEnabled ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Language & Units Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Preferred Language */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-800">
            Preferred Language
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "en", label: "English" },
              { id: "hi", label: "हिंदी (Hindi)" },
              { id: "es", label: "Español" },
              { id: "fr", label: "Français" },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => onChange({ ...data, preferredLanguage: lang.id as any })}
                className={cn(
                  "p-2.5 rounded-2xl border text-xs font-bold transition-all text-center",
                  data.preferredLanguage === lang.id
                    ? "bg-brand-mint text-brand-forest-900 border-brand-mint-400 shadow-xs"
                    : "bg-white text-brand-forest-700 border-brand-forest-700/10 hover:bg-slate-50"
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Units / Standards */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-800">
            AQI & Temp Units
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...data, aqiStandard: "us_aqi" })}
              className={cn(
                "p-2 rounded-2xl border text-xs font-bold transition-all text-center",
                data.aqiStandard === "us_aqi"
                  ? "bg-brand-cream-300 text-amber-950 border-brand-cream-400 shadow-xs"
                  : "bg-white text-brand-forest-700 border-brand-forest-700/10"
              )}
            >
              US EPA AQI (0-500)
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...data, aqiStandard: "european_aqi" })}
              className={cn(
                "p-2 rounded-2xl border text-xs font-bold transition-all text-center",
                data.aqiStandard === "european_aqi"
                  ? "bg-brand-cream-300 text-amber-950 border-brand-cream-400 shadow-xs"
                  : "bg-white text-brand-forest-700 border-brand-forest-700/10"
              )}
            >
              European CAQI
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...data, temperatureUnit: "celsius" })}
              className={cn(
                "p-2 rounded-2xl border text-xs font-bold transition-all text-center",
                data.temperatureUnit === "celsius"
                  ? "bg-brand-sky text-sky-950 border-brand-sky-300 shadow-xs"
                  : "bg-white text-brand-forest-700 border-brand-forest-700/10"
              )}
            >
              Celsius (°C)
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...data, temperatureUnit: "fahrenheit" })}
              className={cn(
                "p-2 rounded-2xl border text-xs font-bold transition-all text-center",
                data.temperatureUnit === "fahrenheit"
                  ? "bg-brand-sky text-sky-950 border-brand-sky-300 shadow-xs"
                  : "bg-white text-brand-forest-700 border-brand-forest-700/10"
              )}
            >
              Fahrenheit (°F)
            </button>
          </div>
        </div>
      </div>

      {/* Transparent Privacy Consent Checkbox */}
      <div
        onClick={() => onChange({ ...data, privacyConsent: !data.privacyConsent })}
        className="rounded-2xl bg-[#FFFDF6] p-3.5 border border-brand-cream-300 flex items-start gap-3 cursor-pointer text-left"
      >
        <div
          className={cn(
            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border",
            data.privacyConsent
              ? "bg-brand-forest border-brand-forest text-white"
              : "border-slate-300 bg-white"
          )}
        >
          {data.privacyConsent && <ShieldCheck className="h-3 w-3 stroke-[3]" />}
        </div>
        <div className="text-xs text-brand-forest-900 leading-snug">
          <span className="font-bold">Privacy First & On-Device Control</span>
          <p className="text-[11px] text-brand-forest-800/80 mt-0.5">
            Your family health conditions and schedules are stored securely on your device. AirAware never sells private biometric or GPS records.
          </p>
        </div>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 font-bold">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>

        <Button
          variant="forest"
          size="lg"
          onClick={onFinish}
          isLoading={isSubmitting}
          className="gap-2 font-bold px-8 shadow-md"
        >
          <Sparkles className="h-4 w-4 fill-brand-mint text-brand-mint" />
          <span>Complete Setup & Start</span>
        </Button>
      </div>
    </div>
  );
}
