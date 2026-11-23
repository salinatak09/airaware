"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useShell } from "@/components/layout/shell-context";
import {
  Wind,
  CalendarCheck,
  Home,
  Bot,
  ArrowRight,
  SunMedium,
  Filter,
} from "lucide-react";
import { AqiCard } from "@/components/ui/aqi-card";
import { MetricCard } from "@/components/ui/metric-card";
import { HabitCard } from "@/components/ui/habit-card";
import { RecommendationCard } from "@/components/ui/recommendation-card";
import { Button } from "@/components/ui/button";
import { AqiSpectrumBar } from "@/components/ui/progress-bar";
import { PageTitle, SectionTitle, Subtitle } from "@/components/ui/typography";
import { useToast } from "@/components/ui/toast";

export default function HomePage() {
  const { currentLocation, activeFamilyMember, userStats } = useShell();
  const { toast } = useToast();

  const hourlyPreview = [
    { time: "Now", aqi: currentLocation.aqi, status: "Moderate", label: "Sensitive" },
    { time: "12 PM", aqi: Math.max(30, currentLocation.aqi - 25), status: "Moderate", label: "Better" },
    { time: "2 PM", aqi: Math.max(25, currentLocation.aqi - 45), status: "Good", label: "Best Window" },
    { time: "5 PM", aqi: currentLocation.aqi + 15, status: "Sensitive", label: "Peak Commute" },
    { time: "8 PM", aqi: currentLocation.aqi + 35, status: "Unhealthy", label: "Stay Indoors" },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-700/60">
                Urban Air Dashboard
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-mint-500" />
              <span className="text-xs font-semibold text-brand-forest-800">
                Protecting: {activeFamilyMember.name}
              </span>
            </div>
            <PageTitle className="mt-1">
              Good morning,{" "}
              <span className="bg-gradient-to-r from-brand-forest-800 via-brand-forest-900 to-emerald-800 bg-clip-text text-transparent">
                Sharma Family
              </span>
            </PageTitle>
            <Subtitle className="mt-1">
              Here is your family air quality briefing for today in {currentLocation.area}.
            </Subtitle>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/my-day">
              <Button variant="forest" size="sm" className="gap-2 font-bold shadow-xs">
                <CalendarCheck className="h-4 w-4" />
                <span>Plan Today</span>
              </Button>
            </Link>
            <Link href="/ai-buddy">
              <Button variant="soft" size="sm" className="gap-2 font-bold shadow-xs">
                <Bot className="h-4 w-4" />
                <span>Ask AI Buddy</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero AQI Card with Real-time Data */}
        <AqiCard
          aqi={currentLocation.aqi}
          cityName={currentLocation.area}
          stationName={`${currentLocation.city} Central Sensor`}
          pm25={currentLocation.pm25}
          pm10={Math.round(currentLocation.pm25 * 1.8)}
          updatedAt="Updated 4m ago"
        />

        {/* Multi-Segment AQI Gauge */}
        <div className="rounded-3xl bg-white p-6 border border-brand-forest-700/10 shadow-card">
          <AqiSpectrumBar aqi={currentLocation.aqi} />
        </div>

        {/* 24-Hour Micro Forecast Strip */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <SectionTitle className="text-lg">Today&apos;s Air Quality Trend</SectionTitle>
            <Link
              href="/my-day"
              className="text-xs font-bold text-brand-forest-800 hover:underline flex items-center gap-1"
            >
              <span>Full Hourly Planner</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {hourlyPreview.map((slot) => (
              <div
                key={slot.time}
                className="flex flex-col items-center justify-center rounded-2xl border border-brand-mint-100 bg-white p-3.5 text-center shadow-xs hover:border-brand-mint-300 transition-colors"
              >
                <span className="text-xs font-semibold text-brand-forest-700/70">{slot.time}</span>
                <span className="mt-1 text-2xl font-black text-brand-forest-900">{slot.aqi}</span>
                <span
                  className="mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{
                    backgroundColor:
                      slot.aqi <= 50 ? "#E0F5EB" : slot.aqi <= 100 ? "#FFFBEA" : "#FFF7ED",
                    color: slot.aqi <= 50 ? "#175C48" : slot.aqi <= 100 ? "#854D0E" : "#9A3412",
                  }}
                >
                  {slot.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Metrics Grid */}
        <section className="space-y-3">
          <SectionTitle className="text-lg">Environmental Vitals</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="PM2.5 Exposure"
              value={currentLocation.pm25}
              unit="µg/m³"
              icon={<Wind className="h-4 w-4 text-brand-forest-800" />}
              subtitle="Ambient city air"
              variant="mint"
            />
            <MetricCard
              title="Indoor Nursery AQI"
              value="28"
              unit="Good"
              icon={<Home className="h-4 w-4 text-brand-forest-800" />}
              subtitle="Purifier running on Auto"
              variant="cream"
            />
            <MetricCard
              title="Outdoor Safety Window"
              value="2:00 PM"
              unit="Best Time"
              icon={<SunMedium className="h-4 w-4 text-brand-forest-800" />}
              subtitle="Dispersion peak window"
              variant="sky"
            />
            <MetricCard
              title="Filter Health"
              value="82%"
              unit="Good"
              icon={<Filter className="h-4 w-4 text-brand-forest-800" />}
              subtitle="Next wash in 18 days"
              variant="lavender"
            />
          </div>
        </section>

        {/* Daily Habits & AI Recommendations */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Clean Air Habits */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <SectionTitle className="text-lg">Daily Clean Air Habits</SectionTitle>
              <Link href="/impact" className="text-xs font-bold text-brand-forest-800 hover:underline">
                View All (+{userStats.points} XP)
              </Link>
            </div>
            <div className="space-y-3">
              <HabitCard
                id="home-habit-1"
                title="Morning Air Check"
                category="Family Routine"
                pointsReward={30}
                completed={true}
                description="Check city AQI before leaving home."
                onToggle={(_id, done) => {
                  if (done) {
                    toast({
                      type: "success",
                      title: "Habit Logged!",
                      message: "+30 XP added to your family streak.",
                    });
                  }
                }}
              />
              <HabitCard
                id="home-habit-2"
                title="Seal South-Facing Windows"
                category="Indoor Health"
                pointsReward={40}
                completed={false}
                description="Prevent highway smog infiltration during rush hour."
              />
            </div>
          </section>

          {/* AI Advisor Card */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <SectionTitle className="text-lg">AI Buddy Health Advice</SectionTitle>
              <Link href="/ai-buddy" className="text-xs font-bold text-brand-forest-800 hover:underline">
                Chat with Buddy
              </Link>
            </div>
            <RecommendationCard
              title={`Protection for ${activeFamilyMember.name}`}
              advice={
                activeFamilyMember.vulnerability === "high" ||
                activeFamilyMember.vulnerability === "critical"
                  ? "Elevated particulate levels can trigger bronchial sensitivity. Ensure child inhaler is packed and run indoor HEPA at Medium speed."
                  : "Air quality is manageable today. Recommend outdoor sports between 2:00 PM and 4:30 PM."
              }
              targetAudience={activeFamilyMember.role}
              urgency={activeFamilyMember.vulnerability === "high" ? "high" : "medium"}
              actionLabel="Ask AI Buddy"
              onAction={() => {
                toast({
                  type: "info",
                  title: "AI Buddy Insight",
                  message: "Consulting pediatric air quality guidelines...",
                });
              }}
            />
          </section>
        </div>
      </div>
    </AppShell>
  );
}
