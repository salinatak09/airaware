"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Flame, Trophy, Check, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { PlanMission } from "@/types/api";

export interface DailyMissionsWidgetProps {
  planId?: string;
  missions?: PlanMission[];
  currentXp?: number;
  maxXp?: number;
  level?: number;
  levelTitle?: string;
  streakDays?: number;
  onToggleMission?: (missionId: string, currentStatus: boolean) => Promise<void> | void;
  isLoading?: boolean;
  className?: string;
}

const DEFAULT_FALLBACK_MISSIONS: PlanMission[] = [
  {
    missionId: "m-1",
    time: "07:30 AM",
    title: "Check morning AQI before commute",
    description: "Check the local air quality readings before leaving home",
    whyItMatters: "Allows selecting the optimal protection gear and route",
    priority: "high",
    estimatedDuration: "2 min",
    category: "habit",
    xpReward: 30,
    completed: true,
  },
  {
    missionId: "m-2",
    time: "08:15 AM",
    title: "Wear N95 on school / work commute",
    description: "Protect lungs during morning peak traffic hours",
    whyItMatters: "Filters up to 95% of fine toxic PM2.5 particulates",
    priority: "high",
    estimatedDuration: "30 min",
    category: "protection",
    xpReward: 40,
    completed: false,
  },
  {
    missionId: "m-3",
    time: "02:00 PM",
    title: "Activate 2:00 PM room cross-ventilation",
    description: "Open windows during diurnal boundary layer dispersion",
    whyItMatters: "Exchanges stale indoor CO2 when outdoor PM2.5 drops by 60%",
    priority: "medium",
    estimatedDuration: "20 min",
    category: "indoor",
    xpReward: 50,
    completed: false,
  },
  {
    missionId: "m-4",
    time: "05:00 PM",
    title: "Drink 2L water for mucosal hydration",
    description: "Keep respiratory mucous membranes hydrated",
    whyItMatters: "Supports natural ciliary clearance of inhaled particulate matter",
    priority: "low",
    estimatedDuration: "5 min",
    category: "habit",
    xpReward: 20,
    completed: false,
  },
];

export function DailyMissionsWidget({
  planId,
  missions: propMissions,
  currentXp = 340,
  maxXp = 500,
  level = 4,
  levelTitle = "Clean Air Guardian",
  streakDays = 7,
  onToggleMission,
  isLoading = false,
  className,
}: DailyMissionsWidgetProps) {
  const { toast } = useToast();
  const [localMissions, setLocalMissions] = React.useState<PlanMission[]>(
    propMissions && propMissions.length > 0 ? propMissions : DEFAULT_FALLBACK_MISSIONS
  );
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (propMissions && propMissions.length > 0) {
      setLocalMissions(propMissions);
    }
  }, [propMissions]);

  const handleToggle = async (mission: PlanMission) => {
    if (updatingId) return;
    setUpdatingId(mission.missionId);

    const nextCompleted = !mission.completed;

    // Optimistic UI update
    setLocalMissions((prev) =>
      prev.map((m) =>
        m.missionId === mission.missionId ? { ...m, completed: nextCompleted } : m
      )
    );

    try {
      if (onToggleMission) {
        await onToggleMission(mission.missionId, mission.completed);
      } else {
        // Fallback toast if standalone
        if (nextCompleted) {
          toast({
            type: "success",
            title: `Mission Completed! +${mission.xpReward} XP`,
            message: `"${mission.title}" marked done. Keep the streak burning!`,
          });
        }
      }
    } catch (err: any) {
      // Revert optimistic update on failure
      setLocalMissions((prev) =>
        prev.map((m) =>
          m.missionId === mission.missionId ? { ...m, completed: mission.completed } : m
        )
      );
      toast({
        type: "error",
        title: "Action Failed",
        message: err.message || "Could not update mission status.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const progressPercent = Math.min(100, Math.round((currentXp / Math.max(maxXp, 1)) * 100));
  const activeMissions = localMissions.slice(0, 4);
  const allCompleted = activeMissions.length > 0 && activeMissions.every((m) => m.completed);

  return (
    <Card
      className={cn(
        "p-6 bg-white border-2 border-brand-forest-700/10 shadow-card flex flex-col justify-between",
        className
      )}
    >
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
            <span>
              {currentXp} / {maxXp} XP
            </span>
          </Badge>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-brand-forest-800">
            <span>Level {level} Progress</span>
            <span>{Math.max(0, maxXp - currentXp)} XP to Level {level + 1}</span>
          </div>
          <ProgressBar value={progressPercent} variant="yellow" />
        </div>

        {/* Missions Checklist */}
        <div className="mt-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-800 block">
              Today&apos;s Clean Air Missions
            </span>
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-forest-700/50" />}
          </div>

          <div className="space-y-2">
            {activeMissions.map((m) => {
              const isUpdating = updatingId === m.missionId;
              return (
                <div
                  key={m.missionId}
                  onClick={() => handleToggle(m)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none",
                    m.completed
                      ? "bg-[#F0FAF5] border-brand-mint-300 text-brand-forest-900 shadow-xs"
                      : "bg-white border-brand-forest-700/10 hover:border-brand-mint-200 hover:bg-slate-50",
                    isUpdating && "opacity-60 pointer-events-none"
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
                      {isUpdating ? (
                        <Loader2 className="h-3 w-3 animate-spin text-brand-forest-700" />
                      ) : (
                        m.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />
                      )}
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
                      <span className="text-[10px] text-brand-forest-700/60 font-medium capitalize">
                        {m.time} • {m.category}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={m.completed ? "mint" : "yellow"}
                    className="text-[10px] font-bold shrink-0"
                  >
                    +{m.xpReward} XP
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-brand-mint-100 flex items-center justify-between text-[11px] text-brand-forest-700/70 font-semibold">
        <span>
          {allCompleted
            ? "🎉 All daily missions completed! 2x streak active!"
            : "Complete daily missions for streak bonuses"}
        </span>
        <Sparkles className="h-4 w-4 text-amber-500" />
      </div>
    </Card>
  );
}
