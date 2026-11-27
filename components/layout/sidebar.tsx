"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Wind,
  CalendarCheck,
  Home,
  Bot,
  Compass,
  Flame,
  Users,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useShell } from "./shell-context";
import { Badge } from "@/components/ui/badge";
import { getAqiTheme } from "@/lib/colors";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "mint" | "forest" | "cream" | "sky" | "lavender" | "peach" | "yellow";
}

export const desktopNavItems: NavItem[] = [
  { label: "Home", href: "/", icon: Wind },
  { label: "My Day", href: "/my-day", icon: CalendarCheck },
  { label: "Indoor Air", href: "/indoor", icon: Home },
  { label: "AI Buddy", href: "/ai-buddy", icon: Bot, badge: "AI", badgeVariant: "peach" },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Impact", href: "/impact", icon: Flame, badge: "7d", badgeVariant: "yellow" },
  { label: "Community", href: "/community", icon: Users },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { currentLocation, activeFamilyMember, userStats } = useShell();
  const aqiTheme = getAqiTheme(currentLocation.aqi);

  return (
    <aside
      className={cn(
        "hidden lg:flex h-lvh w-72 flex-col justify-between border-r border-brand-mint-200/60 bg-white p-5 shadow-sm sticky top-0 shrink-0 select-none",
        className
      )}
    >
      <div className="space-y-5">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 group px-2 pt-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-mint text-brand-forest-900 shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Wind className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-brand-forest-900">
                AirAware
              </span>
              <span className="h-2 w-2 rounded-full bg-brand-mint-500 animate-pulse" />
            </div>
            <p className="text-xs font-semibold text-brand-forest-700/60">
              Breathe smarter. Live better.
            </p>
          </div>
        </Link>

        {/* Real-time Location Air Banner */}
        <div className="rounded-2xl border border-brand-cream-300 bg-[#FFF8E8] p-3 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-brand-forest-900">
            <span className="truncate max-w-[130px]">{currentLocation.area}</span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase"
              style={{
                backgroundColor: aqiTheme.colorHex + "25",
                color: aqiTheme.category === "good" ? "#175C48" : aqiTheme.colorHex,
              }}
            >
              AQI {currentLocation.aqi} • {aqiTheme.label}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-brand-forest-800/70 leading-snug line-clamp-2">
            {aqiTheme.actionGuidance}
          </p>
        </div>

        {/* 7 Navigation Items */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-brand-forest-700/50 mb-1">
            Menu
          </p>
          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-sm font-bold transition-colors duration-150",
                  isActive
                    ? "text-brand-forest-900"
                    : "text-brand-forest-800/70 hover:text-brand-forest-900 hover:bg-[#F0FAF5]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktopSidebarActivePill"
                    className="absolute inset-0 rounded-2xl bg-brand-mint shadow-xs"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isActive ? "text-brand-forest-900 stroke-[2.5]" : "text-brand-forest-700 stroke-[2]"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant={item.badgeVariant ?? "peach"}
                    className="relative z-10 text-[10px] px-2 py-0 font-bold"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Gamification Streak & Family Switcher Footer */}
      <div className="space-y-2.5 pt-4 border-t border-brand-mint-100">
        <Link
          href="/impact"
          className="flex items-center justify-between rounded-2xl bg-[#F0FAF5] p-2.5 border border-brand-mint-200 hover:border-brand-mint-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-forest-900 leading-none block">
                {userStats.streakDays} Day Streak!
              </span>
              <span className="text-[10px] text-brand-forest-700/60 leading-none">
                {userStats.points} Clean Air XP
              </span>
            </div>
          </div>
          <Sparkles className="h-4 w-4 text-brand-mint-600" />
        </Link>

        {/* Active Profile Info */}
        <div className="flex items-center justify-between rounded-2xl p-2 bg-slate-50 border border-slate-200/60">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-xl font-bold text-[10px] shadow-xs",
                activeFamilyMember.avatarBg
              )}
            >
              {activeFamilyMember.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-brand-forest-900 leading-tight">
                {activeFamilyMember.name}
              </p>
              <p className="text-[9px] text-brand-forest-700/60 leading-none">
                {activeFamilyMember.role}
              </p>
            </div>
          </div>
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        </div>
      </div>
    </aside>
  );
}
