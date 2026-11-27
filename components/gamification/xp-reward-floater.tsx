"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sparkles } from "lucide-react";

export interface XpFloatEvent {
  id: string;
  amount: number;
  label?: string;
}

export function XpRewardFloater({
  events,
  onDismiss,
}: {
  events: XpFloatEvent[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-12 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.9 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            onAnimationComplete={() => {
              setTimeout(() => onDismiss(event.id), 2500);
            }}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-white shadow-lg border border-amber-300/40"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <Zap className="h-3.5 w-3.5 fill-white text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black leading-none">+{event.amount} XP</span>
              {event.label && (
                <span className="text-[10px] font-semibold text-amber-100 mt-0.5 truncate max-w-[180px]">
                  {event.label}
                </span>
              )}
            </div>
            <Sparkles className="h-4 w-4 text-amber-200 animate-pulse ml-1" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
