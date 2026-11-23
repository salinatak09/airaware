"use client";

import * as React from "react";
import { Bell, CheckCheck, X, ShieldAlert, Sparkles, Info } from "lucide-react";
import { useShell } from "./shell-context";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function NotificationMenu() {
  const { notifications, unreadCount, markAllNotificationsRead, dismissNotification } = useShell();
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-brand-forest-700/10 text-brand-forest-800 shadow-xs hover:bg-[#F0FAF5] hover:border-brand-mint-300 transition-all active:scale-95"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-peach border-2 border-white text-[9px] font-black text-[#7c2d12]">
              {unreadCount}
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle>Air Quality Alerts</DialogTitle>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="flex items-center gap-1 text-xs font-bold text-brand-forest-800 hover:text-brand-forest-900 hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
          <DialogDescription>
            Real-time smog warnings and personalized health advisories.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-brand-forest-700/60">
              No new alerts. Your family is well protected!
            </div>
          ) : (
            notifications.map((notif) => {
              const getIcon = () => {
                switch (notif.type) {
                  case "warning":
                    return <ShieldAlert className="h-4 w-4 text-[#9A3412]" />;
                  case "success":
                    return <Sparkles className="h-4 w-4 text-emerald-600" />;
                  default:
                    return <Info className="h-4 w-4 text-sky-600" />;
                }
              };

              const getBg = () => {
                if (!notif.unread) return "bg-white border-brand-forest-700/10 opacity-70";
                switch (notif.type) {
                  case "warning":
                    return "bg-[#FFF5EF] border-brand-peach-300";
                  case "success":
                    return "bg-[#F0FAF5] border-brand-mint-300";
                  default:
                    return "bg-[#F0F9FF] border-brand-sky-300";
                }
              };

              return (
                <div
                  key={notif.id}
                  className={cn(
                    "relative flex items-start gap-3 rounded-2xl p-3.5 border transition-all",
                    getBg()
                  )}
                >
                  <div className="shrink-0 mt-0.5">{getIcon()}</div>
                  <div className="flex-1 pr-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-brand-forest-900">{notif.title}</h5>
                      <span className="text-[10px] text-brand-forest-700/50">{notif.time}</span>
                    </div>
                    <p className="mt-1 text-xs text-brand-forest-800/80 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => dismissNotification(notif.id)}
                    className="absolute top-2.5 right-2.5 text-brand-forest-700/40 hover:text-brand-forest-900"
                    aria-label="Dismiss alert"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
