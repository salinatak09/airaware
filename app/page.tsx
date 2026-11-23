"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useShell } from "@/components/layout/shell-context";
import { SevereAqiBanner } from "@/components/dashboard/severe-aqi-banner";
import { HeroAqiGauge } from "@/components/dashboard/hero-aqi-gauge";
import { PollutantSummaryCard } from "@/components/dashboard/pollutant-summary-card";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { AeroCoachCard } from "@/components/dashboard/aero-coach-card";
import { DailyMissionsWidget } from "@/components/dashboard/daily-missions-widget";
import { HourlyAqiChart } from "@/components/dashboard/hourly-aqi-chart";
import { ForecastPreview } from "@/components/dashboard/forecast-preview";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AiDailyTip } from "@/components/dashboard/ai-daily-tip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, CalendarCheck, Bot, Info, ShieldCheck } from "lucide-react";
import { PageTitle, Subtitle } from "@/components/ui/typography";

export default function HomePage() {
  const { currentLocation, activeFamilyMember, userStats } = useShell();

  // Delhi Realistic Demo Data (as requested)
  const DEMO_AQI = 185;
  const DEMO_PM25 = 95;
  const DEMO_PM10 = 168;
  const DEMO_NO2 = 44;
  const DEMO_O3 = 32;

  return (
    <AppShell>
      <div className="space-y-6 sm:space-y-8">
        {/* 16. Notification Banner when air quality is severe (AQI 185 is severe) */}
        <SevereAqiBanner
          aqi={DEMO_AQI}
          cityName={currentLocation.area || "Central Delhi"}
        />

        {/* 1. Personalized Greeting with User Name & Active Member */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="mint" className="text-[10px] font-bold py-0.5 px-2.5">
                Urban Air Defense Center
              </Badge>
              <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[9px] font-bold text-slate-700 uppercase tracking-wider">
                Demo Data Mode
              </span>
            </div>

            <PageTitle className="mt-1.5 text-2xl sm:text-3xl lg:text-4xl">
              Good morning,{" "}
              <span className="bg-gradient-to-r from-brand-forest-800 via-brand-forest-900 to-emerald-800 bg-clip-text text-transparent">
                Rohit & The Sharma Family
              </span>
            </PageTitle>

            <Subtitle className="mt-1 text-xs sm:text-sm">
              Currently monitoring for <strong>{activeFamilyMember.name}</strong> ({activeFamilyMember.role}) in{" "}
              {currentLocation.area}, {currentLocation.city}.
            </Subtitle>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link href="/onboarding">
              <Button variant="cream" size="sm" className="gap-2 font-bold shadow-xs text-xs">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>Onboarding Wizard</span>
              </Button>
            </Link>
            <Link href="/my-day">
              <Button variant="forest" size="sm" className="gap-2 font-bold shadow-xs text-xs">
                <CalendarCheck className="h-4 w-4" />
                <span>Today&apos;s Schedule</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 15. Quick Action Buttons */}
        <QuickActions />

        {/* Main Hero Grid: Large AQI Gauge (Left) + Aero AI Coach & Missions (Right) */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Left Column: 2, 3, 4. Location, Current AQI, Large Gauge, Category & Health Guidance */}
          <div className="lg:col-span-7 space-y-6">
            <HeroAqiGauge
              aqi={DEMO_AQI}
              cityName={`${currentLocation.area}, ${currentLocation.city}`}
              stationName="CPCB Mandir Marg Monitoring Station"
              updatedAt="Live • 4 mins ago"
            />

            {/* 5. Pollutant Summary (PM2.5, PM10, NO2, O3) */}
            <PollutantSummaryCard
              pm25={DEMO_PM25}
              pm10={DEMO_PM10}
              no2={DEMO_NO2}
              o3={DEMO_O3}
            />
          </div>

          {/* Right Column: 7, 8, 9, 10, 11. Aero Mascot, Daily Missions, XP, Level, Streak */}
          <div className="lg:col-span-5 space-y-6">
            {/* 7. Aero Mascot with context-aware expressions */}
            <AeroCoachCard
              aqi={DEMO_AQI}
              userName="Rohit"
              activeMemberName={activeFamilyMember.name}
            />

            {/* 8, 9, 10, 11. Gamification Widget (Level 4, 340/500 XP, 7-Day Streak, Daily Missions) */}
            <DailyMissionsWidget
              currentXp={340}
              maxXp={500}
              level={4}
              levelTitle="Clean Air Guardian"
              streakDays={7}
            />
          </div>
        </div>

        {/* 6. Weather Summary & Atmospheric Dispersion */}
        <WeatherWidget />

        {/* 13. Hourly AQI Chart (Diurnal Inversion Curve from 6 AM to 10 PM) */}
        <HourlyAqiChart />

        {/* Bottom Grid: 14. Forecast Preview & 12. AI-Generated Daily Tip */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7">
            <ForecastPreview />
          </div>

          <div className="lg:col-span-5">
            <AiDailyTip />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
