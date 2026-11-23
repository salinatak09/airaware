"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Flame, Trophy, Check, Sparkles, Award } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface Mission {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
  category: string;
}

export function DailyMissionsWidget({
  currentXp = 340,
  maxXp = 500,
  level = 4,
  levelTitle = "Clean Air Guardian",
  streakDays = 7,
  className,
}: {
  currentXp?: number;
  maxXp?: number;
  level?: number;
  levelTitle?: string;
  streakDays?: number;
  className?: string;
}) {
  const { toast } = useToast();
  const [xp, setXp] = React.useState(currentXp);
  const [missions, setMissions] = React.useState<Mission[]>([
    { id: "m-1", title: "Check morning AQI before commute", xp: 30, completed: true, category: "Daily Habit" },
    { id: "m-2", title: "Wear N95 on school / work commute", xp: 40, completed: false, category: "Protection" },
    { id: "m-3", title: "Activate 2:00 PM room cross-ventilation", xp: 50, completed: false, category: "Sanctuary" },
    { id: "m-4", title: "Drink 2L water for respiratory mucosal hydration", xp: 20, completed: false, category: "Wellness" },
  ]);

  const toggleMission = (id: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const nextState = !m.completed;
        const delta = nextState ? m.xp : -m.xp;
        setXp((curr) => Math.min(maxXp, Math.max(0, curr + delta)));

        if (nextState) {
          toast({
            type: "success",
            title: `Mission Completed! +${m.xp} XP`,
            message: `"${m.title}" marked done. Keep the streak burning!`,
          });
        }
        return { ...m, completed: nextState };
      })
    );
  };

  const progressPercent = Math.round((xp / maxXp) * 100);

  return (
    <Card className={cn("p-6 bg-white border-2 border-brand-forest-700/10 shadow-card flex flex-col justify-between", className)}>
      <div>
        {/* Header Strip with Streak and Level */}
        <div className="flex items-center justify-between pb-4 border-b border-brand-mint-100">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 font-black text-sm">
              <Flame className="h-5 w-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-brand-forest-900">
                  {streakDays} Day Streak!
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 rounded px-1.5 py-0.2">
                  HOT
                </span>
              </div>
              <span className="text-xs text-brand-forest-700/60 font-semibold">
                Level {level}: {levelTitle}
              </span>
            </div>
          </div>

          <Badge variant="yellow" className="text-xs font-bold gap-1">
            <Trophy className="h-3.5 w-3.5" />
            <span>{xp} / {maxXp} XP</span>
          </Badge>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-brand-forest-800">
            <span>Level {level} Progress</span>
            <span>{maxXp - xp} XP to Level {level + 1}</span>
          </div>
          <ProgressBar value={progressPercent} variant="yellow" />
        </div>

        {/* Missions Checklist */}
        <div className="mt-5 space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-800 block">
            Today&apos;s Clean Air Missions
          </span>

          <div className="space-y-2">
            {missions.map((m) => (
              <div
                key={m.id}
                onClick={() => toggleMission(m.id)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer",
                  m.completed
                    ? "bg-[#F0FAF5] border-brand-mint-300 text-brand-forest-900 shadow-xs"
                    : "bg-white border-brand-forest-700/10 hover:border-brand-mint-200 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition-colors",
                      m.completed
                        ? "bg-brand-forest border-brand-forest text-white"
                        : "border-brand-forest-700/30 bg-white"
                    )}
                  >
                    {m.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span
                      className={cn(
                        "text-xs font-bold block leading-tight",
                        m.completed ? "line-through opacity-70" : "text-brand-forest-900"
                      )}
                    >
                      {m.title}
                    </span>
                    <span className="text-[10px] text-brand-forest-700/60 font-medium">{m.category}</span>
                  </div>
                </div>

                <Badge variant={m.completed ? "mint" : "yellow"} className="text-[10px] font-bold shrink-0">
                  +{m.xp} XP
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-brand-mint-100 flex items-center justify-between text-[11px] text-brand-forest-700/70 font-semibold">
        <span>Complete all 4 missions for a 2x Streak Multiplier</span>
        <Sparkles className="h-4 w-4 text-amber-500" />
      </div>
    </Card>
  );
}
