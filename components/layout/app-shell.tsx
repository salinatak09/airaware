"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { Wind, Bell, Search, MapPin, Sparkles, ShieldCheck } from "lucide-react";

export interface AppShellProps {
  children: React.ReactNode;
  cityName?: string;
  currentAqi?: number;
}

export function AppShell({
  children,
  cityName = "New Delhi",
  currentAqi = 85,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[#F7FAF7] text-brand-forest-900">
      {/* Desktop Persistent Sidebar */}
      <Sidebar cityName={cityName} currentAqi={currentAqi} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col pb-20 lg:pb-10">
        {/* Responsive Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-mint-200/50 bg-white/80 px-4 sm:px-8 backdrop-blur-md">
          {/* Mobile Brand */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-mint text-brand-forest-900 shadow-xs">
              <Wind className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-black tracking-tight text-brand-forest-900">
              AirAware
            </span>
          </div>

          {/* Desktop Search / City indicator */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-[#F0FAF5] px-3.5 py-2 text-xs font-semibold text-brand-forest-800 border border-brand-mint-200">
              <MapPin className="h-4 w-4 text-brand-forest-700" />
              <span>{cityName}</span>
              <span className="text-brand-forest-700/40">|</span>
              <span className="text-emerald-700 font-bold">AQI {currentAqi} Moderate</span>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-brand-cream px-3 py-1 border border-brand-cream-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-bold text-brand-forest-900">1,250 XP</span>
            </div>

            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-brand-forest-700/10 text-brand-forest-800 hover:bg-slate-50 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-peach" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
