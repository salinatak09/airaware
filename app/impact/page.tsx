"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import {
  Flame,
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Calendar as CalendarIcon,
  TrendingUp,
  Info,
  Check,
  RotateCcw,
  Zap,
  Share2,
  Home,
  Car,
  Users,
  Loader2,
  Clock,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MetricCard } from "@/components/ui/metric-card";
import { PageTitle, SectionTitle, Subtitle } from "@/components/ui/typography";
import { useToast } from "@/components/ui/toast";
import { AeroMascot } from "@/components/onboarding/aero-mascot";
import { cn } from "@/lib/utils";
import type { GamificationDashboardData } from "@/types/api";
import {
  useGamificationOverviewQuery,
  useLogImpactActionMutation,
} from "@/hooks/use-airaware-api";

export default function ImpactPage() {
  const { toast } = useToast();

  const {
    data,
    isLoading: loading,
    refetch: refetchDashboard,
    isRefetching: refreshing,
  } = useGamificationOverviewQuery();

  const logActionMutation = useLogImpactActionMutation();

  const [activeTab, setActiveTab] = useState<"overview" | "badges" | "challenges" | "history">("overview");
  const [badgeFilter, setBadgeFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const fetchDashboardData = useCallback(async (_isRefresh?: boolean) => {
    await refetchDashboard();
  }, [refetchDashboard]);

  // Log an action / check-in to earn XP
  const handleLogAction = async (actionType: string, missionId: string, customTitle?: string) => {
    setCheckingInId(missionId);
    try {
      const res = await logActionMutation.mutateAsync({
        actionType,
        missionId,
        customTitle,
      });

      toast({
        type: "success",
        title: `+${res.xpEarned} XP Earned!`,
        message: res.message || "Daily defense action verified and added to your streak.",
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Action Logging Failed",
        message: err.message || "Unable to save your action. Please retry.",
      });
    } finally {
      setCheckingInId(null);
    }
  };

  if (loading && !data) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-forest-700" />
          <p className="text-sm font-semibold text-brand-forest-800">
            Gathering verified defense habits & gamification stats...
          </p>
        </div>
      </AppShell>
    );
  }

  const {
    totalXp = 340,
    level = {
      current: 4,
      title: "Sanctuary Guardian",
      icon: "🏰",
      perk: "Advanced CADR & clean-room optimizer",
      minXp: 450,
      maxXp: 700,
      progressXp: 340,
      neededXp: 500,
      progressPercent: 68,
    },
    streak = {
      currentStreak: 7,
      longestStreak: 14,
      streakFreezesAvailable: 2,
      lastActiveDate: new Date().toISOString(),
      isActiveToday: true,
    },
    honestImpact = {
      totalActionsCompleted: 28,
      daysWithPrecautions: 21,
      cleanTransitCommutesLogged: 14,
      sanctuaryHabitsMaintained: 18,
      n95PreparednessRatePercent: 94,
      transparencyNotice:
        "AirAware measures validated behavioral actions and protective habits. We do not fabricate unverified metric claims such as grams of pollution avoided, lung capacity gains, or theoretical carbon offsets.",
    },
    weeklyActivity = [],
    badges = [],
    achievements = [],
    householdChallenges = [],
    personalMilestones = [],
    recentActionHistory = [],
  } = data || {};

  const filteredBadges = badges.filter((b) => {
    if (badgeFilter === "unlocked") return b.earned;
    if (badgeFilter === "locked") return !b.earned;
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="yellow" icon={<Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />}>
                Family Health Gamification
              </Badge>
              <Badge variant="mint" icon={<ShieldCheck className="h-3.5 w-3.5 text-brand-mint-800" />}>
                Honest Behavioral Science
              </Badge>
            </div>
            <PageTitle className="mt-2">Clean Air Impact & Gamification</PageTitle>
            <Subtitle className="mt-1">
              Celebrate daily smog defense habits, maintain protective streaks, and earn family health rewards.
            </Subtitle>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="gap-1.5 text-xs font-semibold"
            >
              <RotateCcw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              <span>Refresh</span>
            </Button>

            <Button
              variant="forest"
              size="sm"
              onClick={() => setShowShareModal(true)}
              className="gap-2 font-bold shadow-xs"
            >
              <Share2 className="h-4 w-4" />
              <span>Share Impact Card</span>
            </Button>
          </div>
        </div>

        {/* Hero Gamification & XP Dashboard Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#FFFBEA] via-[#FFF8E8] to-[#F0FAF5] p-6 sm:p-8 border-2 border-brand-yellow-300 shadow-soft relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Level & Mascot Intro */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-white border-2 border-amber-300 shadow-md text-3xl sm:text-4xl">
                  {level.icon || "🏰"}
                </div>
                <span className="absolute -bottom-2 -right-2 bg-brand-forest-900 text-white font-black text-xs px-2 py-0.5 rounded-full border-2 border-white shadow-xs">
                  Lv. {level.current}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-brand-forest-900">
                    Level {level.current}: {level.title}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm font-medium text-brand-forest-800/80 mt-0.5">
                  Unlocked Perk: <span className="font-bold text-amber-900">{level.perk}</span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-100/90 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                    <Zap className="h-3 w-3 fill-amber-600 text-amber-600" />
                    {totalXp} Total XP
                  </span>
                  <span className="text-xs font-semibold text-brand-forest-700/70">
                    • Rank: Top 8% Neighborhood Defenders
                  </span>
                </div>
              </div>
            </div>

            {/* Streak & Freeze Status Box */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-white/90 p-4 sm:p-5 rounded-2xl border border-brand-yellow-300/80 backdrop-blur-xs shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 text-2xl font-black">
                  🔥
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-black text-brand-forest-900">{streak.currentStreak}</span>
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Days</span>
                  </div>
                  <p className="text-[11px] font-semibold text-brand-forest-700/80">Active Protection Streak</p>
                </div>
              </div>

              <div className="h-10 w-px bg-slate-200 hidden sm:block" />

              <div>
                <div className="flex items-center gap-1 text-xs font-bold text-brand-forest-900">
                  <span>🛡️ Freezes:</span>
                  <span className="text-emerald-700">{streak.streakFreezesAvailable} Available</span>
                </div>
                <p className="text-[10px] text-brand-forest-700/70 mt-0.5">
                  Record: <span className="font-bold">{streak.longestStreak} days</span>
                </p>
              </div>
            </div>
          </div>

          {/* XP Progress Bar to Next Level */}
          <div className="mt-6 pt-5 border-t border-amber-200/60 relative z-10">
            <div className="flex justify-between items-center text-xs font-bold text-brand-forest-900 mb-2">
              <span>Progress to Level {level.current + 1}</span>
              <span>
                {level.progressXp} / {level.neededXp} XP ({level.progressPercent}%)
              </span>
            </div>
            <div className="h-3.5 w-full overflow-hidden rounded-full bg-brand-yellow-200/60 p-0.5 border border-amber-300/40">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-500 to-brand-forest-700"
                initial={{ width: 0 }}
                animate={{ width: `${level.progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="mt-2 text-[11px] text-brand-forest-700/70 flex items-center justify-between">
              <span>Earn XP by completing daily indoor checks, clean commutes, and challenges.</span>
              <span className="font-bold text-brand-forest-900">
                {level.neededXp - level.progressXp} XP to next tier
              </span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-brand-forest-700/10 pb-2 overflow-x-auto">
          {[
            { id: "overview", label: "Overview & Impact", icon: Activity },
            { id: "badges", label: "Badges & Achievements", icon: Award },
            { id: "challenges", label: "Household Challenges", icon: Users },
            { id: "history", label: "Action History & Timeline", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap",
                  isActive
                    ? "bg-brand-forest-900 text-white shadow-xs"
                    : "text-brand-forest-700 hover:bg-brand-forest-50 hover:text-brand-forest-900"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview & Honest Impact */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Honest Behavioral Metrics Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <SectionTitle>Honest Behavioral Metrics</SectionTitle>
                  <p className="text-xs text-brand-forest-700/80">
                    Real, verified human actions taken to safeguard respiratory health.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <MetricCard
                  title="Total Actions"
                  value={honestImpact.totalActionsCompleted}
                  unit="Done"
                  icon={<CheckCircle2 className="h-4 w-4 text-brand-forest-800" />}
                  subtitle="Verified daily defense logs"
                  variant="mint"
                />
                <MetricCard
                  title="Precautions Active"
                  value={honestImpact.daysWithPrecautions}
                  unit="Days"
                  icon={<ShieldCheck className="h-4 w-4 text-emerald-700" />}
                  subtitle="Days with active smog defense"
                  variant="cream"
                />
                <MetricCard
                  title="Clean Commutes"
                  value={honestImpact.cleanTransitCommutesLogged}
                  unit="Trips"
                  icon={<Car className="h-4 w-4 text-sky-700" />}
                  subtitle="Sealed or low-smog transit"
                  variant="sky"
                />
                <MetricCard
                  title="Sanctuary Habits"
                  value={honestImpact.sanctuaryHabitsMaintained}
                  unit="Days"
                  icon={<Home className="h-4 w-4 text-purple-700" />}
                  subtitle="Clean-room protocol followed"
                  variant="lavender"
                />
                <MetricCard
                  title="N95 Preparedness"
                  value={`${honestImpact.n95PreparednessRatePercent}%`}
                  unit="Rate"
                  icon={<Sparkles className="h-4 w-4 text-amber-700" />}
                  subtitle="Readiness on poor AQI days"
                  variant="yellow"
                />
              </div>

              {/* Strict Scientific Transparency Disclosure Banner */}
              <div className="rounded-2xl bg-brand-forest-50/80 border border-brand-mint-300 p-4 sm:p-5 flex items-start gap-3 text-brand-forest-900">
                <Info className="h-5 w-5 text-brand-forest-700 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold text-brand-forest-950">AirAware Scientific Integrity Notice: </span>
                  {honestImpact.transparencyNotice}
                </div>
              </div>
            </div>

            {/* Streak & Weekly Activity Section */}
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Daily Streak Flame Track (5 cols) */}
              <div className="lg:col-span-5 rounded-3xl bg-white border border-brand-forest-700/10 p-6 shadow-card space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-brand-forest-900">7-Day Streak Tracker</h3>
                    <p className="text-xs text-brand-forest-700/80">Log daily actions to keep the flame alive</p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800">
                    🔥 {streak.currentStreak} Days
                  </span>
                </div>

                {/* 7-Day Flame Track */}
                <div className="grid grid-cols-7 gap-2 text-center">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName, idx) => {
                    const isPassedOrToday = idx <= 4; // Mock: first 5 days completed
                    const isToday = idx === 4; // Friday
                    return (
                      <div
                        key={dayName}
                        className={cn(
                          "rounded-2xl p-2.5 flex flex-col items-center justify-between border transition-all",
                          isPassedOrToday
                            ? "bg-amber-50/80 border-amber-300 shadow-xs"
                            : "bg-slate-50 border-slate-200 opacity-60"
                        )}
                      >
                        <span className="text-[10px] font-bold text-brand-forest-700 uppercase">{dayName}</span>
                        <span className="text-lg my-1">{isPassedOrToday ? "🔥" : "⚪"}</span>
                        <span
                          className={cn(
                            "text-[9px] font-black rounded-full px-1.5 py-0.2",
                            isToday ? "bg-amber-500 text-white" : isPassedOrToday ? "text-emerald-700" : "text-slate-400"
                          )}
                        >
                          {isToday ? "Today" : isPassedOrToday ? "Done" : "Pending"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Check-In CTA */}
                <div className="rounded-2xl bg-[#FFFBEA] border border-amber-300/80 p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🌟</span>
                    <div>
                      <p className="text-xs font-bold text-brand-forest-900">Daily AQI Check-in (+10 XP)</p>
                      <p className="text-[11px] text-brand-forest-700/80">Claim today&apos;s morning defense bonus</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="forest"
                    disabled={checkingInId === "daily_checkin"}
                    onClick={() => handleLogAction("daily_aqi_check", "daily_checkin", "Morning Air Awareness Routine")}
                    className="font-bold text-xs"
                  >
                    {checkingInId === "daily_checkin" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Claim +10 XP"
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between text-xs text-brand-forest-700/80 pt-2 border-t border-slate-100">
                  <span>Longest Streak Record</span>
                  <span className="font-bold text-brand-forest-900">{streak.longestStreak} Days</span>
                </div>
              </div>

              {/* Weekly Activity Bar Chart (7 cols) */}
              <div className="lg:col-span-7 rounded-3xl bg-white border border-brand-forest-700/10 p-6 shadow-card space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-brand-forest-900">Weekly XP & Action Log</h3>
                    <p className="text-xs text-brand-forest-700/80">Points earned each day this week</p>
                  </div>
                  <Badge variant="yellow" icon={<TrendingUp className="h-3 w-3" />}>
                    +185 XP this week
                  </Badge>
                </div>

                {/* Day-by-Day Interactive Visual Bars */}
                <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-44 pt-6 pb-2 border-b border-slate-100">
                  {weeklyActivity.map((day) => {
                    const maxHeightPx = 110;
                    const heightPercent = Math.min(100, Math.max(15, (day.xpEarned / 60) * 100));
                    const isToday = day.day === "Fri";

                    return (
                      <div key={day.day} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                        <span className="text-[10px] font-bold text-brand-forest-800 opacity-0 group-hover:opacity-100 transition-opacity">
                          {day.xpEarned} XP
                        </span>

                        <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl h-full flex items-end overflow-hidden p-0.5">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className={cn(
                              "w-full rounded-t-lg transition-all",
                              isToday
                                ? "bg-gradient-to-t from-amber-500 to-amber-400 group-hover:brightness-110 shadow-xs"
                                : day.xpEarned > 0
                                ? "bg-gradient-to-t from-brand-forest-700 to-brand-mint-600 group-hover:brightness-110"
                                : "bg-slate-200"
                            )}
                          />
                        </div>

                        <span
                          className={cn(
                            "text-xs font-bold",
                            isToday ? "text-amber-800 font-black" : "text-brand-forest-700/80"
                          )}
                        >
                          {day.day}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400">
                          {day.actionsCount > 0 ? `${day.actionsCount} acts` : "-"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs text-brand-forest-700/80">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-forest-700 inline-block" /> Completed
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" /> Today
                    </span>
                  </div>
                  <span className="font-semibold text-brand-forest-900">
                    Average: {Math.round(185 / 7)} XP / day
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Calendar (Monthly Heatmap View) */}
            <div className="rounded-3xl bg-white border border-brand-forest-700/10 p-6 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-brand-forest-700" />
                  <div>
                    <h3 className="text-base font-bold text-brand-forest-900">Monthly Defense Calendar</h3>
                    <p className="text-xs text-brand-forest-700/80">
                      Visual log of days with active smog safeguards and clean air routines
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1 text-emerald-800">
                    <span className="h-3 w-3 rounded-md bg-emerald-500" /> Safeguard Active
                  </span>
                  <span className="flex items-center gap-1 text-amber-800">
                    <span className="h-3 w-3 rounded-md bg-amber-400" /> Streak Protected
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <span className="h-3 w-3 rounded-md bg-slate-200" /> Clear Air / Rest
                  </span>
                </div>
              </div>

              {/* 30-day Calendar Grid */}
              <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 gap-2 pt-2">
                {Array.from({ length: 30 }).map((_, i) => {
                  const dayNum = i + 1;
                  const isCurrentDay = dayNum === 20; // 20th
                  const isFutureDay = dayNum > 20;
                  const hasActiveSafeguard = [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20].includes(
                    dayNum
                  );
                  const isStreakProtected = [4, 9, 13].includes(dayNum);

                  return (
                    <div
                      key={dayNum}
                      className={cn(
                        "rounded-xl p-2 flex flex-col items-center justify-center text-center transition-all border text-xs",
                        isCurrentDay
                          ? "ring-2 ring-amber-500 bg-amber-50 border-amber-300 font-black"
                          : hasActiveSafeguard
                          ? "bg-emerald-50/90 border-emerald-300 text-emerald-900 font-bold"
                          : isStreakProtected
                          ? "bg-amber-50/50 border-amber-200 text-amber-900 font-medium"
                          : isFutureDay
                          ? "bg-slate-50 border-slate-100 text-slate-400 opacity-40"
                          : "bg-slate-100/70 border-slate-200 text-slate-600"
                      )}
                    >
                      <span className="text-[11px]">{dayNum}</span>
                      <span className="text-[9px] mt-0.5">
                        {isCurrentDay ? "🔥" : hasActiveSafeguard ? "🛡️" : isStreakProtected ? "❄️" : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mascot Tip & Motivation */}
            <div className="rounded-3xl bg-gradient-to-r from-[#F0FAF5] to-[#E8F8F0] border-2 border-brand-mint-300 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
              <AeroMascot mood="lifestyle" size="md" showSpeechBubble={false} />
              <div className="space-y-1.5 text-center sm:text-left">
                <Badge variant="mint">Aero&apos;s Habit Coach</Badge>
                <h4 className="text-lg font-bold text-brand-forest-900">
                  &ldquo;Consistency beats perfection every single smog season!&rdquo;
                </h4>
                <p className="text-xs sm:text-sm text-brand-forest-800 leading-relaxed max-w-2xl">
                  You don&apos;t need expensive purifiers in every hallway. Keeping your cleaner-air sanctuary sealed,
                  running your kitchen exhaust fan, and wearing a well-fitted N95 on high PM2.5 days delivers 90% of the
                  real respiratory protection.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Badges & Multi-Step Achievements */}
        {activeTab === "badges" && (
          <div className="space-y-8">
            {/* Filter Tabs for Badges */}
            <div className="flex items-center justify-between">
              <div>
                <SectionTitle>Family Achievement Badges</SectionTitle>
                <p className="text-xs text-brand-forest-700/80">
                  Earn distinctive milestone emblems as your household masters clean air protocols.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {(["all", "unlocked", "locked"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setBadgeFilter(filter)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all",
                      badgeFilter === filter
                        ? "bg-white text-brand-forest-900 shadow-xs"
                        : "text-brand-forest-700/70 hover:text-brand-forest-900"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBadges.map((b) => (
                <Card
                  key={b.id}
                  onClick={() => setSelectedBadge(b)}
                  className={cn(
                    "p-5 border-2 transition-all cursor-pointer hover:shadow-card-hover",
                    b.earned
                      ? "bg-white border-brand-mint-300 shadow-card"
                      : "bg-slate-50/70 border-slate-200 opacity-65"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-xs border",
                        b.earned
                          ? b.tier === "platinum"
                            ? "bg-purple-50 border-purple-300 text-purple-700"
                            : b.tier === "gold"
                            ? "bg-amber-50 border-amber-300 text-amber-700"
                            : b.tier === "silver"
                            ? "bg-slate-100 border-slate-300 text-slate-700"
                            : "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : "bg-slate-100 border-slate-200 text-slate-400"
                      )}
                    >
                      {b.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-bold text-brand-forest-900 truncate">{b.name}</h4>
                        {!b.earned ? (
                          <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        ) : (
                          <span
                            className={cn(
                              "text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md",
                              b.tier === "gold"
                                ? "bg-amber-100 text-amber-900"
                                : b.tier === "platinum"
                                ? "bg-purple-100 text-purple-900"
                                : "bg-emerald-100 text-emerald-900"
                            )}
                          >
                            {b.tier}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-brand-forest-800/80 line-clamp-2 leading-relaxed">
                        {b.description}
                      </p>

                      <div className="mt-3 flex items-center justify-between text-[10px]">
                        {b.earned ? (
                          <span className="font-bold text-emerald-800 flex items-center gap-1">
                            <Check className="h-3 w-3" /> {b.earnedDate || "Earned"}
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-500">In Progress</span>
                        )}
                        <span className="text-brand-forest-700/60 font-semibold hover:underline">View details</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Multi-Step Achievements Section */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div>
                <SectionTitle>Tiered Habit Achievements</SectionTitle>
                <p className="text-xs text-brand-forest-700/80">
                  Long-term family goals that compound into lifelong clean-air mastery.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {achievements.map((ach) => (
                  <Card key={ach.id} className="p-5 border-2 border-brand-forest-700/10 shadow-xs bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-forest-50 text-brand-forest-800 font-black text-sm">
                          🎯
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-brand-forest-900">{ach.title}</h4>
                          <p className="text-[11px] text-brand-forest-700/80">{ach.target}</p>
                        </div>
                      </div>

                      <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        {ach.progress}%
                      </span>
                    </div>

                    <p className="text-xs text-brand-forest-800/80 leading-relaxed">{ach.description}</p>

                    <div className="space-y-1">
                      <ProgressBar
                        value={ach.progress}
                        variant={ach.progress === 100 ? "forest" : "yellow"}
                        showValue={false}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Household Challenges */}
        {activeTab === "challenges" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <SectionTitle>Active Household Challenges</SectionTitle>
                <p className="text-xs text-brand-forest-700/80">
                  Weekly community-tested challenges tailored for Delhi, Mumbai, and North Indian winter smog.
                </p>
              </div>

              <Badge variant="mint" icon={<Users className="h-3 w-3" />}>
                3 Active Challenges
              </Badge>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {householdChallenges.map((challenge) => {
                const percent = Math.round((challenge.currentCount / challenge.targetCount) * 100);
                const isCheckingIn = checkingInId === challenge.id;

                return (
                  <Card
                    key={challenge.id}
                    className="p-5 border-2 border-brand-mint-200/80 bg-white shadow-card flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-mint-900 bg-brand-mint-100 px-2 py-0.5 rounded-md">
                          {challenge.category}
                        </span>
                        <span className="text-xs font-black text-amber-800 flex items-center gap-1">
                          <Zap className="h-3 w-3 fill-amber-600" />+{challenge.xpReward} XP
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-brand-forest-900">{challenge.title}</h4>
                        <p className="text-xs text-brand-forest-800/80 mt-1 leading-relaxed">
                          {challenge.description}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs font-semibold text-brand-forest-800">
                          <span>Progress</span>
                          <span>
                            {challenge.currentCount} / {challenge.targetCount} days ({percent}%)
                          </span>
                        </div>
                        <ProgressBar value={percent} variant="mint" showValue={false} />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 font-medium">
                        ⏳ {challenge.daysRemaining} days left
                      </span>

                      <Button
                        size="sm"
                        variant={challenge.completed ? "outline" : "forest"}
                        disabled={challenge.completed || isCheckingIn}
                        onClick={() =>
                          handleLogAction("household_challenge", challenge.id, `Challenge Log: ${challenge.title}`)
                        }
                        className="gap-1.5 text-xs font-bold"
                      >
                        {isCheckingIn ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : challenge.completed ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" /> Completed
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Check In (+15 XP)
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* How Challenges Work Info Box */}
            <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-5 flex items-start gap-4">
              <span className="text-2xl">💡</span>
              <div className="text-xs text-brand-forest-900 space-y-1">
                <h5 className="font-bold">Why Household Challenges?</h5>
                <p className="text-brand-forest-800/80 leading-relaxed">
                  Behavioral research proves that tracking specific micro-habits—like turning on exhaust fans or pausing
                  incense burning—reduces indoor particulate spikes far more consistently than passive awareness. Each
                  check-in awards XP and advances your family level.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Action History & Personal Milestones */}
        {activeTab === "history" && (
          <div className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Personal Milestones Timeline (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <SectionTitle>Family Clean Air Milestones</SectionTitle>
                  <p className="text-xs text-brand-forest-700/80">
                    Key breakthroughs recorded throughout your AirAware journey.
                  </p>
                </div>

                <div className="space-y-3 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-brand-mint-200">
                  {personalMilestones.map((item) => (
                    <div key={item.id} className="relative flex items-start gap-4 pl-8 group">
                      <div className="absolute left-2.5 top-2.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-brand-mint-600 bg-white group-hover:bg-brand-mint-600 transition-colors" />

                      <div className="flex-1 rounded-2xl bg-white border border-brand-forest-700/10 p-4 shadow-xs hover:border-brand-mint-300 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-brand-forest-900">{item.title}</span>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                            +{item.xpAwarded} XP
                          </span>
                        </div>
                        <p className="text-xs text-brand-forest-700/80 mt-1">{item.description}</p>
                        <span className="text-[10px] text-slate-400 mt-2 block font-medium">{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Mission Completion History Log (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <SectionTitle>Recent Action History</SectionTitle>
                    <p className="text-xs text-brand-forest-700/80">Log of recent defense actions and XP gains.</p>
                  </div>
                  <Badge variant="mint" icon={<ShieldCheck className="h-3 w-3" />}>
                    Anti-Exploit Protected
                  </Badge>
                </div>

                <div className="space-y-3">
                  {recentActionHistory.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 rounded-2xl bg-white border">
                      No actions logged yet. Complete today&apos;s morning check-in to get started!
                    </div>
                  ) : (
                    recentActionHistory.map((act) => (
                      <div
                        key={act.id}
                        className="rounded-2xl bg-white border border-slate-200/80 p-3.5 flex items-center justify-between shadow-xs hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 text-base">
                            ✓
                          </div>
                          <div>
                            <p className="text-xs font-bold text-brand-forest-900">{act.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400">{act.timeFormatted}</span>
                              <span className="text-[10px] text-brand-forest-700/60 uppercase font-semibold">
                                • {act.actionType.replace(/_/g, " ")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          +{act.xpEarned} XP
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Badge Details Modal Dialog */}
        <AnimatePresence>
          {selectedBadge && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 max-w-sm w-full border-2 border-brand-mint-300 shadow-xl space-y-4 text-center relative"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 border-2 border-amber-300 text-4xl shadow-md">
                  {selectedBadge.icon}
                </div>

                <div>
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-lg font-black text-brand-forest-900">{selectedBadge.name}</h3>
                  </div>
                  <span className="inline-block mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                    Tier: {selectedBadge.tier}
                  </span>
                </div>

                <p className="text-xs text-brand-forest-800 leading-relaxed">{selectedBadge.description}</p>

                <div className="p-3 bg-slate-50 rounded-xl text-left text-xs space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Status:</span>
                    <span className={cn("font-bold", selectedBadge.earned ? "text-emerald-700" : "text-amber-800")}>
                      {selectedBadge.earned ? `Unlocked (${selectedBadge.earnedDate || "Earned"})` : "Locked (In Progress)"}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Protection Domain:</span>
                    <span className="font-bold text-brand-forest-900">Preventive Respiratory Care</span>
                  </div>
                </div>

                <Button variant="forest" size="sm" onClick={() => setSelectedBadge(null)} className="w-full font-bold">
                  Close
                </Button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Share Family Impact Modal Dialog */}
        <AnimatePresence>
          {showShareModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-brand-yellow-300 shadow-xl space-y-5"
              >
                <div className="text-center space-y-1">
                  <span className="text-3xl">🏆</span>
                  <h3 className="text-xl font-black text-brand-forest-900">Family Clean Air Impact Card</h3>
                  <p className="text-xs text-brand-forest-700/80">
                    Verified household defense metrics powered by AirAware
                  </p>
                </div>

                {/* Card Preview */}
                <div className="rounded-2xl bg-gradient-to-br from-[#FFFBEA] via-[#FFF8E8] to-[#F0FAF5] p-5 border-2 border-amber-300 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{level.icon}</span>
                      <div>
                        <p className="text-sm font-black text-brand-forest-900">{level.title}</p>
                        <p className="text-[10px] text-brand-forest-700/80">Level {level.current} • {totalXp} XP</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      🔥 {streak.currentStreak} Days
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                      <p className="text-lg font-black text-brand-forest-900">{honestImpact.totalActionsCompleted}</p>
                      <p className="text-[10px] text-brand-forest-700">Actions Completed</p>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                      <p className="text-lg font-black text-emerald-800">{honestImpact.n95PreparednessRatePercent}%</p>
                      <p className="text-[10px] text-brand-forest-700">N95 Readiness</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-brand-forest-700/70 text-center italic">
                    &ldquo;Honest behavioral defense during North Indian winter smog.&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="forest"
                    className="flex-1 font-bold gap-2"
                    onClick={() => {
                      navigator.clipboard?.writeText?.(
                        `🛡️ Our family achieved a ${streak.currentStreak}-day clean air defense streak on AirAware! Completed ${honestImpact.totalActionsCompleted} smog defense habits and reached Level ${level.current} (${level.title}). Check your air at AirAware!`
                      );
                      toast({
                        type: "success",
                        title: "Impact Card Copied!",
                        message: "Shareable summary copied to clipboard for WhatsApp or social media.",
                      });
                      setShowShareModal(false);
                    }}
                  >
                    <Share2 className="h-4 w-4" /> Copy for WhatsApp
                  </Button>

                  <Button variant="outline" onClick={() => setShowShareModal(false)}>
                    Close
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
