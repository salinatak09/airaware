import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-brand-forest-700/10 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer-slide_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonMetric({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-3xl border border-brand-mint-100 bg-white p-6 shadow-sm space-y-4", className)}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

export function SkeletonAqiHero({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-3xl border-2 border-brand-mint-200 bg-white p-8 shadow-soft space-y-6", className)}>
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      <div className="flex items-baseline gap-4">
        <Skeleton className="h-20 w-36 rounded-2xl" />
        <Skeleton className="h-16 flex-1 rounded-2xl" />
      </div>
      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-brand-mint-100">
        <Skeleton className="h-14 rounded-2xl" />
        <Skeleton className="h-14 rounded-2xl" />
        <Skeleton className="h-14 rounded-2xl" />
        <Skeleton className="h-14 rounded-2xl" />
      </div>
    </div>
  );
}

export function SkeletonHabitList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-3xl border border-brand-mint-100 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-4">
            <Skeleton className="h-7 w-7 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
