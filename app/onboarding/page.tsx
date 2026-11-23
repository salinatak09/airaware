"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Wind } from "lucide-react";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { StepWelcome } from "@/components/onboarding/steps/step-welcome";
import { StepLocation } from "@/components/onboarding/steps/step-location";
import { StepHousehold } from "@/components/onboarding/steps/step-household";
import { StepLifestyle } from "@/components/onboarding/steps/step-lifestyle";
import { StepHome } from "@/components/onboarding/steps/step-home";
import { StepPreferences } from "@/components/onboarding/steps/step-preferences";
import { OnboardingState, INITIAL_ONBOARDING_STATE } from "@/types/onboarding";
import { useToast } from "@/components/ui/toast";
import { useShell } from "@/components/layout/shell-context";

const STORAGE_KEY = "airaware_onboarding_state";
const COMPLETED_KEY = "airaware_onboarding_completed";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setCurrentLocation } = useShell();

  const [formData, setFormData] = React.useState<OnboardingState>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load onboarding cache", e);
      }
    }
    return INITIAL_ONBOARDING_STATE;
  });

  const [isFinishing, setIsFinishing] = React.useState(false);

  // Sync to local storage on state change
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (e) {
      console.error("Failed to save onboarding cache", e);
    }
  }, [formData]);

  const handleNext = () => {
    setFormData((prev) => ({ ...prev, step: Math.min(6, prev.step + 1) }));
  };

  const handleBack = () => {
    setFormData((prev) => ({ ...prev, step: Math.max(1, prev.step - 1) }));
  };

  const handleStepJump = (targetStep: number) => {
    setFormData((prev) => ({ ...prev, step: targetStep }));
  };

  const handleSkip = () => {
    try {
      localStorage.setItem(COMPLETED_KEY, "true");
    } catch {}
    toast({
      type: "info",
      title: "Welcome to AirAware!",
      message: "You can update your family profile anytime in Settings.",
    });
    router.push("/");
  };

  const handleFinish = () => {
    setIsFinishing(true);
    try {
      localStorage.setItem(COMPLETED_KEY, "true");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));

      // Sync selected city to shell context
      if (formData.location?.city) {
        setCurrentLocation({
          id: "custom-user-loc",
          city: formData.location.city,
          area: formData.location.area || formData.location.city,
          aqi: 142,
          pm25: 42.1,
          status: "Sensitive",
          isHome: true,
        });
      }
    } catch {}

    toast({
      type: "success",
      title: "Setup Complete! 🎉",
      message: "Your family air shield is now active. Welcome to AirAware!",
    });

    setTimeout(() => {
      router.push("/");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F7FAF7] text-brand-forest-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-mint text-brand-forest-900 shadow-xs">
            <Wind className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span className="text-lg font-black tracking-tight text-brand-forest-900">
            AirAware
          </span>
        </div>

        {formData.step > 1 && (
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-bold text-brand-forest-700/70 hover:text-brand-forest-900 hover:underline transition-colors"
          >
            Skip to Dashboard
          </button>
        )}
      </header>

      {/* Main Form Card Container */}
      <main className="max-w-2xl w-full mx-auto my-auto">
        {/* Step Indicator (Visible for steps 2 to 6) */}
        {formData.step > 1 && (
          <div className="mb-6">
            <StepIndicator
              currentStep={formData.step}
              totalSteps={6}
              onStepClick={handleStepJump}
            />
          </div>
        )}

        <div className="rounded-3xl border-2 border-brand-mint-200/80 bg-white p-6 sm:p-10 shadow-soft">
          <AnimatePresence mode="wait">
            <motion.div
              key={formData.step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              {formData.step === 1 && (
                <StepWelcome onNext={handleNext} onSignIn={handleSkip} />
              )}

              {formData.step === 2 && (
                <StepLocation
                  data={formData.location}
                  onChange={(loc) => setFormData((prev) => ({ ...prev, location: loc }))}
                  onNext={handleNext}
                  onBack={handleBack}
                  onSkip={handleSkip}
                />
              )}

              {formData.step === 3 && (
                <StepHousehold
                  data={formData.household}
                  onChange={(h) => setFormData((prev) => ({ ...prev, household: h }))}
                  onNext={handleNext}
                  onBack={handleBack}
                  onSkip={handleSkip}
                />
              )}

              {formData.step === 4 && (
                <StepLifestyle
                  data={formData.lifestyle}
                  onChange={(l) => setFormData((prev) => ({ ...prev, lifestyle: l }))}
                  onNext={handleNext}
                  onBack={handleBack}
                  onSkip={handleSkip}
                />
              )}

              {formData.step === 5 && (
                <StepHome
                  data={formData.homeEnvironment}
                  onChange={(env) => setFormData((prev) => ({ ...prev, homeEnvironment: env }))}
                  onNext={handleNext}
                  onBack={handleBack}
                  onSkip={handleSkip}
                />
              )}

              {formData.step === 6 && (
                <StepPreferences
                  data={formData.preferences}
                  onChange={(p) => setFormData((prev) => ({ ...prev, preferences: p }))}
                  onFinish={handleFinish}
                  onBack={handleBack}
                  isSubmitting={isFinishing}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="text-center py-4 text-xs font-semibold text-brand-forest-700/50">
        AirAware © 2026 • Aero Clean Air Onboarding
      </footer>
    </div>
  );
}
