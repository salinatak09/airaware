"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import {
  Home,
  Wind,
  Filter,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Flame,
  Droplets,
  ShieldAlert,
  Info,
  Calculator,
  RefreshCw,
  Trophy,
  Loader2,
  Clock,
  Leaf,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTitle, SectionTitle, Subtitle } from "@/components/ui/typography";
import { useToast } from "@/components/ui/toast";
import { AeroMascot } from "@/components/onboarding/aero-mascot";
import { cn } from "@/lib/utils";
import type { IndoorAirOverview, IndoorChecklistItem, HomeHealthMission } from "@/server/services/indoor.service";

export default function IndoorAirPage() {
  const { toast } = useToast();

  const [overview, setOverview] = React.useState<IndoorAirOverview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // CADR Calculator state
  const [roomAreaSqFt, setRoomAreaSqFt] = React.useState(200);
  const [ceilingHeightFt, setCeilingHeightFt] = React.useState(9);

  // Selected low-cost tab filter
  const [budgetTab, setBudgetTab] = React.useState<"all" | "free" | "under_500" | "under_1500">("all");

  // AI Advice state
  const [aiAdvice, setAiAdvice] = React.useState<any>(null);
  const [loadingAi, setLoadingAi] = React.useState(false);

  // Fetch indoor overview
  const fetchOverview = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/indoor");
      const json = await res.json();
      if (json.success && json.data) {
        setOverview(json.data);
      }
    } catch (err) {
      console.error("Failed to load indoor overview:", err);
      toast({
        type: "error",
        title: "Connection Error",
        message: "Failed to load indoor air quality assessment.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Request live Gemini AI advice
  const handleFetchAiAdvice = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai/indoor-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiAdvice(json.data);
        toast({
          type: "success",
          title: "AI Guidance Updated",
          message: "Gemini analyzed your home profile and generated targeted advice.",
        });
      }
    } catch (err) {
      console.error("Failed to fetch AI indoor advice:", err);
      toast({
        type: "error",
        title: "AI Service Offline",
        message: "Could not retrieve live Gemini advice. Using deterministic safety rules.",
      });
    } finally {
      setLoadingAi(false);
    }
  };

  // Toggle checklist item
  const handleToggleChecklist = async (item: IndoorChecklistItem) => {
    if (!overview) return;
    const newCompleted = !item.completed;

    // Optimistic UI update
    setOverview((prev) => {
      if (!prev) return null;
      const updatedChecklist = prev.checklist.map((c) =>
        c.id === item.id ? { ...c, completed: newCompleted } : c
      );
      const completedCount = updatedChecklist.filter((c) => c.completed).length;
      const delta = newCompleted ? 2 : -2;
      return {
        ...prev,
        checklist: updatedChecklist,
        sanctuaryScore: Math.min(95, Math.max(30, prev.sanctuaryScore + delta)),
      };
    });

    try {
      const res = await fetch("/api/indoor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_checklist",
          itemId: item.id,
          completed: newCompleted,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          type: newCompleted ? "success" : "info",
          title: newCompleted ? "Habit Completed! 🌿" : "Habit Reset",
          message: `${item.title} updated in your daily sanctuary defense.`,
        });
      }
    } catch (err) {
      console.error("Checklist toggle failed:", err);
    }
  };

  // Complete home mission
  const handleCompleteMission = async (mission: HomeHealthMission) => {
    if (mission.completed) return;

    try {
      const res = await fetch("/api/indoor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete_mission",
          missionId: mission.id,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setOverview((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            homeMissions: prev.homeMissions.map((m) =>
              m.id === mission.id ? { ...m, completed: true, completedAt: new Date().toISOString() } : m
            ),
          };
        });

        toast({
          type: "success",
          title: `Mission Completed! +${mission.xpReward} XP 🏆`,
          message: json.data?.message || `You completed "${mission.title}"!`,
        });
      } else {
        toast({
          type: "warning",
          title: "Already Completed",
          message: json.message || "This mission was already completed today.",
        });
      }
    } catch (err) {
      console.error("Mission completion failed:", err);
      toast({
        type: "error",
        title: "Error",
        message: "Failed to record mission completion.",
      });
    }
  };

  // Calculate CADR requirements
  // Volume in m³ = Area (sq ft) * 0.0929 * Height (ft) * 0.3048
  // Required CADR (m³/h) = Volume * 4.8 ACH
  const roomVolumeM3 = (roomAreaSqFt * 0.0929) * (ceilingHeightFt * 0.3048);
  const requiredCadrM3H = Math.round(roomVolumeM3 * 4.8);
  const requiredCadrCfm = Math.round(requiredCadrM3H / 1.7);

  const completedChecklistCount = overview?.checklist.filter((c) => c.completed).length || 0;
  const totalChecklistCount = overview?.checklist.length || 7;
  const checklistPercentage = Math.round((completedChecklistCount / totalChecklistCount) * 100);

  // Filter low cost solutions
  const filteredSolutions = overview?.lowCostSolutions.filter((s) => {
    if (budgetTab === "all") return true;
    return s.tier === budgetTab;
  }) || [];

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-forest-700" />
          <p className="text-sm font-semibold text-brand-forest-800">
            Evaluating home sanctuary defense & indoor air infiltration...
          </p>
        </div>
      </AppShell>
    );
  }

  const sanctuaryScore = overview?.sanctuaryScore || 75;

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* ========================================================= */}
        {/* SECTION 1: HEADER & INDOOR AIR QUALITY OVERVIEW */}
        {/* ========================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Badge variant="mint" icon={<Home className="h-3.5 w-3.5" />}>
                Healthy Home Sanctuary
              </Badge>
              <PageTitle className="mt-1">Indoor Air Defense</PageTitle>
              <Subtitle className="mt-1">
                Protect your household with source elimination, sealed defense, clean-room setup, and smart ventilation.
              </Subtitle>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOverview(true)}
                disabled={refreshing}
                className="gap-2 text-xs font-bold"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
                <span>Refresh Status</span>
              </Button>

              <Button
                variant="forest"
                size="sm"
                onClick={handleFetchAiAdvice}
                disabled={loadingAi}
                className="gap-2 text-xs font-bold shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-brand-mint" />
                <span>{loadingAi ? "Analyzing..." : "Get AI Advice"}</span>
              </Button>
            </div>
          </div>

          {/* SENSOR TRANSPARENCY NOTICE (Strict Requirement) */}
          <div className="rounded-2xl border-2 border-brand-amber-500/30 bg-brand-amber-500/5 p-4 sm:p-5 flex items-start gap-3.5">
            <Info className="h-5 w-5 text-brand-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-brand-forest-900 leading-relaxed">
              <span className="font-extrabold text-brand-forest-950">Sensor Transparency: </span>
              {overview?.measurementNotice}
            </div>
          </div>

          {/* Vitals Overview Banner */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Sanctuary Score Card */}
            <Card className="p-5 border-2 border-brand-forest-700/10 bg-white shadow-card relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-700/70">
                    Sanctuary Defense
                  </span>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase",
                      sanctuaryScore >= 75
                        ? "bg-brand-mint text-brand-forest-900"
                        : sanctuaryScore >= 50
                        ? "bg-amber-100 text-amber-900"
                        : "bg-red-100 text-red-900"
                    )}
                  >
                    {overview?.sanctuaryRating}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-brand-forest-900">{sanctuaryScore}</span>
                  <span className="text-xs text-brand-forest-700/60 font-bold">/ 100 Score</span>
                </div>
                <p className="text-xs text-brand-forest-700 mt-2 font-medium">
                  {sanctuaryScore >= 75
                    ? "Well fortified against outdoor smog."
                    : "Moderate infiltration risks detected."}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-brand-forest-700/5">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      sanctuaryScore >= 75 ? "bg-emerald-500" : sanctuaryScore >= 50 ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${sanctuaryScore}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Estimated Indoor PM2.5 */}
            <Card className="p-5 border-2 border-brand-forest-700/10 bg-white shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-700/70">
                    Est. Indoor PM2.5
                  </span>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    Modeled
                  </Badge>
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-brand-forest-900">
                    {overview?.estimatedIndoorPm25.min} – {overview?.estimatedIndoorPm25.max}
                  </span>
                  <span className="text-xs text-brand-forest-700/60 font-bold">µg/m³</span>
                </div>
                <p className="text-xs text-brand-forest-700 mt-2 font-medium">
                  Outdoor: <span className="font-bold text-brand-forest-900">{overview?.outdoorAqi} AQI</span> ({overview?.outdoorCategory})
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-brand-forest-700/5 text-[11px] text-brand-forest-700/80 font-semibold">
                Est. Infiltration: ~{overview?.estimatedInfiltrationRatePercent}%
              </div>
            </Card>

            {/* Ventilation Posture */}
            <Card className="p-5 border-2 border-brand-forest-700/10 bg-white shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-700/70">
                    Window Status
                  </span>
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full animate-pulse",
                      overview?.ventilationStatus.state === "ventilate_recommended"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    )}
                  />
                </div>
                <div className="mt-3">
                  <span className="text-lg font-black text-brand-forest-900 leading-snug block">
                    {overview?.ventilationStatus.state === "keep_closed"
                      ? "Keep Sealed"
                      : overview?.ventilationStatus.state === "ventilate_recommended"
                      ? "Window Open"
                      : "Caution Sealed"}
                  </span>
                  <p className="text-xs text-brand-forest-700 mt-1 line-clamp-2">
                    {overview?.ventilationStatus.title}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-brand-forest-700/5 text-[11px] text-brand-forest-700/80 font-semibold">
                Best window: {overview?.ventilationStatus.bestDiurnalWindow}
              </div>
            </Card>

            {/* Checklist Completion */}
            <Card className="p-5 border-2 border-brand-forest-700/10 bg-white shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-700/70">
                    Daily Habits
                  </span>
                  <Badge variant="mint" className="text-[10px]">
                    {checklistPercentage}% Done
                  </Badge>
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-brand-forest-900">
                    {completedChecklistCount}
                  </span>
                  <span className="text-xs text-brand-forest-700/60 font-bold">/ {totalChecklistCount} Active</span>
                </div>
                <p className="text-xs text-brand-forest-700 mt-2 font-medium">
                  {completedChecklistCount === totalChecklistCount
                    ? "All sanctuary habits completed today! 🌟"
                    : `${totalChecklistCount - completedChecklistCount} habits remaining to fortify air.`}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-brand-forest-700/5">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-brand-forest-800 rounded-full transition-all duration-500"
                    style={{ width: `${checklistPercentage}%` }}
                  />
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ========================================================= */}
        {/* AERO MASCOT DIALOGUE & CONTEXTUAL TIP */}
        {/* ========================================================= */}
        <section className="rounded-3xl border-2 border-brand-mint-300 bg-gradient-to-r from-brand-mint-50/80 via-white to-brand-cream/40 p-6 sm:p-7 shadow-card flex flex-col sm:flex-row items-center gap-6">
          <AeroMascot
            mood="home"
            size="md"
            showSpeechBubble={false}
            className="shrink-0"
          />

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-sm font-black text-brand-forest-950 uppercase tracking-wider">
                Aero&apos;s Sanctuary Briefing
              </span>
              <Badge variant="mint" className="text-[10px]">
                Home Defense
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-brand-forest-800 leading-relaxed font-medium">
              &ldquo;Hello! Indoor air is often 2 to 5 times dirtier than outdoor air when we burn incense or fry without an exhaust. Because outdoor smog is high right now (AQI {overview?.outdoorAqi}), our primary goal is <strong>sealing perimeter leaks</strong>, <strong>wet mopping</strong> instead of dry sweeping, and protecting your <strong>cleaner-air room</strong>!&rdquo;
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-brand-forest-700">
              <span className="inline-flex items-center gap-1 font-bold">
                <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" /> Wet mop only
              </span>
              <span className="inline-flex items-center gap-1 font-bold">
                <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" /> Zero agarbatti
              </span>
              <span className="inline-flex items-center gap-1 font-bold">
                <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" /> Kitchen exhaust on
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* GEMINI AI PERSONALIZED INDOOR ADVICE (IF LOADED) */}
        {/* ========================================================= */}
        {aiAdvice && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border-2 border-brand-forest-800/20 bg-white p-6 sm:p-8 shadow-card space-y-6"
          >
            <div className="flex items-center justify-between border-b border-brand-forest-700/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-brand-forest-700" />
                <h3 className="text-lg font-bold text-brand-forest-900">
                  Gemini Personalized Home Assessment
                </h3>
              </div>
              <Badge variant="mint" className="text-[10px]">
                AI Verified
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-brand-forest-800 leading-relaxed font-medium">
              {aiAdvice.airQualityAssessment}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-brand-mint-50/50 p-4 border border-brand-mint-200">
                <h4 className="font-bold text-xs uppercase tracking-wider text-brand-forest-900 flex items-center gap-1.5 mb-2">
                  <Wind className="h-4 w-4 text-brand-forest-700" /> Ventilation Directive
                </h4>
                <p className="text-xs text-brand-forest-800 leading-relaxed font-medium">
                  {aiAdvice.ventilationWindow?.notes}
                </p>
                <div className="mt-2 text-[11px] font-bold text-brand-forest-700">
                  Recommended window: {aiAdvice.ventilationWindow?.bestTimeWindow || "1:00 PM – 3:30 PM"}
                </div>
              </div>

              <div className="rounded-2xl bg-brand-cream/40 p-4 border border-brand-cream/80">
                <h4 className="font-bold text-xs uppercase tracking-wider text-brand-forest-900 flex items-center gap-1.5 mb-2">
                  <Filter className="h-4 w-4 text-brand-forest-700" /> Air Purifier Strategy
                </h4>
                <p className="text-xs text-brand-forest-800 leading-relaxed font-medium">
                  {aiAdvice.purifierAction?.notes}
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {/* ========================================================= */}
        {/* SECTION 10: INDOOR DAILY CHECKLIST (INTERACTIVE) */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <SectionTitle>Daily Indoor Air Checklist</SectionTitle>
              <Subtitle>
                Check off healthy practices as you maintain clean air throughout the day.
              </Subtitle>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-black text-brand-forest-900">
                {completedChecklistCount} of {totalChecklistCount} Completed
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {overview?.checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleChecklist(item)}
                className={cn(
                  "cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 flex flex-col justify-between select-none shadow-xs",
                  item.completed
                    ? "bg-brand-mint-50/60 border-brand-forest-700/30 text-brand-forest-950"
                    : "bg-white border-brand-forest-700/10 hover:border-brand-forest-700/20 text-brand-forest-800"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition-colors",
                      item.completed
                        ? "border-brand-forest-800 bg-brand-forest-800 text-white"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {item.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>

                  <div className="space-y-1">
                    <h4
                      className={cn(
                        "text-xs sm:text-sm font-bold leading-tight",
                        item.completed && "line-through text-brand-forest-900/70"
                      )}
                    >
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-brand-forest-700/80 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-brand-forest-700/5 flex items-center justify-between text-[10px] font-bold">
                  <span className="uppercase tracking-wider text-brand-forest-600">
                    {item.category}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5",
                      item.impact === "high" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                    )}
                  >
                    {item.impact === "high" ? "High Impact" : "Medium Impact"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2 & 7: VENTILATION STATUS & WINDOW OPENING GUIDANCE */}
        {/* ========================================================= */}
        <section className="rounded-3xl border-2 border-brand-forest-700/10 bg-white p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-forest-700/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-brand-forest-700" />
                <h3 className="text-lg font-bold text-brand-forest-900">
                  Window Opening & Ventilation Guidance
                </h3>
              </div>
              <p className="text-xs text-brand-forest-700 mt-0.5">
                Dynamic recommendation tied directly to current outdoor AQI ({overview?.outdoorAqi}) and diurnal inversion physics.
              </p>
            </div>

            <Badge
              variant={
                overview?.ventilationStatus.state === "ventilate_recommended"
                  ? "mint"
                  : overview?.ventilationStatus.state === "keep_closed"
                  ? "outline"
                  : "cream"
              }
              className="self-start sm:self-auto font-black"
            >
              {overview?.ventilationStatus.title}
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-forest-900">
                  <Clock className="h-4 w-4 text-brand-forest-700" />
                  <span>Optimal Diurnal Ventilation Window:</span>
                </div>
                <div className="text-sm font-black text-brand-forest-950">
                  {overview?.ventilationStatus.bestDiurnalWindow}
                </div>
                <p className="text-xs text-brand-forest-700 leading-relaxed font-medium">
                  {overview?.ventilationStatus.reason}
                </p>
              </div>

              <div className="text-xs text-brand-forest-800 leading-relaxed space-y-2 font-medium">
                <p>
                  <strong>Why Timing Matters:</strong> In northern India, nocturnal surface cooling creates a strong <em>temperature inversion</em> that traps heavy vehicular and stubble smoke close to the ground between 6:00 AM and 10:00 AM.
                </p>
                <p>
                  Opening windows in the morning fills your home with toxic fine particles. If your home feels stuffy, wait until the afternoon sun expands the atmospheric boundary layer, or run mechanical air purifiers.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-brand-forest-700/10 p-5 bg-gradient-to-br from-brand-mint-50/40 to-white space-y-3">
              <h4 className="font-bold text-sm text-brand-forest-900 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-brand-forest-700" />
                Air Exchange Rules for Your Home
              </h4>
              <ul className="text-xs text-brand-forest-800 space-y-2 font-medium">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-brand-forest-950">1.</span>
                  <span><strong>Outdoor AQI &gt; 250:</strong> Keep all exterior windows shut 24/7. Use recirculating AC or air purifiers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-brand-forest-950">2.</span>
                  <span><strong>CO2 Management:</strong> If carbon dioxide exceeds 1000 ppm, open opposing windows for just 10 minutes at 2:00 PM, then immediately reseal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-brand-forest-950">3.</span>
                  <span><strong>Balcony Doors:</strong> Keep sliding mesh screens shut to prevent particulate-laden dust intrusion.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: CLEANER-AIR ROOM SUGGESTIONS */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div>
            <SectionTitle>Designated Cleaner-Air Room</SectionTitle>
            <Subtitle>
              When outdoor pollution spikes, consolidate your family&apos;s clean air defenses into one fortified sanctuary room.
            </Subtitle>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {overview?.cleanerRoomGuidance.steps.map((step, idx) => (
              <Card
                key={idx}
                className="p-5 border-2 border-brand-forest-700/10 bg-white shadow-card flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="h-7 w-7 rounded-xl bg-brand-forest-800 text-white flex items-center justify-center text-xs font-black">
                      {idx + 1}
                    </span>
                    <Badge variant="mint" className="text-[10px]">
                      Sanctuary
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm text-brand-forest-900 mt-2">
                    {step.title}
                  </h4>
                  <p className="text-xs text-brand-forest-700/80 leading-relaxed font-medium">
                    {step.instruction}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: INDOOR POLLUTION SOURCES */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div>
            <SectionTitle>Major Indoor Pollution Culprits</SectionTitle>
            <Subtitle>
              Avoid these 5 common household habits that generate severe internal PM2.5 spikes.
            </Subtitle>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {overview?.pollutionSources.map((source, idx) => (
              <Card
                key={idx}
                className="p-5 border-2 border-brand-forest-700/10 bg-white shadow-card flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-brand-forest-950 flex items-center gap-1.5">
                      <Flame className="h-4 w-4 text-brand-coral" />
                      {source.name}
                    </h4>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-black uppercase",
                        source.severity === "critical"
                          ? "bg-red-100 text-red-800"
                          : source.severity === "high"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      )}
                    >
                      {source.severity}
                    </span>
                  </div>

                  <div className="text-[11px] font-bold text-brand-coral">
                    Typical Spike: {source.pm25Contribution}
                  </div>

                  <p className="text-xs text-brand-forest-800/80 leading-relaxed font-medium">
                    {source.riskDetails}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-forest-700/5 text-xs text-emerald-800 font-semibold bg-emerald-50/60 p-2.5 rounded-xl">
                  <span className="font-black text-emerald-950 block text-[10px] uppercase tracking-wider mb-0.5">
                    Safer Alternative:
                  </span>
                  {source.saferAlternative}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5 & 6: COOKING SAFETY & CLEANING RECOMMENDATIONS */}
        {/* ========================================================= */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Section 5: Cooking Safety */}
          <Card className="p-6 sm:p-7 border-2 border-brand-forest-700/10 bg-white shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-brand-forest-700/10 pb-3">
              <Flame className="h-5 w-5 text-brand-coral" />
              <h3 className="text-base font-bold text-brand-forest-900">
                Cooking Safety & Fume Defense
              </h3>
            </div>

            <div className="space-y-3 text-xs text-brand-forest-800 font-medium">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="font-black text-brand-forest-950 block">1. Exhaust Fan Pre-Drafting</span>
                <p className="text-brand-forest-700 leading-relaxed">
                  {overview?.cookingSafety.exhaustTiming}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="font-black text-brand-forest-950 block">2. Pan Lid Containment</span>
                <p className="text-brand-forest-700 leading-relaxed">
                  {overview?.cookingSafety.panLidTechnique}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="font-black text-brand-forest-950 block">3. Tadka & Deep-Frying Protocol</span>
                <p className="text-brand-forest-700 leading-relaxed">
                  {overview?.cookingSafety.tadkaMitigation}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-brand-mint-50/60 border border-brand-mint-200 text-brand-forest-900">
                <span className="font-black block text-[11px] uppercase tracking-wider mb-0.5">
                  Personalized Fuel Note:
                </span>
                <p className="text-xs text-brand-forest-800">
                  {overview?.cookingSafety.fuelNotice}
                </p>
              </div>
            </div>
          </Card>

          {/* Section 6: Cleaning Recommendations (Wet Mop vs Dry Sweep) */}
          <Card className="p-6 sm:p-7 border-2 border-brand-forest-700/10 bg-white shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-brand-forest-700/10 pb-3">
              <Droplets className="h-5 w-5 text-brand-sky-700" />
              <h3 className="text-base font-bold text-brand-forest-900">
                Cleaning: Wet Mopping vs. Dry Sweeping
              </h3>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 p-4">
                <span className="font-black text-xs uppercase tracking-wider text-amber-950 block mb-1">
                  ⚠️ The Dry Sweeping Hazard
                </span>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {overview?.cleaningAdvice.wetMoppingVsSweeping.whySweepingIsHarmful}
                </p>
              </div>

              <div className="rounded-2xl bg-brand-mint-50/80 border-2 border-brand-mint-300 p-4">
                <span className="font-black text-xs uppercase tracking-wider text-brand-forest-950 block mb-1">
                  ✨ The Wet Mopping Rule
                </span>
                <p className="text-xs text-brand-forest-900 leading-relaxed font-medium">
                  {overview?.cleaningAdvice.wetMoppingVsSweeping.wetMoppingMethod}
                </p>
              </div>

              <div className="space-y-2 text-xs text-brand-forest-800 font-medium">
                <span className="font-bold text-brand-forest-950 block">Damp Dusting Tips:</span>
                <ul className="list-disc list-inside space-y-1 text-brand-forest-700 text-[11px]">
                  {overview?.cleaningAdvice.dustingTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* ========================================================= */}
        {/* SECTION 8: AIR PURIFIER GUIDANCE & CADR CALCULATOR */}
        {/* ========================================================= */}
        <section className="rounded-3xl border-2 border-brand-forest-700/10 bg-white p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-forest-700/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-brand-forest-700" />
                <h3 className="text-lg font-bold text-brand-forest-900">
                  Air Purifier Sizing & CADR Calculator
                </h3>
              </div>
              <p className="text-xs text-brand-forest-700 mt-0.5">
                Calculate the exact Clean Air Delivery Rate (CADR) required for healthy air turnover in your rooms.
              </p>
            </div>

            <Badge variant="mint" className="self-start sm:self-auto font-black text-xs">
              4.8 Air Changes / Hour Target
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Interactive Calculator */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="font-bold text-sm text-brand-forest-900 flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-brand-forest-700" />
                Room CADR Requirement Calculator
              </h4>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-brand-forest-800 mb-1">
                    <span>Room Floor Area:</span>
                    <span className="text-brand-forest-950 font-black">{roomAreaSqFt} sq ft</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="600"
                    step="10"
                    value={roomAreaSqFt}
                    onChange={(e) => setRoomAreaSqFt(Number(e.target.value))}
                    className="w-full accent-brand-forest-800 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-0.5">
                    <span>80 sq ft (nursery)</span>
                    <span>300 sq ft (bedroom)</span>
                    <span>600 sq ft (living hall)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-brand-forest-800 mb-1">
                    <span>Ceiling Height:</span>
                    <span className="text-brand-forest-950 font-black">{ceilingHeightFt} feet</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="12"
                    step="1"
                    value={ceilingHeightFt}
                    onChange={(e) => setCeilingHeightFt(Number(e.target.value))}
                    className="w-full accent-brand-forest-800 cursor-pointer"
                  />
                </div>
              </div>

              {/* Calculated Result Card */}
              <div className="p-4 rounded-xl bg-brand-mint text-brand-forest-950 space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider block">
                  Required Clean Air Delivery Rate (CADR):
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black">{requiredCadrM3H}</span>
                  <span className="text-xs font-bold">m³/h</span>
                  <span className="text-xs font-semibold text-brand-forest-800">
                    (~{requiredCadrCfm} CFM)
                  </span>
                </div>
                <p className="text-[11px] text-brand-forest-900/80 font-medium pt-1">
                  This CADR cleans the entire air volume of your {roomAreaSqFt} sq ft room approximately every 12.5 minutes (4.8 times an hour).
                </p>
              </div>
            </div>

            {/* Purifier Hygiene & Ozone Warning */}
            <div className="space-y-4 text-xs text-brand-forest-800 font-medium">
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-950 space-y-1">
                <span className="font-black text-xs uppercase tracking-wider block flex items-center gap-1.5 text-red-800">
                  <ShieldAlert className="h-4 w-4 text-red-700" />
                  Warning: Avoid Ionizers & Ozone Emitters
                </span>
                <p className="text-[11px] text-red-900 leading-relaxed font-medium">
                  {overview?.purifierGuidance.ozoneWarning}
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-brand-forest-950 block text-xs">
                  Filter Hygiene & Longevity Rules:
                </span>
                <ul className="list-disc list-inside space-y-1.5 text-[11px] text-brand-forest-700">
                  {overview?.purifierGuidance.filterMaintenance.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* DIY Option Callout */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-brand-forest-900">
                <span className="font-black text-[11px] uppercase tracking-wider block text-brand-forest-800">
                  DIY Budget Option: {overview?.purifierGuidance.diyOption.name}
                </span>
                <p className="text-[11px] text-brand-forest-700 mt-0.5">
                  {overview?.purifierGuidance.diyOption.description} (Approx cost: ₹{overview?.purifierGuidance.diyOption.estimatedCostInr})
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 9: LOW-COST INTERVENTIONS */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <SectionTitle>Low-Cost & Zero-Budget Solutions</SectionTitle>
              <Subtitle>
                Practical interventions that significantly reduce indoor particulate infiltration without expensive gadgets.
              </Subtitle>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setBudgetTab("all")}
                className={cn(
                  "px-3 py-1 rounded-lg transition-colors",
                  budgetTab === "all" ? "bg-white text-brand-forest-950 shadow-xs" : "text-brand-forest-700 hover:text-brand-forest-950"
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setBudgetTab("free")}
                className={cn(
                  "px-3 py-1 rounded-lg transition-colors",
                  budgetTab === "free" ? "bg-white text-brand-forest-950 shadow-xs" : "text-brand-forest-700 hover:text-brand-forest-950"
                )}
              >
                ₹0 (Free)
              </button>
              <button
                type="button"
                onClick={() => setBudgetTab("under_500")}
                className={cn(
                  "px-3 py-1 rounded-lg transition-colors",
                  budgetTab === "under_500" ? "bg-white text-brand-forest-950 shadow-xs" : "text-brand-forest-700 hover:text-brand-forest-950"
                )}
              >
                &lt; ₹500
              </button>
              <button
                type="button"
                onClick={() => setBudgetTab("under_1500")}
                className={cn(
                  "px-3 py-1 rounded-lg transition-colors",
                  budgetTab === "under_1500" ? "bg-white text-brand-forest-950 shadow-xs" : "text-brand-forest-700 hover:text-brand-forest-950"
                )}
              >
                &lt; ₹1,500
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSolutions.map((sol, idx) => (
              <Card
                key={idx}
                className="p-5 border-2 border-brand-forest-700/10 bg-white shadow-card flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {sol.costEstimate}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {sol.impact}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm text-brand-forest-950 mt-1">
                    {sol.title}
                  </h4>
                  <p className="text-xs text-brand-forest-700/80 leading-relaxed font-medium">
                    {sol.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-forest-700/5 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-brand-forest-600">
                    Household defense
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      toast({
                        type: "success",
                        title: "Great Step!",
                        message: `Marked "${sol.title}" as implemented in your home defense.`,
                      })
                    }
                    className="text-xs font-bold text-brand-forest-900 hover:text-brand-forest-700 underline"
                  >
                    Mark Applied ✓
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SCIENTIFIC MYTH BUSTER: HOUSEPLANTS & CLEAN AIR (Strict Requirement) */}
        {/* ========================================================= */}
        <section className="rounded-3xl border-2 border-brand-forest-800/20 bg-gradient-to-br from-emerald-50/50 via-white to-brand-mint-50/30 p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-brand-forest-700/10 pb-3">
            <Leaf className="h-5 w-5 text-emerald-700" />
            <h3 className="text-base sm:text-lg font-bold text-brand-forest-950">
              Science Check: Do Houseplants Actually Filter Room Air?
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 text-xs sm:text-sm text-brand-forest-800 leading-relaxed font-medium">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950">
                <span className="font-black block text-xs uppercase tracking-wider mb-1">
                  The Popular Myth
                </span>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {overview?.plantMythBuster.myth}
                </p>
              </div>

              <p className="text-xs leading-relaxed text-brand-forest-800">
                {overview?.plantMythBuster.scientificTruth}
              </p>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-brand-forest-800 leading-relaxed font-medium">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-brand-forest-900">
                <span className="font-black block text-xs uppercase tracking-wider mb-1 text-slate-800">
                  Why the 1989 NASA Study Was Misunderstood
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {overview?.plantMythBuster.nasaStudyClarification}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-xs leading-relaxed">
                <span className="font-black block uppercase tracking-wider mb-1 text-emerald-900">
                  The Scientific Verdict
                </span>
                {overview?.plantMythBuster.verdict}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 11: HOME HEALTH MISSIONS (GAMIFICATION & XP) */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <SectionTitle>Home Health Defense Missions</SectionTitle>
              <Subtitle>
                Complete verified indoor defense tasks to earn XP and level up your sanctuary.
              </Subtitle>
            </div>
            <Badge variant="lavender" className="self-start sm:self-auto font-black text-xs">
              Gamified Protection
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {overview?.homeMissions.map((mission) => (
              <Card
                key={mission.id}
                className={cn(
                  "p-5 border-2 transition-all flex flex-col justify-between shadow-card",
                  mission.completed
                    ? "bg-brand-mint-50/40 border-brand-forest-700/20 text-brand-forest-900"
                    : "bg-white border-brand-forest-700/10 text-brand-forest-800 hover:border-brand-forest-700/20"
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-brand-forest-600 uppercase tracking-wider">
                      {mission.category} • {mission.duration}
                    </span>
                    <Badge variant="mint" className="font-black text-xs">
                      +{mission.xpReward} XP
                    </Badge>
                  </div>

                  <h4 className="font-bold text-base text-brand-forest-950 mt-2">
                    {mission.title}
                  </h4>
                  <p className="text-xs text-brand-forest-700/80 leading-relaxed font-medium mt-1">
                    {mission.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-brand-forest-700/10 flex items-center justify-between">
                  {mission.completed ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Completed! (+{mission.xpReward} XP)</span>
                    </div>
                  ) : (
                    <Button
                      variant="forest"
                      size="sm"
                      onClick={() => handleCompleteMission(mission)}
                      className="w-full gap-2 font-bold shadow-xs text-xs"
                    >
                      <Trophy className="h-3.5 w-3.5 text-brand-mint" />
                      <span>Complete Mission (+{mission.xpReward} XP)</span>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
