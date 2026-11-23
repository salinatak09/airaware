"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { LocationSelector } from "./location-selector";
import { NotificationMenu } from "./notification-popover";
import { UserProfileMenu } from "./profile-menu";
import { useShell } from "./shell-context";
import { Wind, Flame } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userStats } = useShell();

  return (
    <div className="flex min-h-screen bg-[#F7FAF7] text-brand-forest-900">
      {/* Desktop Persistent Sidebar (7 items) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 pb-20 lg:pb-10">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-mint-200/50 bg-white/90 px-4 sm:px-8 backdrop-blur-md">
          {/* Mobile Brand / Desktop Location */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-mint text-brand-forest-900 shadow-xs">
                <Wind className="h-5 w-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-black tracking-tight text-brand-forest-900">
                AirAware
              </span>
            </Link>

            {/* Interactive Location Selector */}
            <LocationSelector />
          </div>

          {/* Right Action Stack: Streak Pill, Notifications, Profile Menu */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Gamification Streak Pill */}
            <Link
              href="/impact"
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-brand-cream px-3 py-1.5 border border-brand-cream-300 text-xs font-bold text-brand-forest-900 hover:bg-brand-cream-300 transition-colors"
            >
              <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>{userStats.points} XP</span>
            </Link>

            {/* Notification Button */}
            <NotificationMenu />

            {/* User Profile / Family Member Switcher */}
            <UserProfileMenu />
          </div>
        </header>

        {/* Main Content Container with Framer Motion Route Transition */}
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation (5 items) */}
      <BottomNav />
    </div>
  );
}
