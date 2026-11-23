import * as React from "react";
import { Check, Flame, Award } from "lucide-react";
import { Card } from "./card";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

export interface HabitCardProps {
  id: string;
  title: string;
  category: string;
  pointsReward: number;
  completed?: boolean;
  onToggle?: (id: string, completed: boolean) => void;
  description?: string;
  className?: string;
}

export function HabitCard({
  id,
  title,
  category,
  pointsReward,
  completed = false,
  onToggle,
  description,
  className,
}: HabitCardProps) {
  const [isDone, setIsDone] = React.useState(completed);

  const handleToggle = () => {
    const nextState = !isDone;
    setIsDone(nextState);
    onToggle?.(id, nextState);
  };

  return (
    <Card
      className={cn(
        "group relative flex items-center justify-between p-5 transition-all duration-200 border",
        isDone
          ? "bg-[#F0FAF5] border-brand-mint-300 shadow-soft"
          : "bg-white border-brand-forest-700/10 hover:border-brand-mint-300 hover:shadow-card",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Friendly Checkbox / Completion Circle */}
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint",
            isDone
              ? "border-brand-forest-800 bg-brand-forest text-white"
              : "border-brand-forest-700/30 bg-white hover:border-brand-mint-400 group-hover:scale-105"
          )}
          aria-label={isDone ? "Mark incomplete" : "Mark complete"}
        >
          {isDone && <Check className="h-4 w-4 stroke-[3]" />}
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                "text-base font-bold text-brand-forest-900 transition-all",
                isDone && "line-through opacity-70"
              )}
            >
              {title}
            </h4>
            <Badge variant="cream" className="text-[10px] py-0 px-2 font-semibold">
              {category}
            </Badge>
          </div>
          {description && (
            <p className="mt-1 text-xs text-brand-forest-800/70">{description}</p>
          )}
        </div>
      </div>

      {/* Points Reward Pill */}
      <div className="flex items-center gap-1.5 shrink-0 ml-3">
        <Badge
          variant={isDone ? "mint" : "yellow"}
          className="gap-1 font-bold text-xs"
        >
          <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
          +{pointsReward} XP
        </Badge>
      </div>
    </Card>
  );
}
