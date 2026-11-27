"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AeroMascot } from "@/components/onboarding/aero-mascot";
import { ConfettiBurst } from "@/components/gamification/confetti-burst";
import { Trophy, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

export interface LevelUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newLevel: number;
  levelTitle: string;
  perkDescription: string;
  icon?: string;
}

export function LevelUpModal({
  open,
  onOpenChange,
  newLevel,
  levelTitle,
  perkDescription,
  icon = "🏰",
}: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setShowConfetti(true);
    } else {
      setShowConfetti(false);
    }
  }, [open]);

  return (
    <>
      <ConfettiBurst active={showConfetti} count={50} />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-2 border-amber-300 rounded-3xl bg-gradient-to-b from-[#FFFDF6] via-[#FFF9E6] to-white shadow-2xl">
          <div className="relative p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
            {/* Header Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <Badge variant="yellow" className="px-3 py-1 font-black text-xs gap-1.5 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>LEVEL UP ACHIEVED!</span>
              </Badge>
            </motion.div>

            {/* Aero Level-Up Mascot */}
            <motion.div
              initial={{ scale: 0.7, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
              className="py-2"
            >
              <AeroMascot mood="level_up" size="lg" />
            </motion.div>

            {/* Level Information */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">{icon}</span>
                <DialogTitle className="text-2xl sm:text-3xl font-black text-brand-forest-900 tracking-tight">
                  Level {newLevel} Reached!
                </DialogTitle>
              </div>
              <h4 className="text-base sm:text-lg font-extrabold text-amber-800">
                {levelTitle}
              </h4>
            </div>

            {/* Unlocked Perk Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="w-full rounded-2xl bg-white/90 border-2 border-amber-200/80 p-4 text-left shadow-xs space-y-2"
            >
              <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-900 tracking-wider">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>New Clean Air Perk Unlocked</span>
              </div>
              <p className="text-xs text-brand-forest-800 font-medium leading-relaxed">
                {perkDescription}
              </p>
            </motion.div>

            {/* Safety Banner */}
            <div className="w-full rounded-xl bg-emerald-50 border border-emerald-200/80 p-2.5 text-[11px] text-emerald-900 font-semibold flex items-center justify-center gap-2">
              <Zap className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
              <span>XP awarded purely for honest protective habits and air shielding.</span>
            </div>

            {/* Action Button */}
            <Button
              variant="forest"
              size="lg"
              onClick={() => onOpenChange(false)}
              className="w-full font-bold gap-2 text-sm shadow-md h-11"
            >
              <span>Continue Clean Air Mission</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
