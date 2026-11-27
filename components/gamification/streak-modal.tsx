"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AeroMascot } from "@/components/onboarding/aero-mascot";
import { ConfettiBurst } from "@/components/gamification/confetti-burst";
import { Flame, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

export interface StreakModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streakDays: number;
  multiplierText?: string;
  bonusXp?: number;
}

export function StreakModal({
  open,
  onOpenChange,
  streakDays = 7,
  multiplierText = "2x Streak Multiplier Active",
  bonusXp = 35,
}: StreakModalProps) {
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
      <ConfettiBurst active={showConfetti} count={45} />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-2 border-amber-300 rounded-3xl bg-gradient-to-b from-[#FFFDF6] via-[#FFF8E8] to-white shadow-2xl">
          <div className="relative p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
            {/* Header Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <Badge variant="yellow" className="px-3 py-1 font-black text-xs gap-1.5 shadow-sm">
                <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>STREAK CELEBRATION!</span>
              </Badge>
            </motion.div>

            {/* Aero Celebrating Mascot */}
            <motion.div
              initial={{ scale: 0.7, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
              className="py-1"
            >
              <AeroMascot mood="celebrating" size="lg" />
            </motion.div>

            {/* Streak Number & Title */}
            <div className="space-y-1">
              <DialogTitle className="text-3xl sm:text-4xl font-black text-brand-forest-900 tracking-tight flex items-center justify-center gap-2">
                <span className="text-amber-500">🔥</span>
                <span>{streakDays} Day Streak!</span>
              </DialogTitle>
              <DialogDescription className="sr-only">
                You have maintained continuous clean air habits for {streakDays} days!
              </DialogDescription>
              <p className="text-xs sm:text-sm font-bold text-amber-800">
                You have maintained continuous clean air habits for {streakDays} days!
              </p>
            </div>

            {/* Multiplier & Bonus Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="w-full rounded-2xl bg-white/90 border-2 border-amber-200/90 p-4 text-center shadow-xs space-y-1.5"
            >
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                {multiplierText}
              </span>
              <div className="flex items-center justify-center gap-2 text-sm font-extrabold text-emerald-800">
                <Zap className="h-4 w-4 fill-emerald-600 text-emerald-600" />
                <span>Bonus +{bonusXp} XP Awarded</span>
              </div>
              <p className="text-[11px] text-brand-forest-700/80 leading-relaxed pt-1">
                Streak freezes protect your habit chain if you miss a day due to travel.
              </p>
            </motion.div>

            {/* Action Button */}
            <Button
              variant="forest"
              size="lg"
              onClick={() => onOpenChange(false)}
              className="w-full font-bold gap-2 text-sm shadow-md h-11"
            >
              <span>Keep the Streak Burning</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
