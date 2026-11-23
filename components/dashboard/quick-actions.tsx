"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Bot,
  Fan,
  Compass,
  HeartPulse,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function QuickActions({ className }: { className?: string }) {
  const { toast } = useToast();
  const [symptomOpen, setSymptomOpen] = React.useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = React.useState<string[]>([]);

  const symptomList = [
    "Throat Scratchiness",
    "Dry Cough",
    "Eye Burning / Redness",
    "Shortness of Breath",
    "Inhaler Puff Used",
    "Headache from Smoke",
  ];

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const handleSaveSymptoms = () => {
    setSymptomOpen(false);
    toast({
      type: "success",
      title: "Health Log Recorded",
      message: `${selectedSymptoms.length} symptom(s) logged. Aero will monitor trends and alert pediatric advisor if frequency rises.`,
    });
    setSelectedSymptoms([]);
  };

  const handlePurifierBoost = () => {
    toast({
      type: "success",
      title: "Sanctuary Boost Activated",
      message: "Living Room & Nursery air purifiers increased to Turbo speed for 30 minutes.",
    });
  };

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
      <Link href="/my-day" className="w-full">
        <Button
          variant="forest"
          className="w-full h-auto py-3 px-3.5 flex flex-col items-center justify-center gap-1.5 rounded-2xl shadow-xs"
        >
          <CalendarCheck className="h-5 w-5" />
          <span className="text-xs font-bold leading-tight">Plan Outdoor Time</span>
        </Button>
      </Link>

      <Link href="/ai-buddy" className="w-full">
        <Button
          variant="soft"
          className="w-full h-auto py-3 px-3.5 flex flex-col items-center justify-center gap-1.5 rounded-2xl shadow-xs text-brand-forest-900"
        >
          <Bot className="h-5 w-5 text-brand-forest-800" />
          <span className="text-xs font-bold leading-tight">Ask AI Buddy</span>
        </Button>
      </Link>

      <Button
        variant="cream"
        onClick={handlePurifierBoost}
        className="w-full h-auto py-3 px-3.5 flex flex-col items-center justify-center gap-1.5 rounded-2xl shadow-xs text-brand-forest-900 border border-brand-cream-300"
      >
        <Fan className="h-5 w-5 text-amber-800" />
        <span className="text-xs font-bold leading-tight">Turbo Purifiers</span>
      </Button>

      <Dialog open={symptomOpen} onOpenChange={setSymptomOpen}>
        <DialogTrigger asChild>
          <Button
            variant="peach"
            className="w-full h-auto py-3 px-3.5 flex flex-col items-center justify-center gap-1.5 rounded-2xl shadow-xs text-brand-forest-900 border border-brand-peach-300"
          >
            <HeartPulse className="h-5 w-5 text-[#9A3412]" />
            <span className="text-xs font-bold leading-tight">Log Symptoms</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Family Symptom Check-In</DialogTitle>
            <DialogDescription>
              Record temporary respiratory irritation to help Aero calibrate air sensitivity warnings.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-3">
            {symptomList.map((sym) => {
              const isChecked = selectedSymptoms.includes(sym);
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => toggleSymptom(sym)}
                  className={cn(
                    "p-3 rounded-2xl border text-xs font-bold text-left transition-all",
                    isChecked
                      ? "bg-[#FFF5EF] border-brand-peach-400 text-brand-forest-900 shadow-xs"
                      : "bg-white border-brand-forest-700/10 text-brand-forest-800 hover:bg-slate-50"
                  )}
                >
                  {sym}
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              variant="forest"
              onClick={handleSaveSymptoms}
              disabled={selectedSymptoms.length === 0}
              className="font-bold w-full sm:w-auto"
            >
              Save Daily Symptom Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
