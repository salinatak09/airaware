import * as React from "react";
import { Sparkles, ArrowRight, Bot, ShieldCheck, Heart } from "lucide-react";
import { Card } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface RecommendationCardProps {
  title: string;
  advice: string;
  targetAudience?: string; // e.g., "Infants & Toddlers", "Elderly", "Outdoor Commuters"
  urgency?: "low" | "medium" | "high";
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function RecommendationCard({
  title,
  advice,
  targetAudience = "Family Health",
  urgency = "medium",
  actionLabel = "Apply tip",
  onAction,
  className,
}: RecommendationCardProps) {
  const getBadgeVariant = () => {
    switch (urgency) {
      case "high":
        return "peach";
      case "medium":
        return "yellow";
      default:
        return "sky";
    }
  };

  return (
    <Card
      className={cn(
        "p-6 transition-all duration-200 border-2 hover:shadow-card-hover",
        urgency === "high"
          ? "bg-[#FFF5EF] border-brand-peach-300"
          : "bg-white border-brand-forest-700/10",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-mint-100 text-brand-forest-800">
            <Bot className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-forest-800">
            AI Assistant
          </span>
        </div>
        <Badge variant={getBadgeVariant()} className="text-[11px] font-bold">
          {targetAudience}
        </Badge>
      </div>

      <div className="mt-4">
        <h4 className="text-lg font-bold text-brand-forest-900">{title}</h4>
        <p className="mt-2 text-sm text-brand-forest-800/80 leading-relaxed">{advice}</p>
      </div>

      {actionLabel && (
        <div className="mt-5 flex items-center justify-end">
          <Button
            size="sm"
            variant="soft"
            onClick={onAction}
            className="text-xs font-bold gap-1.5"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </Card>
  );
}
