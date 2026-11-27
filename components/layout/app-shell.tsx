"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { MobileDrawer } from "./mobile-drawer";
import { LocationSelector } from "./location-selector";
import { NotificationMenu } from "./notification-popover";
import { UserProfileMenu } from "./profile-menu";
import { useShell } from "./shell-context";
import { Wind, Flame, Menu } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userStats } = useShell();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-[#F7FAF7] text-brand-forest-900">
      {/* Accessible Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-brand-forest-900 focus:text-white focus:rounded-2xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-mint text-xs font-bold"
      >
        Skip to main content
      </a>

      {/* Desktop Persistent Sidebar (7 items) */}
      <Sidebar />

      {/* Mobile Slide-over Drawer for all screens */}
      <MobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 pb-20 lg:pb-10 max-w-full overflow-x-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-mint-200/50 bg-white/90 px-3 sm:px-8 backdrop-blur-md">
          {/* Mobile Menu Trigger & Brand / Desktop Location */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl bg-white border border-brand-forest-700/10 text-brand-forest-900 hover:bg-[#F0FAF5] active:scale-95 transition-all shadow-xs"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/" className="flex items-center gap-1.5 lg:hidden shrink-0">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-brand-mint text-brand-forest-900 shadow-xs">
                <Wind className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
              </div>
              <span className="text-base sm:text-lg font-black tracking-tight text-brand-forest-900 hidden xs:inline">
                AirAware
              </span>
            </Link>

            {/* Interactive Location Selector */}
            <LocationSelector />
          </div>

          {/* Right Action Stack: Streak Pill, Notifications, Profile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Gamification Streak Pill */}
            <Link
              href="/impact"
              className="hidden md:flex items-center gap-1.5 rounded-full bg-brand-cream px-3 py-1.5 border border-brand-cream-300 text-xs font-bold text-brand-forest-900 hover:bg-brand-cream-300 transition-colors"
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
        <main id="main-content" tabIndex={-1} className="flex-1 px-3 py-4 sm:px-8 sm:py-8 min-w-0 max-w-full focus:outline-none">
          <div className="mx-auto max-w-7xl min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="min-w-0 max-w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation (5 items) */}
      <BottomNav onOpenMore={() => setMobileMenuOpen(true)} />
    </div>
  );
}
