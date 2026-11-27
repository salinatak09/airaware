"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AeroMascot } from "@/components/onboarding/aero-mascot";
import { ConfettiBurst } from "@/components/gamification/confetti-burst";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export interface BadgeUnlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    tier: "bronze" | "silver" | "gold" | "platinum";
    earnedDate?: string;
  } | null;
}

export function BadgeUnlockModal({
  open,
  onOpenChange,
  badge,
}: BadgeUnlockModalProps) {
  const [showConfetti, setShowConfetti] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setShowConfetti(true);
    } else {
      setShowConfetti(false);
    }
  }, [open]);

  if (!badge) return null;

  const tierColors = {
    bronze: "from-amber-700 to-amber-900 border-amber-600 text-amber-100",
    silver: "from-slate-400 to-slate-600 border-slate-300 text-slate-100",
    gold: "from-amber-400 to-amber-600 border-amber-300 text-amber-950",
    platinum: "from-cyan-400 to-indigo-600 border-cyan-200 text-white",
  };

  return (
    <>
      <ConfettiBurst active={showConfetti} count={40} />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-2 border-brand-mint-300 rounded-3xl bg-gradient-to-b from-[#FFFDF6] via-[#F0FAF5] to-white shadow-2xl">
          <div className="relative p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
            {/* Header Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <Badge variant="mint" className="px-3 py-1 font-black text-xs gap-1.5 shadow-sm uppercase">
                <Sparkles className="h-3.5 w-3.5 text-brand-forest-800" />
                <span>NEW BADGE UNLOCKED!</span>
              </Badge>
            </motion.div>

            {/* Aero Mission Completed Mascot */}
            <motion.div
              initial={{ scale: 0.7, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
              className="py-1"
            >
              <AeroMascot mood="mission_completed" size="lg" />
            </motion.div>

            {/* Glowing Badge Card */}
            <motion.div
              initial={{ scale: 0.8, rotateY: 90 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`w-full rounded-2xl bg-gradient-to-br ${tierColors[badge.tier]} p-5 text-center shadow-lg border-2 space-y-2`}
            >
              <span className="text-4xl block select-none drop-shadow-md">{badge.icon}</span>
              <DialogTitle className="text-xl font-black tracking-tight text-white drop-shadow-sm">
                {badge.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-white/90 font-medium leading-relaxed pt-1">
                {badge.description}
              </DialogDescription>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-black/20 text-white">
                  {badge.tier} Tier
                </span>
              </div>
            </motion.div>

            {/* Honest Behavior Notice */}
            <p className="text-[11px] text-brand-forest-700/80 font-medium">
              Earned for maintaining verified clean air protection habits and household shielding.
            </p>

            {/* Action Button */}
            <Button
              variant="forest"
              size="lg"
              onClick={() => onOpenChange(false)}
              className="w-full font-bold gap-2 text-sm shadow-md h-11"
            >
              <span>Add to Family Showcase</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
