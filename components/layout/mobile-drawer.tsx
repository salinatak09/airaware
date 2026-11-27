"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wind,
  CalendarCheck,
  Home,
  Bot,
  Compass,
  Flame,
  Users,
  Settings,
  Sparkles,
  X,
  MapPin,
  ChevronRight,
  ShieldCheck,
  User,
  Sliders,
} from "lucide-react";
import { useShell } from "./shell-context";
import { Badge } from "@/components/ui/badge";
import { getAqiTheme } from "@/lib/colors";
import { cn } from "@/lib/utils";

export interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

const ALL_NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: Wind, desc: "Live AQI, CPCB pollutants, and alerts" },
  { label: "My Day", href: "/my-day", icon: CalendarCheck, desc: "Personalized diurnal timeline & missions" },
  { label: "Indoor Sanctuary", href: "/indoor", icon: Home, desc: "Ventilation windows & filtration rules" },
  { label: "AI Clean Air Buddy", href: "/ai-buddy", icon: Bot, badge: "AI", desc: "Interactive Gemini health advisor" },
  { label: "Explore Stations", href: "/explore", icon: Compass, desc: "Interactive OpenStreetMap & CPCB stations" },
  { label: "Impact & XP", href: "/impact", icon: Flame, badge: "XP", desc: "Levels, streaks, badges & achievements" },
  { label: "Community Hotspots", href: "/community", icon: Users, desc: "Citizen smoke reports & clean air drives" },
  { label: "Account & Settings", href: "/profile", icon: Settings, desc: "Household sensitivity, commute & privacy" },
  { label: "Onboarding Setup", href: "/onboarding", icon: Sliders, desc: "Re-run personalization wizard" },
];

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const { currentLocation, activeFamilyMember, userStats } = useShell();
  const aqiTheme = getAqiTheme(currentLocation.aqi);

  // Close on route change
  React.useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Lock body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-forest-900/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-2xl flex flex-col justify-between overflow-y-auto border-r border-brand-mint-200"
          >
            <div className="p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-brand-mint-100">
                <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-mint text-brand-forest-900 shadow-xs">
                    <Wind className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-lg font-black tracking-tight text-brand-forest-900">
                      AirAware
                    </span>
                    <p className="text-[10px] font-semibold text-brand-forest-700/60 leading-none">
                      Urban Clean Air Defense
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close navigation menu"
                  className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl text-brand-forest-800 hover:bg-[#F0FAF5] active:scale-95 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Active Profile & Location Snapshot */}
              <div className="rounded-2xl bg-[#FFF8E8] border border-brand-cream-300 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-brand-forest-900">
                    <MapPin className="h-3.5 w-3.5 text-brand-forest-800" />
                    <span className="truncate max-w-[130px]">{currentLocation.area}</span>
                  </div>
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
                <div className="flex items-center justify-between pt-2 border-t border-brand-cream-300/80 text-[11px]">
                  <span className="text-brand-forest-800/80">
                    Protecting: <strong>{activeFamilyMember.name}</strong>
                  </span>
                  <Link
                    href="/impact"
                    onClick={onClose}
                    className="flex items-center gap-1 font-bold text-amber-900"
                  >
                    <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span>{userStats.points} XP</span>
                  </Link>
                </div>
              </div>

              {/* Navigation Items List */}
              <nav className="space-y-1" aria-label="Mobile Main Navigation">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-brand-forest-700/60 mb-2">
                  All Screens & Features
                </p>
                {ALL_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all min-h-[48px]",
                        isActive
                          ? "bg-brand-mint text-brand-forest-900 shadow-xs"
                          : "text-brand-forest-800 hover:bg-[#F0FAF5] hover:text-brand-forest-900"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-xl",
                            isActive ? "bg-white/80 text-brand-forest-900" : "bg-brand-forest-50 text-brand-forest-800"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold leading-tight">{item.label}</span>
                            {item.badge && (
                              <Badge variant="yellow" className="text-[9px] py-0 px-1.5 font-black">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-brand-forest-700/70 block leading-tight font-normal">
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        className={cn(
                          "h-4 w-4 opacity-50 transition-transform group-hover:translate-x-0.5",
                          isActive && "opacity-100 text-brand-forest-900"
                        )}
                      />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Footer Info */}
            <div className="p-4 border-t border-brand-mint-100 bg-[#F7FAF7] space-y-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-brand-forest-700/70">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-forest-800" />
                <span>Deterministic Health Guardrails Active</span>
              </div>
              <p className="text-[10px] text-brand-forest-700/50">
                AirAware v1.0 • Live CPCB Standard
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
