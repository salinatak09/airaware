"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, Info, X, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "aqi-alert" | "warning" | "info" | "error";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: (item: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    ({ type, title, message, durationMs = 4500 }: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message, durationMs }]);

      if (durationMs > 0) {
        setTimeout(() => {
          removeToast(id);
        }, durationMs);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
      {/* Toast Render Stack */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const getStyle = () => {
    switch (item.type) {
      case "success":
        return {
          container: "bg-[#F0FAF5] border-brand-mint-300 text-brand-forest-900",
          icon: <CheckCircle2 className="h-5 w-5 text-brand-forest" />,
        };
      case "aqi-alert":
        return {
          container: "bg-[#FFF5EF] border-brand-peach-400 text-[#7c2d12]",
          icon: <ShieldAlert className="h-5 w-5 text-[#9A3412]" />,
        };
      case "warning":
        return {
          container: "bg-[#FFFBEA] border-brand-yellow-300 text-[#713f12]",
          icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
        };
      case "error":
        return {
          container: "bg-[#FEF2F2] border-red-300 text-red-900",
          icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
        };
      default:
        return {
          container: "bg-[#F0F9FF] border-brand-sky-300 text-[#0c4a6e]",
          icon: <Info className="h-5 w-5 text-sky-600" />,
        };
    }
  };

  const { container, icon } = getStyle();

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-2xl border-2 p-4 shadow-floating backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-2 fade-in",
        container
      )}
      role="status"
    >
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1">
        <h5 className="text-sm font-bold leading-tight">{item.title}</h5>
        {item.message && <p className="mt-1 text-xs opacity-90 leading-snug">{item.message}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
