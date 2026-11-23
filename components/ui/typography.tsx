import * as React from "react";
import { cn } from "@/lib/utils";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

export function PageTitle({ children, className, ...props }: TypographyProps) {
  return (
    <h1
      className={cn(
        "text-3xl font-extrabold tracking-tight text-brand-forest-900 sm:text-4xl lg:text-5xl",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function SectionTitle({ children, className, ...props }: TypographyProps) {
  return (
    <h2
      className={cn(
        "text-xl font-bold tracking-tight text-brand-forest-900 sm:text-2xl",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function Subtitle({ children, className, ...props }: TypographyProps) {
  return (
    <p
      className={cn("text-base text-brand-forest-800/70 sm:text-lg leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function MetricValue({
  value,
  unit,
  className,
}: {
  value: string | number;
  unit?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline gap-1 font-bold tracking-tight", className)}>
      <span className="text-4xl sm:text-5xl font-extrabold">{value}</span>
      {unit && <span className="text-sm font-semibold opacity-70">{unit}</span>}
    </div>
  );
}

export function FriendlyLabel({
  children,
  className,
  ...props
}: TypographyProps) {
  return (
    <span
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-brand-forest-700/80",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
