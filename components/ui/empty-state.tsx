import * as React from "react";
import { Sparkles, LucideIcon } from "lucide-react";
import { Card } from "./card";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "mint" | "cream" | "sky" | "lavender" | "peach";
  className?: string;
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
  variant = "mint",
  className,
}: EmptyStateProps) {
  const getIconContainerStyle = () => {
    switch (variant) {
      case "cream":
        return "bg-brand-cream border-brand-cream-300 text-brand-forest-800";
      case "sky":
        return "bg-brand-sky-100 border-brand-sky-300 text-[#0c4a6e]";
      case "lavender":
        return "bg-brand-lavender-100 border-brand-lavender-300 text-[#4c1d95]";
      case "peach":
        return "bg-brand-peach-100 border-brand-peach-300 text-[#7c2d12]";
      default:
        return "bg-brand-mint-100 border-brand-mint-300 text-brand-forest-900";
    }
  };

  return (
    <Card
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center border-2 border-dashed border-brand-mint-200/80 bg-white/70 shadow-xs",
        className
      )}
    >
      <div
        className={cn(
          "flex h-20 w-20 items-center justify-center rounded-3xl border-2 shadow-sm transition-transform hover:scale-105",
          getIconContainerStyle()
        )}
      >
        <Icon className="h-10 w-10 stroke-[2]" />
      </div>

      <h3 className="mt-5 text-xl font-bold tracking-tight text-brand-forest-900 sm:text-2xl">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm text-brand-forest-800/70 leading-relaxed">
        {description}
      </p>

      {actionLabel && (
        <div className="mt-6">
          <Button
            variant="primary"
            onClick={onAction}
            className="font-bold shadow-sm"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </Card>
  );
}
