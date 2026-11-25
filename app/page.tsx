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
import { Sparkles, CalendarCheck, RefreshCw, Radio, Database, AlertCircle } from "lucide-react";
import { PageTitle, Subtitle } from "@/components/ui/typography";
import { useAqi } from "@/hooks/use-aqi";

export default function HomePage() {
  const { currentLocation, activeFamilyMember } = useShell();

  // Connect to live backend AQI Route Handlers with coordinates from active location
  const {
    currentAqi,
    forecastAqi,
    isLoading,
    isError,
    errorMessage,
    isDemoMode,
    toggleDemoMode,
    refetch,
  } = useAqi({
    latitude: currentLocation.latitude ?? 28.6139,
    longitude: currentLocation.longitude ?? 77.209,
    city: currentLocation.area ? `${currentLocation.area}, ${currentLocation.city}` : currentLocation.city,
    initialDemo: false,
  });

  // Effective AQI from live API or fallback
  const aqiValue = currentAqi?.indianAqi ?? 105;
  const isSevere = aqiValue > 150;

  return (
    <AppShell>
      <div className="space-y-6 sm:space-y-8">
        {/* Severe AQI Notification Banner (displayed if Indian NAQI > 150) */}
        {isSevere && (
          <SevereAqiBanner
            aqi={aqiValue}
            cityName={currentLocation.area || currentLocation.city}
          />
        )}

        {/* Demo Mode / Live Mode Indicator Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3.5 sm:p-4 border border-brand-mint-200 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${isDemoMode ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"}`}>
              {isDemoMode ? <Database className="h-4 w-4" /> : <Radio className="h-4 w-4 animate-pulse" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-brand-forest-900">
                  {isDemoMode ? "Demo Mode (Delhi Winter Smog Baseline)" : "Live Model Data (Open-Meteo CAMS Ensemble)"}
                </span>
                <Badge variant={isDemoMode ? "cream" : "mint"} className="text-[9px] uppercase font-bold py-0">
                  {isDemoMode ? "Curated Simulation" : "Live CAMS"}
                </Badge>
              </div>
              <p className="text-[11px] text-brand-forest-700/60 mt-0.5">
                {isDemoMode
                  ? "Displaying curated realistic Delhi pollution data (185 AQI) for development and training."
                  : currentAqi?.meta.disclaimer || "Atmospheric chemistry assimilation from CAMS/ECMWF. CPCB NAQI standard applied."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDemoMode}
              className="text-xs h-8 gap-1.5 font-bold border-brand-forest-700/20"
            >
              <Database className="h-3.5 w-3.5 text-brand-forest-800" />
              <span>{isDemoMode ? "Switch to Live API" : "Switch to Demo Mode"}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="text-xs h-8 px-2 text-brand-forest-700 hover:text-brand-forest-900"
              title="Refresh air quality metrics"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Error Fallback Banner if API unreachable */}
        {isError && (
          <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 border border-rose-200 text-rose-900 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <div className="flex-1">
              <strong>Live Air Quality Service Notice:</strong> {errorMessage}. Switched to local resilient cache.
            </div>
          </div>
        )}

        {/* 1. Personalized Greeting with User Name & Active Member */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="mint" className="text-[10px] font-bold py-0.5 px-2.5">
                Urban Air Defense Center
              </Badge>
              <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[9px] font-bold text-slate-700 uppercase tracking-wider">
                CPCB Standard (India)
              </span>
              {currentAqi?.meta.dataAgeFormatted && (
                <span className="text-[10px] text-brand-forest-700/60 font-medium">
                  • {currentAqi.meta.dataAgeFormatted}
                </span>
              )}
            </div>

            <PageTitle className="mt-1.5 text-2xl sm:text-3xl lg:text-4xl">
              Good morning,{" "}
              <span className="bg-gradient-to-r from-brand-forest-800 via-brand-forest-900 to-emerald-800 bg-clip-text text-transparent">
                Rohit & The Sharma Family
              </span>
            </PageTitle>

            <Subtitle className="mt-1 text-xs sm:text-sm">
              Currently monitoring for <strong>{activeFamilyMember.name}</strong> ({activeFamilyMember.role}) in{" "}
              {currentLocation.area ? `${currentLocation.area}, ` : ""}{currentLocation.city}.
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
              aqi={aqiValue}
              cityName={currentLocation.area ? `${currentLocation.area}, ${currentLocation.city}` : currentLocation.city}
              stationName={currentAqi?.meta.provider ? "CAMS Model Grid (Open-Meteo)" : "Regional Monitoring Grid"}
              updatedAt={currentAqi?.meta.dataAgeFormatted ? `Live • ${currentAqi.meta.dataAgeFormatted}` : "Live • Just now"}
              dominantPollutantLabel={currentAqi?.dominantPollutantLabel}
              categoryLabel={currentAqi?.indianCategoryLabel}
              healthSummary={currentAqi?.healthAdvisory.summary}
              usAqi={currentAqi?.usAqi}
              isDemo={isDemoMode}
              dataAge={currentAqi?.meta.dataAgeFormatted}
              onToggleDemo={toggleDemoMode}
            />

            {/* 5. Pollutant Summary (PM2.5, PM10, NO2, O3, SO2, CO) */}
            <PollutantSummaryCard
              pm25={currentAqi?.pollutants.pm25 ?? 59}
              pm10={currentAqi?.pollutants.pm10 ?? 60}
              no2={currentAqi?.pollutants.no2 ?? 70}
              o3={currentAqi?.pollutants.o3 ?? 59}
              so2={currentAqi?.pollutants.so2 ?? 35}
              co={currentAqi?.pollutants.co ?? 2.1}
              subIndices={currentAqi?.subIndices}
            />
          </div>

          {/* Right Column: 7, 8, 9, 10, 11. Aero Mascot, Daily Missions, XP, Level, Streak */}
          <div className="lg:col-span-5 space-y-6">
            {/* 7. Aero Mascot with context-aware expressions */}
            <AeroCoachCard
              aqi={aqiValue}
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
        <WeatherWidget weather={currentAqi?.weather} />

        {/* 13. Hourly AQI Chart (Diurnal Inversion Curve with Live Forecast) */}
        <HourlyAqiChart hourly={forecastAqi?.hourly} />

        {/* Bottom Grid: 14. Forecast Preview & 12. AI-Generated Daily Tip */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7">
            <ForecastPreview daily={forecastAqi?.daily} />
          </div>

          <div className="lg:col-span-5">
            <AiDailyTip />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
