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
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export const mobileNavItems: MobileNavItem[] = [
  { label: "Home", href: "/", icon: Wind },
  { label: "My Day", href: "/my-day", icon: CalendarCheck },
  { label: "Indoor", href: "/indoor", icon: Home },
  { label: "AI Buddy", href: "/ai-buddy", icon: Bot, badge: "AI" },
  { label: "Impact", href: "/impact", icon: Flame },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand-mint-200/60 bg-white/95 px-2 py-1.5 shadow-floating backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-2xl px-2.5 py-1 transition-all duration-150 select-none",
                isActive
                  ? "text-brand-forest-900 font-extrabold"
                  : "text-brand-forest-800/60 hover:text-brand-forest-900 font-semibold"
              )}
            >
              <div className="relative flex h-8 w-8 items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="mobileNavActivePill"
                    className="absolute inset-0 rounded-xl bg-brand-mint shadow-xs"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "relative z-10 h-4 w-4 transition-transform",
                    isActive ? "stroke-[2.5] scale-105" : "stroke-[2]"
                  )}
                />
                {item.badge && !isActive && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-peach text-[8px] font-black text-[#7c2d12]">
                    •
                  </span>
                )}
              </div>
              <span className="relative z-10 text-[10px] tracking-tight leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
