"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  Trophy,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  ShieldAlert,
  Flame,
  Home,
  Car,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  progress: number; // 0 - 100
  target: string;
  unlocked: boolean;
  category?: "habit" | "sanctuary" | "transit" | "community";
  xpReward?: number;
  icon?: string;
}

const DEFAULT_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: "ach-1",
    title: "Diurnal Master",
    description: "Check the local diurnal AQI inversion window for 7 consecutive days before commuting.",
    progress: 100,
    target: "7 / 7 Days",
    unlocked: true,
    category: "habit",
    xpReward: 100,
    icon: "🌅",
  },
  {
    id: "ach-2",
    title: "Sanctuary Builder",
    description: "Achieve and maintain an indoor sanctuary score of 80+ across 5 consecutive peak smog days.",
    progress: 80,
    target: "4 / 5 Days",
    unlocked: false,
    category: "sanctuary",
    xpReward: 150,
    icon: "🏰",
  },
  {
    id: "ach-3",
    title: "Clean Transit Pioneer",
    description: "Opt for closed AC transit or reroute to clean corridors 10 times during severe morning pollution.",
    progress: 60,
    target: "6 / 10 Commutes",
    unlocked: false,
    category: "transit",
    xpReward: 120,
    icon: "🚇",
  },
  {
    id: "ach-4",
    title: "Civic Air Guardian",
    description: "Submit 3 verified community reports of garbage burning or construction dust hotspots.",
    progress: 66,
    target: "2 / 3 Reports",
    unlocked: false,
    category: "community",
    xpReward: 100,
    icon: "📢",
  },
  {
    id: "ach-5",
    title: "HEPA Defender",
    description: "Log regular filter vacuuming and maintenance cycles for your family air purifier.",
    progress: 100,
    target: "Verified Active",
    unlocked: true,
    category: "sanctuary",
    xpReward: 80,
    icon: "🌀",
  },
  {
    id: "ach-6",
    title: "Breath of Life",
    description: "Complete your first clean air health check-in for all family members.",
    progress: 100,
    target: "Completed",
    unlocked: true,
    category: "habit",
    xpReward: 50,
    icon: "🌱",
  },
];

export function AchievementGallery({
  achievements = DEFAULT_ACHIEVEMENTS,
  onSelectAchievement,
  outdoorAqi = 185,
}: {
  achievements?: AchievementItem[];
  onSelectAchievement?: (ach: AchievementItem) => void;
  outdoorAqi?: number;
}) {
  const [selectedCategory, setSelectedCategory] = React.useState<
    "all" | "habit" | "sanctuary" | "transit" | "community"
  >("all");

  const isSevereAqi = outdoorAqi > 150;

  const categories = [
    { id: "all", label: "All Achievements", icon: Trophy },
    { id: "habit", label: "Daily Habits", icon: Flame },
    { id: "sanctuary", label: "Home Sanctuary", icon: Home },
    { id: "transit", label: "Clean Transit", icon: Car },
    { id: "community", label: "Community", icon: Users },
  ];

  const displayedList = achievements.filter((ach) => {
    if (selectedCategory === "all") return true;
    return (ach.category || "habit") === selectedCategory;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked || a.progress >= 100).length;

  return (
    <div className="space-y-6">
      {/* Category Filter Pills & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                  isActive
                    ? "bg-brand-forest-800 text-white shadow-xs"
                    : "bg-white text-brand-forest-800 hover:bg-slate-100 border border-brand-forest-700/10"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <Badge variant="yellow" className="text-xs font-bold gap-1 self-start sm:self-auto">
          <Sparkles className="h-3.5 w-3.5" />
          <span>
            {unlockedCount} / {achievements.length} Unlocked
          </span>
        </Badge>
      </div>

      {/* Strict Ethical Safety Notice */}
      {isSevereAqi && (
        <div className="rounded-2xl bg-amber-50 border-2 border-amber-200/90 p-4 text-xs text-amber-950 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-extrabold text-amber-900 block">
              Ethical Gamification Safety Guardrail:
            </strong>
            <p className="leading-relaxed text-amber-900/90">
              Outdoor pollution is elevated (AQI {outdoorAqi}). AirAware strictly forbids and never rewards strenuous outdoor workouts during smog episodes. Earn XP and complete achievements through indoor sanctuary defenses and protective gear only!
            </p>
          </div>
        </div>
      )}

      {/* Achievement Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {displayedList.map((ach) => {
          const isComplete = ach.unlocked || ach.progress >= 100;

          return (
            <motion.div
              key={ach.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
            >
              <Card
                onClick={() => onSelectAchievement?.(ach)}
                className={cn(
                  "p-5 border-2 transition-all cursor-pointer space-y-3.5 relative overflow-hidden",
                  isComplete
                    ? "bg-gradient-to-br from-white via-[#F0FAF5] to-[#E6F4EA] border-brand-mint-300 shadow-sm"
                    : "bg-white border-brand-forest-700/10 hover:border-brand-mint-200 shadow-xs"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-forest-50 border border-brand-mint-200 text-xl shadow-xs">
                      {ach.icon || "🎯"}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-brand-forest-900">
                          {ach.title}
                        </h4>
                        {isComplete ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-brand-forest-700/70 font-semibold block">
                        {ach.target}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={isComplete ? "mint" : "cream"}
                    className="text-[10px] font-black shrink-0"
                  >
                    +{ach.xpReward || 100} XP
                  </Badge>
                </div>

                <p className="text-xs text-brand-forest-800/80 leading-relaxed">
                  {ach.description}
                </p>

                {/* Progress Bar & Percentage */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-bold text-brand-forest-800">
                    <span>Progress</span>
                    <span>{ach.progress}%</span>
                  </div>
                  <ProgressBar
                    value={ach.progress}
                    variant={isComplete ? "forest" : "yellow"}
                  />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
