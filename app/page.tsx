"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Wind,
  ShieldCheck,
  Sparkles,
  Flame,
  CheckCircle2,
  Thermometer,
  Filter,
  UserPlus,
} from "lucide-react";
import { AqiCard } from "@/components/ui/aqi-card";
import { MetricCard } from "@/components/ui/metric-card";
import { HabitCard } from "@/components/ui/habit-card";
import { RecommendationCard } from "@/components/ui/recommendation-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar, AqiSpectrumBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonMetric } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { PageTitle, SectionTitle, Subtitle, MetricValue, FriendlyLabel } from "@/components/ui/typography";

export default function DesignSystemPage() {
  const { toast } = useToast();
  const [demoAqi, setDemoAqi] = React.useState<number>(85);
  const [habitProgress, setHabitProgress] = React.useState<number>(60);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <AppShell cityName="New Delhi" currentAqi={demoAqi}>
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="rounded-3xl bg-gradient-to-br from-[#F0FAF5] via-[#FFF8E8] to-[#F0F9FF] p-6 sm:p-10 border-2 border-brand-mint-200/60 shadow-soft">
          <div className="max-w-3xl space-y-3">
            <Badge variant="forest" icon={<Sparkles className="h-3.5 w-3.5" />}>
              AirAware Design System v1.0
            </Badge>
            <PageTitle className="mt-2">
              Breathe smarter.{" "}
              <span className="bg-gradient-to-r from-brand-forest-700 via-brand-forest-900 to-emerald-800 bg-clip-text text-transparent">
                Live better.
              </span>
            </PageTitle>
            <Subtitle>
              A friendly, modern, and trustworthy design system built for urban families facing severe
              pollution. Featuring soft organic gradients, generous rounded corners, strict AQI severity
              compliance, and joyful gamification.
            </Subtitle>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Button
                variant="forest"
                onClick={() =>
                  toast({
                    type: "success",
                    title: "Streak Boosted!",
                    message: "You checked the morning AQI. +50 Clean Air XP earned!",
                  })
                }
                className="gap-2"
              >
                <Flame className="h-4 w-4 fill-brand-mint text-brand-mint" />
                <span>Test Interactive Toast</span>
              </Button>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="cream" className="gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand-forest-800" />
                    <span>Open Plan Modal</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Family Daily Clean Air Plan</DialogTitle>
                    <DialogDescription>
                      Tailored recommendations for today based on current AQI {demoAqi}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="rounded-2xl bg-[#F0FAF5] p-4 border border-brand-mint-200">
                      <h5 className="font-bold text-sm text-brand-forest-900">Recommended Outdoor Window</h5>
                      <p className="text-xs text-brand-forest-800/80 mt-1">
                        Best air quality expected between <strong>2:00 PM – 4:30 PM</strong> when dispersion is peak.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#FFF8E8] p-4 border border-brand-cream-300">
                      <h5 className="font-bold text-sm text-brand-forest-900">Vulnerable Members Alert</h5>
                      <p className="text-xs text-brand-forest-800/80 mt-1">
                        Ensure inhalers are handy for asthmatic members and seal north-facing bedroom windows.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="forest" onClick={() => setIsDialogOpen(false)}>
                      Got it, thanks!
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* 1. Color Tokens System */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <SectionTitle>Brand Color Palette & Tokens</SectionTitle>
              <p className="text-sm text-brand-forest-700/70">
                Gentle, nature-inspired pastels designed to calm anxiety while preserving crystal-clear clarity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { name: "Mint Primary", hex: "#78D6B0", bg: "bg-[#78D6B0]", text: "text-brand-forest-900" },
              { name: "Forest Green", hex: "#175C48", bg: "bg-[#175C48]", text: "text-white" },
              { name: "Background", hex: "#F7FAF7", bg: "bg-[#F7FAF7] border-2", text: "text-brand-forest-900" },
              { name: "Cream", hex: "#FFF8E8", bg: "bg-[#FFF8E8]", text: "text-brand-forest-900" },
              { name: "Sky Blue", hex: "#BFE8FF", bg: "bg-[#BFE8FF]", text: "text-brand-forest-900" },
              { name: "Lavender", hex: "#DCD3FF", bg: "bg-[#DCD3FF]", text: "text-brand-forest-900" },
              { name: "Peach", hex: "#FFD6BD", bg: "bg-[#FFD6BD]", text: "text-brand-forest-900" },
              { name: "Yellow", hex: "#FFE58A", bg: "bg-[#FFE58A]", text: "text-brand-forest-900" },
            ].map((token) => (
              <div
                key={token.name}
                className="flex flex-col rounded-2xl border border-brand-forest-700/10 p-3 shadow-xs bg-white"
              >
                <div className={`h-14 w-full rounded-xl ${token.bg} flex items-center justify-center font-bold text-xs ${token.text}`}>
                  {token.hex}
                </div>
                <span className="mt-2 text-xs font-bold text-brand-forest-900">{token.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Interactive AQI Severity System */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <SectionTitle>Strict AQI Severity Spectrum</SectionTitle>
              <p className="text-sm text-brand-forest-700/70">
                Rule: Green is strictly reserved for Good (0-50). Dangerous levels are never green.
              </p>
            </div>

            {/* Quick Interactive AQI Simulators */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold mr-1 text-brand-forest-800">Simulate:</span>
              <button
                type="button"
                onClick={() => setDemoAqi(35)}
                className="rounded-full bg-[#E0F5EB] px-3 py-1 text-xs font-bold text-[#175C48] hover:scale-105 transition-transform"
              >
                35 Good
              </button>
              <button
                type="button"
                onClick={() => setDemoAqi(85)}
                className="rounded-full bg-[#FFFBEA] px-3 py-1 text-xs font-bold text-[#854D0E] hover:scale-105 transition-transform"
              >
                85 Mod
              </button>
              <button
                type="button"
                onClick={() => setDemoAqi(135)}
                className="rounded-full bg-[#FFF7ED] px-3 py-1 text-xs font-bold text-[#9A3412] hover:scale-105 transition-transform"
              >
                135 Sens
              </button>
              <button
                type="button"
                onClick={() => setDemoAqi(185)}
                className="rounded-full bg-[#FEF2F2] px-3 py-1 text-xs font-bold text-[#991B1B] hover:scale-105 transition-transform"
              >
                185 Unhealthy
              </button>
              <button
                type="button"
                onClick={() => setDemoAqi(260)}
                className="rounded-full bg-[#FAF5FF] px-3 py-1 text-xs font-bold text-[#6B21A8] hover:scale-105 transition-transform"
              >
                260 Very Unhealthy
              </button>
              <button
                type="button"
                onClick={() => setDemoAqi(380)}
                className="rounded-full bg-[#FFF1F2] px-3 py-1 text-xs font-bold text-[#4C0519] hover:scale-105 transition-transform"
              >
                380 Haz
              </button>
            </div>
          </div>

          {/* Live Hero Aqi Card */}
          <AqiCard aqi={demoAqi} cityName="Central Delhi" stationName="Lodhi Road Air Station" />

          {/* AQI Spectrum Multi-Segment Progress Bar */}
          <div className="rounded-3xl bg-white p-6 border border-brand-forest-700/10 shadow-card">
            <AqiSpectrumBar aqi={demoAqi} />
          </div>
        </section>

        {/* 3. Reusable Metric Cards */}
        <section className="space-y-4">
          <SectionTitle>Environmental & Health Metric Cards</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="PM2.5 Concentration"
              value="38.5"
              unit="µg/m³"
              icon={<Wind className="h-4 w-4 text-brand-forest-800" />}
              subtitle="WHO standard: < 15 µg/m³"
              variant="mint"
            />
            <MetricCard
              title="Outdoor Safety Score"
              value="7.2"
              unit="/ 10"
              icon={<ShieldCheck className="h-4 w-4 text-brand-forest-800" />}
              trend="up"
              trendLabel="+1.4 Safe"
              subtitle="Improving over past 3h"
              variant="cream"
            />
            <MetricCard
              title="Air Purifier Lifespan"
              value="78%"
              unit="Healthy"
              icon={<Filter className="h-4 w-4 text-brand-forest-800" />}
              subtitle="Replace filter in 42 days"
              variant="sky"
            />
            <MetricCard
              title="Temperature & Humid"
              value="24°C"
              unit="48% RH"
              icon={<Thermometer className="h-4 w-4 text-brand-forest-800" />}
              subtitle="Optimal indoor comfort"
              variant="lavender"
            />
          </div>
        </section>

        {/* 4. Buttons & Badges Matrix */}
        <section className="space-y-6">
          <SectionTitle>Buttons & Badges System</SectionTitle>

          <Card className="p-6 sm:p-8 space-y-6 bg-white shadow-card">
            <div>
              <FriendlyLabel>Button Variants</FriendlyLabel>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button variant="primary">Mint Primary</Button>
                <Button variant="forest">Forest Solid</Button>
                <Button variant="cream">Cream Soft</Button>
                <Button variant="sky">Sky Pastel</Button>
                <Button variant="lavender">Lavender</Button>
                <Button variant="peach">Peach Urgent</Button>
                <Button variant="soft">Soft Tinted</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="primary" isLoading>Loading...</Button>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-mint-100">
              <FriendlyLabel>Badges & Severity Pills</FriendlyLabel>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="mint" icon={<CheckCircle2 className="h-3 w-3" />}>Mint Tag</Badge>
                <Badge variant="forest">Forest Active</Badge>
                <Badge variant="cream">Cream Category</Badge>
                <Badge variant="sky">Sky Filter</Badge>
                <Badge variant="lavender">Lavender Persona</Badge>
                <Badge variant="peach">Peach Advisory</Badge>
                <Badge variant="yellow">Yellow Alert</Badge>
                <Badge variant="aqiGood">AQI Good (0-50)</Badge>
                <Badge variant="aqiModerate">AQI Moderate (51-100)</Badge>
                <Badge variant="aqiSensitive">AQI Sensitive (101-150)</Badge>
                <Badge variant="aqiUnhealthy">AQI Unhealthy (151-200)</Badge>
                <Badge variant="aqiVeryUnhealthy">AQI Very Unhealthy (201-300)</Badge>
                <Badge variant="aqiHazardous">AQI Hazardous (301+)</Badge>
              </div>
            </div>
          </Card>
        </section>

        {/* 5. Progress Bars & Gamified Habit Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <SectionTitle>Gamification & Habit Tracking</SectionTitle>
              <p className="text-sm text-brand-forest-700/70">
                Encourages daily routines to mitigate exposure and maintain indoor air health.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Habits list */}
            <div className="lg:col-span-2 space-y-3">
              <HabitCard
                id="habit-1"
                title="Morning Air Quality Check"
                category="Daily Routine"
                pointsReward={30}
                completed={true}
                description="Check city AQI before leaving the house or sending children to school."
                onToggle={(_id, done) => {
                  setHabitProgress((p) => (done ? Math.min(100, p + 20) : Math.max(0, p - 20)));
                  if (done) {
                    toast({
                      type: "success",
                      title: "Habit Checked!",
                      message: "+30 XP earned towards Clean Air Hero level.",
                    });
                  }
                }}
              />
              <HabitCard
                id="habit-2"
                title="Seal bedroom windows during peak smog"
                category="Indoor Health"
                pointsReward={40}
                completed={false}
                description="Keep north-facing windows shut between 6 AM and 10 AM."
                onToggle={(_id, done) => {
                  setHabitProgress((p) => (done ? Math.min(100, p + 20) : Math.max(0, p - 20)));
                }}
              />
              <HabitCard
                id="habit-3"
                title="Wipe HEPA Pre-Filter Mesh"
                category="Maintenance"
                pointsReward={50}
                completed={false}
                description="Extends primary filter life by 35% in high-particulate seasons."
                onToggle={(_id, done) => {
                  setHabitProgress((p) => (done ? Math.min(100, p + 20) : Math.max(0, p - 20)));
                }}
              />
            </div>

            {/* Daily Habit Progress Gauge */}
            <Card className="p-6 bg-white shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-brand-forest-800">
                    Daily Clean Air Score
                  </span>
                  <Badge variant="yellow" className="text-xs font-bold">Level 3</Badge>
                </div>
                <div className="mt-4">
                  <MetricValue value={`${habitProgress}%`} />
                  <p className="mt-1 text-xs text-brand-forest-700/70">
                    3 of 5 healthy habits accomplished today.
                  </p>
                </div>
                <div className="mt-6">
                  <ProgressBar value={habitProgress} variant="mint" label="Overall Progress" showValue />
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-[#FFF8E8] p-3.5 border border-brand-cream-300">
                <span className="text-xs font-bold text-brand-forest-900">Next Streak Reward</span>
                <p className="mt-0.5 text-xs text-brand-forest-800/80">
                  Keep a 7-day streak to unlock the <strong>&ldquo;Clean Air Guardian&rdquo;</strong> family badge!
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* 6. AI Recommendation Cards */}
        <section className="space-y-4">
          <SectionTitle>AI Health Advisor Recommendations</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <RecommendationCard
              title="School Commute Alert"
              advice="Smog layer is thickest until 9:30 AM. Ensure children wear properly fitted N95 masks while waiting for the school bus."
              targetAudience="Children & Students"
              urgency="high"
              actionLabel="Mask Guide"
              onAction={() =>
                toast({
                  type: "info",
                  title: "Pediatric Mask Fit Guide",
                  message: "Ensure child-size N95 has no gaps around nose bridge.",
                })
              }
            />
            <RecommendationCard
              title="Indoor Ventilation Window"
              advice="Outdoor particulate drops around 2 PM. Run high-velocity cross-ventilation for 20 minutes, then turn on purifiers."
              targetAudience="Indoor Air"
              urgency="medium"
              actionLabel="Set Reminder"
              onAction={() =>
                toast({
                  type: "success",
                  title: "Reminder Set",
                  message: "We will alert you at 2:00 PM for window ventilation.",
                })
              }
            />
            <RecommendationCard
              title="Elderly Respiratory Care"
              advice="High ozone levels expected in afternoon sunlight. Grandparents should schedule evening walks indoors or in mall spaces."
              targetAudience="Seniors & Asthma"
              urgency="low"
              actionLabel="Care Notes"
              onAction={() =>
                toast({
                  type: "info",
                  title: "Senior Care Protocol",
                  message: "Keep pulse oximeter handy during high pollution days.",
                })
              }
            />
          </div>
        </section>

        {/* 7. Loading Skeletons */}
        <section className="space-y-4">
          <SectionTitle>Loading Skeletons (Shimmer Effect)</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonMetric />
            <SkeletonMetric />
            <SkeletonMetric />
          </div>
        </section>

        {/* 8. Empty States & Error States */}
        <section className="space-y-4">
          <SectionTitle>Empty & Error States</SectionTitle>
          <div className="grid gap-6 lg:grid-cols-2">
            <EmptyState
              icon={UserPlus}
              title="No Family Members Added Yet"
              description="Add your family members (children, elderly parents) to receive customized air quality alerts and pediatric advice."
              actionLabel="Add First Family Member"
              onAction={() =>
                toast({
                  type: "info",
                  title: "Family Member Modal",
                  message: "Family profile creator would open here.",
                })
              }
              variant="mint"
            />
            <ErrorState
              title="Station Connectivity Interrupted"
              message="The local monitoring sensor in Lodhi Road is undergoing recalibration. Open-Meteo satellite fallback is active."
              errorCode="ERR_SENSOR_OFFLINE_FALLBACK"
              onRetry={() =>
                toast({
                  type: "info",
                  title: "Reconnecting...",
                  message: "Polling nearest available station at Central Secretariat.",
                })
              }
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
