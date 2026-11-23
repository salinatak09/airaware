"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wind,
  MapPin,
  Bot,
  Flame,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export const defaultNavItems: NavItem[] = [
  { label: "Overview", href: "/", icon: Wind },
  { label: "Live Map", href: "/map", icon: MapPin },
  { label: "AI Advisor", href: "/advisor", icon: Bot, badge: "AI" },
  { label: "Habits", href: "/habits", icon: Flame },
  { label: "Family", href: "/family", icon: Users },
];

export function BottomNav({ items = defaultNavItems }: { items?: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand-mint-200/50 bg-white/95 px-3 py-2 shadow-floating backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 transition-all duration-200 active:scale-95",
                isActive
                  ? "text-brand-forest-900 font-bold"
                  : "text-brand-forest-700/60 hover:text-brand-forest-900 font-medium"
              )}
            >
              <div
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-xl transition-all",
                  isActive
                    ? "bg-brand-mint text-brand-forest-900 shadow-sm"
                    : "bg-transparent"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.badge && !isActive && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-peach text-[8px] font-black text-brand-forest-900">
                    •
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-none tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
