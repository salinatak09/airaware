import * as React from "react";
import { AlertTriangle, RefreshCw, WifiOff, ShieldX } from "lucide-react";
import { Card } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  errorCode?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Air Quality Data Temporarily Unavailable",
  message = "We could not reach the air monitoring station or weather service. Your local cached insights are safe.",
  errorCode = "ERR_AQI_STATION_TIMEOUT",
  onRetry,
  isRetrying = false,
  className,
}: ErrorStateProps) {
  return (
    <Card
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-10 text-center border-2 border-brand-peach-300 bg-[#FFF5EF] shadow-card",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-peach-200 border-2 border-brand-peach-300 text-brand-forest-900 shadow-sm">
        <WifiOff className="h-8 w-8 text-[#9A3412]" />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Badge variant="peach" className="text-[10px] font-bold">
          Network Notice
        </Badge>
        {errorCode && (
          <span className="text-[11px] font-mono text-brand-forest-800/60">{errorCode}</span>
        )}
      </div>

      <h3 className="mt-3 text-xl font-bold tracking-tight text-brand-forest-900">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm text-brand-forest-800/80 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="forest"
            onClick={onRetry}
            isLoading={isRetrying}
            className="gap-2 font-bold"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        </div>
      )}
    </Card>
  );
}

/**
 * Compact inline alert banner for form errors or temporary warnings.
 */
export function ErrorBanner({
  message,
  onDismiss,
  className,
}: {
  message: string;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl border border-brand-peach-300 bg-[#FFF5EF] px-4 py-3 text-sm font-medium text-[#7c2d12] shadow-xs",
        className
      )}
      role="alert"
    >
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="h-4 w-4 shrink-0 text-[#9A3412]" />
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-bold hover:underline opacity-80"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
