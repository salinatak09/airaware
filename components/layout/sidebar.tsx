"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wind,
  MapPin,
  Flame,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { defaultNavItems, NavItem } from "./bottom-nav";
import { cn } from "@/lib/utils";

export interface SidebarProps {
  items?: NavItem[];
  userStreakDays?: number;
  currentAqi?: number;
  cityName?: string;
  className?: string;
}

export function Sidebar({
  items = defaultNavItems,
  userStreakDays = 7,
  currentAqi = 85,
  cityName = "New Delhi",
  className,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden lg:flex h-screen w-72 flex-col justify-between border-r border-brand-mint-200/60 bg-white p-6 shadow-sm sticky top-0 shrink-0",
        className
      )}
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-mint text-brand-forest-900 shadow-sm transition-transform group-hover:scale-105">
            <Wind className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-brand-forest-900">
                AirAware
              </span>
              <span className="h-2 w-2 rounded-full bg-brand-mint-500" />
            </div>
            <p className="text-xs font-semibold text-brand-forest-700/60">
              Breathe smarter. Live better.
            </p>
          </div>
        </Link>

        {/* Live Status Pill */}
        <div className="rounded-2xl border border-brand-cream-300 bg-[#FFF8E8] p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-brand-forest-900">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-brand-forest-700" />
              {cityName}
            </span>
            <Badge variant="yellow" className="text-[10px] py-0 px-2 font-bold">
              AQI {currentAqi}
            </Badge>
          </div>
          <p className="mt-1.5 text-xs text-brand-forest-800/70">
            Moderate air. Children should take brief outdoor breaks.
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-brand-forest-700/50">
            Navigation
          </p>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-3.5 py-3 text-sm font-bold transition-all duration-200",
                  isActive
                    ? "bg-brand-mint text-brand-forest-900 shadow-xs"
                    : "text-brand-forest-800 hover:bg-[#F0FAF5] hover:text-brand-forest-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-brand-forest-900 stroke-[2.5]" : "text-brand-forest-700"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge variant="peach" className="text-[10px] px-2 py-0">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Gamification Streak & Family Switcher Footer */}
      <div className="space-y-3 pt-6 border-t border-brand-mint-100">
        <div className="flex items-center justify-between rounded-2xl bg-[#F0FAF5] p-3 border border-brand-mint-200">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-forest-900">
                {userStreakDays} Day Streak!
              </span>
              <p className="text-[10px] text-brand-forest-700/70">Clean Air Hero</p>
            </div>
          </div>
          <Sparkles className="h-4 w-4 text-brand-mint-600" />
        </div>

        <div className="flex items-center justify-between rounded-2xl p-2.5 hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-sky text-brand-forest-900 font-bold text-xs">
              FA
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-brand-forest-900">The Sharma Family</p>
              <p className="text-[10px] text-brand-forest-700/60">4 Members Protected</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-brand-forest-700/50" />
        </div>
      </div>
    </aside>
  );
}
