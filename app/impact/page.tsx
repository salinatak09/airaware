"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useShell } from "@/components/layout/shell-context";
import {
  Flame,
  Award,
  Sparkles,
  ShieldCheck,
  Trophy,
  CheckCircle2,
  Lock,
  Heart,
  TrendingUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { HabitCard } from "@/components/ui/habit-card";
import { MetricCard } from "@/components/ui/metric-card";
import { PageTitle, SectionTitle, Subtitle } from "@/components/ui/typography";
import { useToast } from "@/components/ui/toast";

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

export default function ImpactPage() {
  const { userStats } = useShell();
  const { toast } = useToast();

  const badges: BadgeItem[] = [
    { id: "b-1", name: "Early Bird Air Check", description: "Checked AQI before 7:30 AM 5 times", icon: "🌅", earned: true, earnedDate: "Yesterday" },
    { id: "b-2", name: "Sanctuary Guardian", description: "Kept nursery PM2.5 < 10 µg/m³ for 72 hours", icon: "🛡️", earned: true, earnedDate: "3 days ago" },
    { id: "b-3", name: "7-Day Clean Air Streak", description: "Maintained active protection routine for a full week", icon: "🔥", earned: true, earnedDate: "Earned Today!" },
    { id: "b-4", name: "Cross-Ventilation Pro", description: "Aired home during 10 optimal afternoon windows", icon: "🍃", earned: false },
    { id: "b-5", name: "Pediatric Champion", description: "Created customized air rules for 2+ children", icon: "🧸", earned: false },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge variant="yellow" icon={<Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />}>
              Family Health Gamification
            </Badge>
            <PageTitle className="mt-1">Clean Air Impact & Habits</PageTitle>
            <Subtitle className="mt-1">
              Celebrate healthy habits, track avoided pollution exposure, and earn family health rewards.
            </Subtitle>
          </div>

          <Button
            variant="forest"
            size="sm"
            onClick={() =>
              toast({
                type: "success",
                title: "Impact Certificate Shared",
                message: "Summary exported to family WhatsApp group.",
              })
            }
            className="gap-2 font-bold shadow-xs"
          >
            <Trophy className="h-4 w-4" />
            <span>Share Family Impact</span>
          </Button>
        </div>

        {/* Hero Gamification Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#FFFBEA] via-[#FFF8E8] to-[#F0FAF5] p-6 sm:p-8 border-2 border-brand-yellow-300 shadow-soft">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 font-black text-lg">
                  🔥
                </span>
                <div>
                  <h3 className="text-2xl font-black text-brand-forest-900">
                    {userStats.streakDays} Day Protection Streak!
                  </h3>
                  <p className="text-xs font-semibold text-brand-forest-700/80">
                    Your family has maintained smog precautions every single day this week.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/80 p-4 rounded-2xl border border-brand-yellow-300 backdrop-blur-xs">
              <div className="text-right">
                <span className="text-2xl font-black text-brand-forest-900">{userStats.points}</span>
                <p className="text-[10px] font-bold text-brand-forest-700/70 uppercase">Total XP</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <span className="text-sm font-black text-amber-800">{userStats.level}</span>
                <p className="text-[10px] text-brand-forest-700/70">Next: Clean Air Legend at 2,000 XP</p>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6 pt-4 border-t border-amber-200/60">
            <ProgressBar value={71} variant="yellow" label="Progress to Level 4" showValue />
          </div>
        </div>

        {/* Impact Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            title="PM2.5 Exposure Blocked"
            value="1,480"
            unit="µg"
            icon={<ShieldCheck className="h-4 w-4 text-emerald-700" />}
            subtitle="Equivalent to avoiding 18 cigarettes"
            variant="mint"
          />
          <MetricCard
            title="Clean Outdoor Hours"
            value="16.5"
            unit="hrs"
            icon={<Sparkles className="h-4 w-4 text-amber-700" />}
            subtitle="Exercised strictly during safe windows"
            variant="cream"
          />
          <MetricCard
            title="Habits Accomplished"
            value="24"
            unit="Total"
            icon={<CheckCircle2 className="h-4 w-4 text-sky-700" />}
            subtitle="100% adherence on red smog days"
            variant="sky"
          />
        </div>

        {/* Badges Collection */}
        <section className="space-y-4">
          <SectionTitle>Family Achievement Badges</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((b) => (
              <Card
                key={b.id}
                className={`p-5 border-2 transition-all ${
                  b.earned
                    ? "bg-white border-brand-mint-200 shadow-card"
                    : "bg-slate-50/60 border-slate-200 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F0FAF5] text-2xl shadow-xs">
                    {b.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-brand-forest-900">{b.name}</h4>
                      {!b.earned && <Lock className="h-3 w-3 text-slate-400" />}
                    </div>
                    <p className="mt-1 text-xs text-brand-forest-800/80 leading-relaxed">
                      {b.description}
                    </p>
                    {b.earned && b.earnedDate && (
                      <span className="mt-2 inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                        {b.earnedDate}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Habit Trackers */}
        <section className="space-y-3">
          <SectionTitle>Active Daily Habit Checklists</SectionTitle>
          <div className="space-y-3">
            <HabitCard
              id="impact-h1"
              title="Replace Mask Filters When Discolored"
              category="Respiratory"
              pointsReward={40}
              completed={true}
              description="Inspect Aarav and Rohit's N95 masks for particulate saturation."
            />
            <HabitCard
              id="impact-h2"
              title="Activate Kitchen Exhaust During Sautéing"
              category="Indoor VOCs"
              pointsReward={30}
              completed={false}
              description="Reduces sudden indoor ultra-fine spikes by 60%."
            />
            <HabitCard
              id="impact-h3"
              title="Water Indoor Areca Palms & Snake Plants"
              category="Natural Filtration"
              pointsReward={20}
              completed={false}
              description="Helps regulate indoor ambient humidity and absorbs trace formaldehyde."
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
