"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useShell } from "@/components/layout/shell-context";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  Sparkles,
  Flame,
  RotateCw,
  Calendar,
  Check,
  Info,
  Loader2,
  Sun,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTitle, Subtitle } from "@/components/ui/typography";
import { useToast } from "@/components/ui/toast";
import { getAqiTheme } from "@/lib/colors";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  useTodayPlanQuery,
  useGeneratePlanMutation,
  useUpdateMissionMutation,
} from "@/hooks/use-airaware-api";
import type { PlanMission, DailyPlanResponse } from "@/types/api";

type Mission = PlanMission;
type PlanData = DailyPlanResponse;

export default function MyDayPage() {
  const { currentLocation, activeFamilyMember } = useShell();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = React.useState<"all" | "active" | "completed">("all");

  // TanStack Query integration
  const {
    data: plan,
    isLoading,
    isError,
    error: loadError,
    refetch: refetchPlan,
  } = useTodayPlanQuery();

  const generatePlanMutation = useGeneratePlanMutation();
  const updateMissionMutation = useUpdateMissionMutation();

  // Reschedule state
  const [rescheduleMission, setRescheduleMission] = React.useState<Mission | null>(null);
  const [newRescheduledTime, setNewRescheduledTime] = React.useState("02:00 PM");

  const handleRegenerate = async () => {
    try {
      await generatePlanMutation.mutateAsync({
        forceRegenerate: true,
        currentAqi: currentLocation.aqi,
        city: currentLocation.city,
      });

      toast({
        type: "success",
        title: "Plan Regenerated",
        message: "A fresh personalized timeline has been compiled by Gemini.",
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Regeneration Failed",
        message: err.message || "Failed to regenerate plan.",
      });
    }
  };

  const handleCompleteMission = async (mission: Mission) => {
    if (!plan || mission.completed) return;

    try {
      const res = await updateMissionMutation.mutateAsync({
        planId: plan._id,
        missionId: mission.missionId,
        action: "complete",
      });

      toast({
        type: "success",
        title: "Mission Completed!",
        message: `Awesome! You earned +${res.xpAwarded} Clean Air XP.`,
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Update Failed",
        message: err.message || "Failed to update mission status.",
      });
    }
  };

  const handleSkipMission = async (mission: Mission) => {
    if (!plan) return;

    try {
      await updateMissionMutation.mutateAsync({
        planId: plan._id,
        missionId: mission.missionId,
        action: "skip",
      });

      toast({
        type: "info",
        title: "Mission Skipped",
        message: `"${mission.title}" marked as skipped for today.`,
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Error",
        message: err.message || "Could not skip mission.",
      });
    }
  };

  const handleSaveReschedule = async () => {
    if (!plan || !rescheduleMission) return;

    try {
      await updateMissionMutation.mutateAsync({
        planId: plan._id,
        missionId: rescheduleMission.missionId,
        action: "reschedule",
        rescheduledTime: newRescheduledTime,
      });

      toast({
        type: "success",
        title: "Mission Rescheduled",
        message: `Moved to ${newRescheduledTime}.`,
      });
      setRescheduleMission(null);
    } catch (err: any) {
      toast({
        type: "error",
        title: "Error",
        message: err.message || "Failed to reschedule mission.",
      });
    }
  };

  const aqiTheme = getAqiTheme(currentLocation.aqi);

  // Compute completed stats
  const totalMissions = plan?.missions.length || 0;
  const completedMissions = plan?.missions.filter((m) => m.completed) || [];
  const totalEarnedXp = completedMissions.reduce((acc, m) => acc + m.xpReward, 0);
  const totalPotentialXp = plan?.missions.reduce((acc, m) => acc + m.xpReward, 0) || 100;

  // Filtered missions
  const displayedMissions = (plan?.missions || []).filter((m) => {
    if (activeTab === "active") return !m.completed && !m.skipped;
    if (activeTab === "completed") return m.completed;
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge variant="sky" icon={<CalendarCheck className="h-3.5 w-3.5" />}>
              Personalized Diurnal Defense Plan
            </Badge>
            <PageTitle className="mt-1">My Day Timeline</PageTitle>
            <Subtitle className="mt-1">
              Synchronize family schedules, school transit, and outdoor activities with the cleanest air hours in{" "}
              {currentLocation.area}.
            </Subtitle>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={generatePlanMutation.isPending || isLoading}
              onClick={handleRegenerate}
              className="gap-2 font-bold border-brand-mint-300 text-brand-forest-800 hover:bg-[#F0FAF5] shadow-xs"
            >
              <RotateCw className={cn("h-4 w-4", generatePlanMutation.isPending && "animate-spin")} />
              <span>{generatePlanMutation.isPending ? "Regenerating..." : "Regenerate Plan"}</span>
            </Button>
          </div>
        </div>

        {/* Top Context & Diurnal Windows Card */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Active Family Shield */}
          <Card className="p-5 border-2 border-brand-mint-200 bg-white shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase text-brand-forest-700/70 tracking-wider">
                  Active Shield
                </span>
                <span className="rounded-full bg-brand-peach px-2 py-0.5 text-[10px] font-extrabold text-[#7c2d12]">
                  {activeFamilyMember.vulnerability.toUpperCase()}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-brand-forest-900">
                {activeFamilyMember.name} ({activeFamilyMember.role})
              </h3>
              <p className="mt-1 text-xs text-brand-forest-700/80 leading-snug">
                {activeFamilyMember.condition ? (
                  <>Noted condition: <strong>{activeFamilyMember.condition}</strong>. Stricter particulate safeguards applied.</>
                ) : (
                  "Standard ambient exposure thresholds applied for family routine."
                )}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-brand-mint-100 flex items-center justify-between text-xs">
              <span className="text-brand-forest-700/70">Local Air Quality:</span>
              <span className="font-extrabold text-brand-forest-900">AQI {currentLocation.aqi} • {aqiTheme.label}</span>
            </div>
          </Card>

          {/* Diurnal Windows (Safest vs Peak Smog) */}
          <Card className="p-5 border-2 border-brand-sky-300 bg-[#F0F9FF] shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-sky-800 tracking-wider mb-2">
                <Sun className="h-4 w-4 text-sky-600" />
                <span>Safest Outdoor Window</span>
              </div>
              <h3 className="text-lg font-extrabold text-brand-forest-900">
                {plan?.aqiContext?.safestWindow?.start || "01:00 PM"} – {plan?.aqiContext?.safestWindow?.end || "03:30 PM"}
              </h3>
              <p className="mt-1 text-xs text-brand-forest-800/80 leading-snug">
                {plan?.aqiContext?.safestWindow?.reason || "Solar thermal convection dissipates surface smog layer."}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-sky-200/80 text-[11px] text-sky-900/80 font-medium">
              Peak Smog Window: <strong>{plan?.aqiContext?.peakSmogWindow?.start || "07:00 AM"} – {plan?.aqiContext?.peakSmogWindow?.end || "09:30 AM"}</strong>
            </div>
          </Card>

          {/* Gamification Daily XP Card */}
          <Card className="p-5 border-2 border-brand-cream-300 bg-brand-cream/60 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase text-amber-900/80 tracking-wider flex items-center gap-1">
                  <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span>Daily Action XP</span>
                </span>
                <span className="text-xs font-black text-amber-950">
                  {completedMissions.length} / {totalMissions} Completed
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-brand-forest-900">{totalEarnedXp}</span>
                <span className="text-sm font-bold text-amber-900/70">/ {totalPotentialXp} XP</span>
              </div>
              <p className="mt-1 text-xs text-amber-950/80 leading-snug">
                Complete daily habit and protection missions to maintain your streak and unlock clean air badges.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 pt-3 border-t border-amber-200/80">
              <div className="h-2 w-full rounded-full bg-white/80 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${totalPotentialXp > 0 ? (totalEarnedXp / totalPotentialXp) * 100 : 0}%` }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Tabs Toolbar */}
        <div className="flex items-center justify-between border-b border-brand-mint-200 pb-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                activeTab === "all"
                  ? "bg-brand-forest-800 text-white shadow-xs"
                  : "text-brand-forest-700/70 hover:bg-[#F0FAF5] hover:text-brand-forest-900"
              )}
            >
              All Actions ({plan?.missions.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                activeTab === "active"
                  ? "bg-brand-forest-800 text-white shadow-xs"
                  : "text-brand-forest-700/70 hover:bg-[#F0FAF5] hover:text-brand-forest-900"
              )}
            >
              Pending ({totalMissions - completedMissions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                activeTab === "completed"
                  ? "bg-brand-forest-800 text-white shadow-xs"
                  : "text-brand-forest-700/70 hover:bg-[#F0FAF5] hover:text-brand-forest-900"
              )}
            >
              Completed ({completedMissions.length})
            </button>
          </div>

          <span className="text-[11px] text-brand-forest-700/60 font-medium hidden sm:inline">
            Plan Version {plan?.planVersion || 1} • Auto-synced
          </span>
        </div>

        {/* Timeline Stream */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3 text-brand-forest-700">
            <Loader2 className="h-8 w-8 animate-spin text-brand-forest-700" />
            <p className="text-sm font-bold">Compiling your personalized clean air timeline...</p>
          </div>
        ) : displayedMissions.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-brand-mint-200 p-12 text-center text-brand-forest-700 space-y-2">
            <CheckCircle2 className="h-8 w-8 mx-auto text-brand-forest-600" />
            <p className="font-bold text-sm">No actions in this view.</p>
            <p className="text-xs text-brand-forest-700/70">
              {activeTab === "completed"
                ? "You haven't completed any missions yet today. Check off pending items below!"
                : "All scheduled actions have been completed or skipped!"}
            </p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-brand-mint-200">
            {displayedMissions.map((mission, idx) => {
              const isHighPriority = mission.priority === "high";

              return (
                <div key={mission.missionId} className="relative group">
                  {/* Timeline Dot */}
                  <div
                    className={cn(
                      "absolute -left-6 sm:-left-8 top-5 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all shadow-xs",
                      mission.completed
                        ? "bg-emerald-600 border-white text-white"
                        : mission.skipped
                        ? "bg-slate-300 border-white text-slate-600"
                        : isHighPriority
                        ? "bg-amber-500 border-white text-white"
                        : "bg-brand-mint-400 border-white text-brand-forest-900"
                    )}
                  >
                    {mission.completed ? (
                      <Check className="h-3 w-3 stroke-[3]" />
                    ) : (
                      <span className="text-[10px] font-black">{idx + 1}</span>
                    )}
                  </div>

                  {/* Mission Timeline Card */}
                  <Card
                    className={cn(
                      "p-5 sm:p-6 border-2 transition-all duration-200",
                      mission.completed
                        ? "bg-[#F7FAF7] border-emerald-300/80 opacity-90"
                        : mission.skipped
                        ? "bg-slate-50 border-slate-200 opacity-60"
                        : isHighPriority
                        ? "bg-white border-brand-mint-300 shadow-card hover:border-brand-mint-400"
                        : "bg-white border-brand-forest-700/10 shadow-xs hover:border-brand-mint-200"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left: Time, Title, Description & Why It Matters */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Time Badge */}
                          <span className="flex items-center gap-1 rounded-lg bg-brand-forest-900 px-2.5 py-1 text-xs font-extrabold text-white">
                            <Clock className="h-3 w-3" />
                            {mission.time}
                          </span>

                          {/* Priority Pill */}
                          <span
                            className={cn(
                              "rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase",
                              mission.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : mission.priority === "medium"
                                ? "bg-amber-100 text-amber-900"
                                : "bg-blue-100 text-blue-800"
                            )}
                          >
                            {mission.priority} priority
                          </span>

                          {/* Category Badge */}
                          <span className="rounded-md bg-brand-mint-100 px-2 py-0.5 text-[10px] font-bold text-brand-forest-900 capitalize">
                            {mission.category}
                          </span>

                          {/* Duration */}
                          <span className="text-[11px] text-brand-forest-700/60 font-semibold">
                            ~{mission.estimatedDuration}
                          </span>

                          {/* XP Reward */}
                          <span className="flex items-center gap-1 rounded-full bg-brand-cream px-2 py-0.5 text-[11px] font-black text-amber-900 ml-auto sm:ml-0">
                            <Sparkles className="h-3 w-3 fill-amber-500 text-amber-500" />
                            +{mission.xpReward} XP
                          </span>
                        </div>

                        {/* Title */}
                        <h4
                          className={cn(
                            "text-base sm:text-lg font-extrabold text-brand-forest-900",
                            mission.completed && "line-through text-slate-500"
                          )}
                        >
                          {mission.title}
                        </h4>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-brand-forest-800/80 leading-relaxed">
                          {mission.description}
                        </p>

                        {/* Why It Matters Callout */}
                        {mission.whyItMatters && (
                          <div className="rounded-2xl bg-[#F0FAF5] border border-brand-mint-200/80 p-3 text-xs text-brand-forest-800 flex items-start gap-2 mt-2">
                            <Info className="h-4 w-4 text-brand-forest-700 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-brand-forest-900">Why it matters:</strong>{" "}
                              {mission.whyItMatters}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Actions: Complete / Skip / Reschedule */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-mint-100 shrink-0">
                        {mission.completed ? (
                          <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>Done (+{mission.xpReward} XP)</span>
                          </div>
                        ) : mission.skipped ? (
                          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
                            Skipped
                          </span>
                        ) : (
                          <Button
                            variant="forest"
                            size="sm"
                            onClick={() => handleCompleteMission(mission)}
                            className="gap-1.5 font-bold shadow-xs rounded-xl"
                          >
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                            <span>Complete</span>
                          </Button>
                        )}

                        {!mission.completed && !mission.skipped && (
                          <div className="flex items-center gap-1 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setRescheduleMission(mission);
                                setNewRescheduledTime(mission.time);
                              }}
                              className="text-brand-forest-700/70 hover:text-brand-forest-900 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              Reschedule
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={() => handleSkipMission(mission)}
                              className="text-slate-400 hover:text-red-700 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Skip
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}

        {/* Reschedule Modal */}
        <Dialog open={Boolean(rescheduleMission)} onOpenChange={(open) => !open && setRescheduleMission(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand-forest-800" />
                <span>Reschedule Mission</span>
              </DialogTitle>
              <DialogDescription>
                Adjust when you want to execute &quot;{rescheduleMission?.title}&quot; today.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-brand-forest-900 block mb-1.5">
                  Select Preferred Timing
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "08:30 AM",
                    "11:00 AM",
                    "01:30 PM (Midday Solar)",
                    "03:00 PM",
                    "05:30 PM",
                    "08:00 PM",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewRescheduledTime(preset.split(" ")[0] + " " + preset.split(" ")[1])}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs font-bold transition-all text-left",
                        newRescheduledTime.startsWith(preset.slice(0, 5))
                          ? "bg-[#F0FAF5] border-brand-mint-400 text-brand-forest-900 shadow-xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-brand-forest-900 block mb-1">
                  Or enter specific custom time:
                </label>
                <input
                  type="text"
                  value={newRescheduledTime}
                  onChange={(e) => setNewRescheduledTime(e.target.value)}
                  placeholder="e.g. 02:45 PM"
                  className="w-full rounded-xl border border-brand-mint-200 bg-[#F7FAF7] px-3.5 py-2.5 text-xs font-bold text-brand-forest-900 focus:outline-none focus:ring-2 focus:ring-brand-mint"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-mint-100">
                <Button variant="outline" size="sm" onClick={() => setRescheduleMission(null)}>
                  Cancel
                </Button>
                <Button variant="forest" size="sm" onClick={handleSaveReschedule}>
                  Confirm Reschedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
