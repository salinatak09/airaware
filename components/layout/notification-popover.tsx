"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Settings,
  ArrowRight,
  Moon,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type NotificationType,
  type NotificationSeverity,
  type NotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_TYPE_META,
} from "@/lib/notification-constants";
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  sendBrowserNotification,
  type BrowserPermissionStatus,
} from "@/lib/browser-notifications";

interface NotificationItemDto {
  id: string;
  type: NotificationType;
  typeLabel: string;
  typeIcon: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  isRead: boolean;
  timeFormatted: string;
  createdAt: string;
  dataSource?: string;
  dataTimestamp?: string;
  currentAqi?: number;
  previousAqi?: number;
  actionLabel?: string;
  actionUrl?: string;
}

export function NotificationMenu() {
  const { toast } = useToast();

  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"inbox" | "settings">("inbox");
  const [inboxFilter, setInboxFilter] = React.useState<"all" | "aqi" | "daily" | "community">("all");

  const [notifications, setNotifications] = React.useState<NotificationItemDto[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [preferences, setPreferences] = React.useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [loading, setLoading] = React.useState(false);
  const [savingPrefs, setSavingPrefs] = React.useState(false);

  // Browser Notification Status
  const [browserPermission, setBrowserPermission] = React.useState<BrowserPermissionStatus>("default");

  // Load Notification Inbox & Preferences
  const fetchNotifications = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        const items = json.data?.notifications || [];
        setNotifications(items);
        setUnreadCount(json.data?.unreadCount || 0);
        if (json.data?.preferences) {
          setPreferences(json.data.preferences);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    setBrowserPermission(getBrowserNotificationPermission());
  }, [fetchNotifications]);

  // Request Desktop Permission
  const handleEnableBrowserNotifications = async () => {
    const status = await requestBrowserNotificationPermission();
    setBrowserPermission(status);

    if (status === "granted") {
      sendBrowserNotification("AirAware Alerts Activated", {
        body: "You will now receive instant desktop alerts for severe smog and deterioration.",
      });

      // Update preferences
      try {
        await fetch("/api/notifications/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ browserNotificationsEnabled: true }),
        });
        setPreferences((p) => ({ ...p, browserNotificationsEnabled: true }));
      } catch {
        // Fallback
      }

      toast({
        type: "success",
        title: "Desktop Alerts Enabled",
        message: "You will receive timely smog warnings on this device.",
      });
    } else if (status === "denied") {
      toast({
        type: "warning",
        title: "Permission Denied",
        message: "Please allow notifications in your browser settings to receive alerts.",
      });
    }
  };

  // Mark single as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.warn("Mark read error:", err);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast({
        type: "success",
        title: "All Caught Up",
        message: "All alerts have been marked as read.",
      });
    } catch (err) {
      console.warn("Mark all read error:", err);
    }
  };

  // Toggle Category Preference
  const handleToggleCategory = async (category: keyof NotificationPreferences) => {
    const newVal = !preferences[category];
    const updated = { ...preferences, [category]: newVal };
    setPreferences(updated);

    try {
      setSavingPrefs(true);
      await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [category]: newVal }),
      });
      // Refresh notifications feed with new filter
      await fetchNotifications();
    } catch (err) {
      console.warn("Preference update error:", err);
    } finally {
      setSavingPrefs(false);
    }
  };

  // Filtered Notifications based on selected tab
  const filteredNotifications = notifications.filter((n) => {
    if (inboxFilter === "all") return true;
    const meta = NOTIFICATION_TYPE_META[n.type];
    return meta && meta.categoryGroup === inboxFilter;
  });

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
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-peach border-2 border-white text-[9px] font-black text-[#7c2d12] animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xl p-6 max-h-[85vh] overflow-y-auto space-y-4">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-black text-sm">
                🔔
              </span>
              <DialogTitle className="text-lg font-black text-brand-forest-900">
                AirAware Notification Center
              </DialogTitle>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "inbox" ? "settings" : "inbox")}
                className={cn(
                  "p-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1",
                  activeTab === "settings"
                    ? "bg-brand-forest-900 text-white border-brand-forest-900"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                )}
                title="Notification Settings"
              >
                <Settings className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {activeTab === "settings" ? "Back to Alerts" : "Settings"}
                </span>
              </button>
            </div>
          </div>

          <DialogDescription className="text-xs text-brand-forest-700/80">
            Real-time smog warnings, ventilation windows, and neighborhood hazard alerts.
          </DialogDescription>
        </DialogHeader>

        {/* INBOX VIEW */}
        {activeTab === "inbox" ? (
          <div className="space-y-4 pt-1">
            {/* Browser Permission Prompt Banner */}
            {browserPermission !== "granted" && browserPermission !== "unsupported" && (
              <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 p-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">📢</span>
                  <div>
                    <p className="font-bold text-brand-forest-950">Enable Desktop Smog Alerts</p>
                    <p className="text-[11px] text-slate-600">
                      Get immediate warnings when air deteriorates, even when the browser tab is closed.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="forest"
                  onClick={handleEnableBrowserNotifications}
                  className="font-bold text-xs shrink-0"
                >
                  Enable
                </Button>
              </div>
            )}

            {/* Sub-Tabs: Filter by Category Group */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 gap-2">
              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { id: "all", label: "All" },
                  { id: "aqi", label: "AQI Alerts" },
                  { id: "daily", label: "Daily & Missions" },
                  { id: "community", label: "Community" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setInboxFilter(tab.id as any)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                      inboxFilter === tab.id
                        ? "bg-brand-forest-900 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] font-bold text-brand-forest-800 hover:underline shrink-0"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notifications Feed */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-brand-forest-700" />
                  <span>Loading alerts...</span>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-2xl block mb-1">🌿</span>
                  <p className="font-bold text-slate-700">No active alerts right now.</p>
                  <p className="text-slate-400">Your family air defense parameters are in a safe zone.</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const isCritical = notif.severity === "critical";
                  const isWarning = notif.severity === "warning";

                  return (
                    <div
                      key={notif.id}
                      onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                      className={cn(
                        "p-4 rounded-2xl border transition-all space-y-2.5 relative",
                        !notif.isRead
                          ? isCritical
                            ? "bg-red-50/80 border-red-300 shadow-xs"
                            : isWarning
                            ? "bg-amber-50/80 border-amber-300 shadow-xs"
                            : "bg-[#F0FAF5] border-brand-mint-300 shadow-xs"
                          : "bg-white border-slate-200 opacity-75"
                      )}
                    >
                      {/* Top Row: Type Icon, Label, Severity Badge, Timestamp */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{notif.typeIcon || "📢"}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-brand-forest-900">{notif.title}</h4>
                              {!notif.isRead && (
                                <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {notif.typeLabel}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={cn(
                              "text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md",
                              isCritical
                                ? "bg-red-600 text-white"
                                : isWarning
                                ? "bg-amber-500 text-white"
                                : "bg-emerald-600 text-white"
                            )}
                          >
                            {notif.severity}
                          </span>
                          <span className="text-[10px] text-slate-400">{notif.timeFormatted}</span>
                        </div>
                      </div>

                      {/* Actionable Message Body */}
                      <p className="text-xs text-brand-forest-900 leading-relaxed font-medium">
                        {notif.message}
                      </p>

                      {/* Data Source & Timestamp Provenance */}
                      {notif.dataSource && (
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-200/70">
                          <span className="truncate max-w-[280px]">
                            📡 Source: <strong>{notif.dataSource}</strong>
                          </span>
                          {notif.dataTimestamp && (
                            <span className="shrink-0 text-slate-400">Recorded {notif.dataTimestamp}</span>
                          )}
                        </div>
                      )}

                      {/* Action Button (if present) */}
                      {notif.actionUrl && (
                        <div className="pt-1 flex items-center justify-between">
                          <Link
                            href={notif.actionUrl}
                            onClick={() => {
                              handleMarkAsRead(notif.id);
                              setOpen(false);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-forest-900 hover:text-brand-forest-950 bg-white/90 border border-slate-200 rounded-xl px-3 py-1 shadow-2xs hover:bg-white transition-all"
                          >
                            <span>{notif.actionLabel || "Take Action"}</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>

                          {!notif.isRead && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notif.id);
                              }}
                              className="text-[10px] text-slate-400 hover:text-slate-700"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* SETTINGS VIEW: Toggles for all 7 Categories */
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <h4 className="text-xs font-bold text-brand-forest-900 uppercase tracking-wide">
                  Notification Category Preferences
                </h4>
                <p className="text-[11px] text-slate-500">
                  Select which types of alerts you wish to receive.
                </p>
              </div>

              {savingPrefs && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                </span>
              )}
            </div>

            {/* 7 Category Toggles */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {(
                [
                  "aqi_deterioration",
                  "severe_aqi",
                  "daily_reminder",
                  "mission_reminder",
                  "streak_reminder",
                  "forecast_alert",
                  "community_update",
                ] as (keyof NotificationPreferences)[]
              ).map((categoryKey) => {
                const meta = NOTIFICATION_TYPE_META[categoryKey as NotificationType];
                if (!meta) return null;
                const isChecked = preferences[categoryKey] !== false;

                return (
                  <div
                    key={categoryKey}
                    className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl mt-0.5">{meta.icon}</span>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-brand-forest-900 block">{meta.label}</span>
                        <p className="text-[11px] text-slate-500 leading-snug">{meta.description}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleCategory(categoryKey)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        isChecked ? "bg-emerald-600" : "bg-slate-200"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                          isChecked ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                );
              })}

              {/* Quiet Hours Info */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between text-slate-700">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-purple-600" />
                  <div>
                    <span className="font-bold text-brand-forest-900 block">Quiet Hours Active</span>
                    <span className="text-[11px] text-slate-500">
                      Non-critical advisories silenced between 10:00 PM and 7:00 AM.
                    </span>
                  </div>
                </div>
                <Badge variant="mint">Protected</Badge>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="forest"
                size="sm"
                onClick={() => setActiveTab("inbox")}
                className="font-bold text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
