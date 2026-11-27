import "server-only";
import mongoose from "mongoose";
import { connectToDatabase } from "../db/index.ts";
import { Notification, type INotificationDocument } from "../../models/index.ts";
import {
  type NotificationType,
  type NotificationSeverity,
  type NotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_TYPE_META,
} from "../../lib/notification-constants.ts";

export interface NotificationItem {
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
  readAt?: string;
  dataSource?: string;
  dataTimestamp?: string;
  currentAqi?: number;
  previousAqi?: number;
  actionLabel?: string;
  actionUrl?: string;
}

// In-memory user preferences store
const userPreferencesStore = new Map<string, NotificationPreferences>();

// Anti-spam alert deduplication store: key -> timestamp
const alertCooldownStore = new Map<string, number>();

export class NotificationService {
  private static lastDbCheck = 0;
  private static dbOffline = false;

  // In-memory fallback dataset for seamless offline operation & unit testing
  private static inMemoryNotifications: NotificationItem[] = [
    {
      id: "notif_101",
      type: "aqi_deterioration",
      typeLabel: "AQI Deterioration Alerts",
      typeIcon: "📉",
      title: "Air Quality Deterioration Alert",
      message: "Air quality has worsened from Moderate (125) to Poor (182). Consider moving outdoor activities indoors.",
      severity: "warning",
      isRead: false,
      timeFormatted: "15m ago",
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      dataSource: "CPCB Ground Monitoring Station (Anand Vihar)",
      dataTimestamp: "10:30 AM IST",
      currentAqi: 182,
      previousAqi: 125,
      actionLabel: "Move Activities Indoors",
      actionUrl: "/indoor",
    },
    {
      id: "notif_102",
      type: "severe_aqi",
      typeLabel: "Severe Smog Emergency Alerts",
      typeIcon: "🚨",
      title: "Severe Smog Alert (AQI 412)",
      message: "Emergency pollution threshold exceeded. Halt all outdoor school sports and wear well-fitted N95 masks.",
      severity: "critical",
      isRead: false,
      timeFormatted: "45m ago",
      createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      dataSource: "Delhi Pollution Control Committee (DPCC Ground Station)",
      dataTimestamp: "10:00 AM IST",
      currentAqi: 412,
      previousAqi: 360,
      actionLabel: "View Emergency Shield",
      actionUrl: "/indoor",
    },
    {
      id: "notif_103",
      type: "daily_reminder",
      typeLabel: "Daily Morning Air Check",
      typeIcon: "🌅",
      title: "Morning Smog & Commute Forecast",
      message: "Today's peak smog window is between 7:30 AM - 10:00 AM. Choose sealed transit routes.",
      severity: "info",
      isRead: false,
      timeFormatted: "2h ago",
      createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
      dataSource: "AirAware Morning Diurnal Forecast Model",
      dataTimestamp: "7:00 AM IST",
      currentAqi: 168,
      actionLabel: "Open My Day Plan",
      actionUrl: "/my-day",
    },
    {
      id: "notif_104",
      type: "mission_reminder",
      typeLabel: "Mission & Clean Air Room Windows",
      typeIcon: "🛡️",
      title: "Afternoon Ventilation Window Open",
      message: "Outdoor PM2.5 has dipped below 70 µg/m³ for the next 90 minutes. Safe window for room cross-ventilation.",
      severity: "info",
      isRead: true,
      timeFormatted: "4h ago",
      createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
      dataSource: "IMD Thermal Mixing Model",
      dataTimestamp: "1:15 PM IST",
      actionLabel: "Ventilate Now (+15 XP)",
      actionUrl: "/indoor",
    },
    {
      id: "notif_105",
      type: "streak_reminder",
      typeLabel: "Streak Savers & Milestone Reminders",
      typeIcon: "🔥",
      title: "Streak Saver Alert",
      message: "Your 7-day smog protection streak is at risk. Log today's evening indoor check to maintain your flame!",
      severity: "warning",
      isRead: true,
      timeFormatted: "Yesterday",
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      actionLabel: "Log Action (+10 XP)",
      actionUrl: "/impact",
    },
    {
      id: "notif_106",
      type: "community_update",
      typeLabel: "Community Smoke & Hazard Reports",
      typeIcon: "📢",
      title: "Open Waste Burning Reported Nearby",
      message: "Neighbors reported leaf and plastic burning near Outer Ring Road flyover. Keep north-facing windows closed.",
      severity: "warning",
      isRead: false,
      timeFormatted: "30m ago",
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      dataSource: "AirAware Citizen Community Report (Verified)",
      dataTimestamp: "10:15 AM IST",
      actionLabel: "View on Map",
      actionUrl: "/community",
    },
    {
      id: "notif_107",
      type: "forecast_alert",
      typeLabel: "Forecast & Thermal Inversion Shifts",
      typeIcon: "🌪️",
      title: "Thermal Inversion Alert for Tomorrow",
      message: "Surface temperature inversion expected tomorrow morning. Particulate will remain trapped near ground level until 11 AM.",
      severity: "warning",
      isRead: true,
      timeFormatted: "Yesterday",
      createdAt: new Date(Date.now() - 28 * 3600000).toISOString(),
      dataSource: "Copernicus Atmospheric Service",
      dataTimestamp: "Yesterday 6:00 PM",
      actionLabel: "Prepare Route",
      actionUrl: "/my-day",
    },
  ];

  /**
   * Safe Database connection helper
   */
  private async safeDbConnect(): Promise<boolean> {
    const now = Date.now();
    if (NotificationService.dbOffline && now - NotificationService.lastDbCheck < 30000) {
      return false;
    }
    try {
      await connectToDatabase();
      NotificationService.dbOffline = false;
      return true;
    } catch {
      NotificationService.dbOffline = true;
      NotificationService.lastDbCheck = now;
      return false;
    }
  }

  /**
   * Format relative time string
   */
  private formatTimeAgo(dateInput: Date | string): string {
    const time = new Date(dateInput).getTime();
    const diffMs = Date.now() - time;
    const mins = Math.max(1, Math.floor(diffMs / 60000));
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  /**
   * Retrieve user notification preferences
   */
  async getUserPreferences(userId?: string): Promise<NotificationPreferences> {
    const key = userId || "default_user";
    const existing = userPreferencesStore.get(key);
    if (existing) {
      return { ...existing };
    }
    const defaults = { ...DEFAULT_NOTIFICATION_PREFERENCES };
    userPreferencesStore.set(key, defaults);
    return defaults;
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string | undefined,
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const key = userId || "default_user";
    const current = await this.getUserPreferences(key);
    const updated = { ...current, ...updates };
    userPreferencesStore.set(key, updated);
    return updated;
  }

  /**
   * Retrieve notifications with category preference filtering & unread calculation
   */
  async getNotifications(params?: {
    userId?: string;
    categoryGroup?: string;
    unreadOnly?: boolean;
    limit?: number;
  }): Promise<{ notifications: NotificationItem[]; unreadCount: number; preferences: NotificationPreferences }> {
    const userId = params?.userId || "default_user";
    const preferences = await this.getUserPreferences(userId);
    const limit = params?.limit || 30;

    let notifications: NotificationItem[] = [];

    const dbConnected = await this.safeDbConnect();
    if (dbConnected && userId && userId !== "default_user") {
      try {
        const query: any = { userId };
        if (params?.unreadOnly) {
          query.isRead = false;
        }

        const docs: any[] = await Notification.find(query)
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean()
          .exec();

        if (docs && docs.length > 0) {
          notifications = docs.map((doc) => {
            const typeKey = (doc.type as NotificationType) || "aqi_deterioration";
            const meta = NOTIFICATION_TYPE_META[typeKey] || NOTIFICATION_TYPE_META.aqi_deterioration;

            return {
              id: doc._id.toString(),
              type: typeKey,
              typeLabel: meta.label,
              typeIcon: meta.icon,
              title: doc.title,
              message: doc.message,
              severity: (doc.severity as NotificationSeverity) || meta.defaultSeverity,
              isRead: doc.isRead,
              timeFormatted: this.formatTimeAgo(doc.createdAt || new Date()),
              createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
              readAt: doc.readAt ? new Date(doc.readAt).toISOString() : undefined,
              dataSource: doc.metadata?.source || doc.metadata?.stationName,
              dataTimestamp: doc.metadata?.dataTimestamp,
              currentAqi: doc.metadata?.aqi,
              previousAqi: doc.metadata?.previousAqi,
              actionLabel: doc.metadata?.actionLabel,
              actionUrl: doc.metadata?.actionUrl,
            };
          });
        }
      } catch (err) {
        console.warn("MongoDB getNotifications fallback to in-memory:", err);
      }
    }

    if (notifications.length === 0) {
      notifications = [...NotificationService.inMemoryNotifications];
      if (params?.unreadOnly) {
        notifications = notifications.filter((n) => !n.isRead);
      }
    }

    // Filter notifications based on user's category toggles
    notifications = notifications.filter((n) => {
      // Check if user has disabled this category
      const isEnabled = preferences[n.type];
      return isEnabled !== false;
    });

    // Optional category group filter
    if (params?.categoryGroup && params.categoryGroup !== "all") {
      notifications = notifications.filter((n) => {
        const meta = NOTIFICATION_TYPE_META[n.type];
        return meta && meta.categoryGroup === params.categoryGroup;
      });
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      notifications: notifications.slice(0, limit),
      unreadCount,
      preferences,
    };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string): Promise<NotificationItem | null> {
    const dbConnected = await this.safeDbConnect();
    if (dbConnected) {
      try {
        const doc: any = await Notification.findByIdAndUpdate(
          notificationId,
          { isRead: true, readAt: new Date() },
          { new: true }
        ).lean();

        if (doc) {
          const typeKey = (doc.type as NotificationType) || "aqi_deterioration";
          const meta = NOTIFICATION_TYPE_META[typeKey] || NOTIFICATION_TYPE_META.aqi_deterioration;

          return {
            id: doc._id.toString(),
            type: typeKey,
            typeLabel: meta.label,
            typeIcon: meta.icon,
            title: doc.title,
            message: doc.message,
            severity: (doc.severity as NotificationSeverity) || meta.defaultSeverity,
            isRead: true,
            timeFormatted: this.formatTimeAgo(doc.createdAt || new Date()),
            createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
            readAt: new Date().toISOString(),
            dataSource: doc.metadata?.source || doc.metadata?.stationName,
            dataTimestamp: doc.metadata?.dataTimestamp,
            currentAqi: doc.metadata?.aqi,
            previousAqi: doc.metadata?.previousAqi,
            actionLabel: doc.metadata?.actionLabel,
            actionUrl: doc.metadata?.actionUrl,
          };
        }
      } catch (err) {
        console.warn("MongoDB markAsRead fallback:", err);
      }
    }

    // In-memory fallback
    const memNotif = NotificationService.inMemoryNotifications.find((n) => n.id === notificationId);
    if (memNotif) {
      memNotif.isRead = true;
      memNotif.readAt = new Date().toISOString();
      return { ...memNotif };
    }

    return null;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId?: string): Promise<{ success: boolean; updatedCount: number }> {
    let updatedCount = 0;

    const dbConnected = await this.safeDbConnect();
    if (dbConnected && userId && userId !== "default_user") {
      try {
        const res = await Notification.updateMany(
          { userId, isRead: false },
          { isRead: true, readAt: new Date() }
        );
        updatedCount = res.modifiedCount || 0;
      } catch (err) {
        console.warn("MongoDB markAllAsRead fallback:", err);
      }
    }

    // In-memory fallback
    NotificationService.inMemoryNotifications.forEach((n) => {
      if (!n.isRead) {
        n.isRead = true;
        n.readAt = new Date().toISOString();
        updatedCount++;
      }
    });

    return { success: true, updatedCount };
  }

  /**
   * Anti-Spam & Deterioration Evaluator:
   * Evaluates AQI changes and creates actionable alerts avoiding notification spam.
   */
  async evaluateAqiAlerts(input: {
    currentAqi: number;
    previousAqi?: number;
    locationName: string;
    stationName?: string;
    sourceType?: "ground_station" | "modeled";
    timestamp?: string;
    userId?: string;
  }): Promise<NotificationItem | null> {
    const { currentAqi, previousAqi = 100, locationName, stationName, sourceType, timestamp, userId = "default_user" } = input;
    const now = Date.now();
    const sourceLabel = stationName || (sourceType === "ground_station" ? "CPCB Official Ground Station" : "Open-Meteo Modeled Data");
    const timeLabel = timestamp || new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    // 1. Severe AQI Alert (AQI >= 300)
    if (currentAqi >= 300) {
      const cooldownKey = `${userId}_severe_${Math.floor(now / (2 * 3600000))}`; // 2-hour cooldown
      if (!alertCooldownStore.has(cooldownKey)) {
        alertCooldownStore.set(cooldownKey, now);

        return this.createNotification({
          userId,
          type: "severe_aqi",
          title: `Severe Smog Alert (AQI ${currentAqi}) in ${locationName}`,
          message: `Hazardous air quality detected (${currentAqi} AQI). Keep windows sealed, run indoor air filtration, and halt outdoor exercise.`,
          severity: "critical",
          currentAqi,
          previousAqi,
          dataSource: sourceLabel,
          dataTimestamp: timeLabel,
          actionLabel: "View Safety Advisory",
          actionUrl: "/indoor",
        });
      }
    }

    // 2. AQI Deterioration Alert (Worsened by >= 30 points into Moderate/Poor/Very Poor)
    const delta = currentAqi - previousAqi;
    if (delta >= 30 && currentAqi >= 150) {
      const cooldownKey = `${userId}_deterioration_${Math.floor(now / (2 * 3600000))}`;
      if (!alertCooldownStore.has(cooldownKey)) {
        alertCooldownStore.set(cooldownKey, now);

        return this.createNotification({
          userId,
          type: "aqi_deterioration",
          title: `Air Quality Deterioration in ${locationName}`,
          message: `Air quality has worsened from ${previousAqi} to ${currentAqi} AQI. Consider moving outdoor activities indoors.`,
          severity: "warning",
          currentAqi,
          previousAqi,
          dataSource: sourceLabel,
          dataTimestamp: timeLabel,
          actionLabel: "Consider Indoor Activities",
          actionUrl: "/indoor",
        });
      }
    }

    return null;
  }

  /**
   * Create and record a new notification
   */
  async createNotification(input: {
    userId?: string;
    type: NotificationType;
    title: string;
    message: string;
    severity?: NotificationSeverity;
    currentAqi?: number;
    previousAqi?: number;
    dataSource?: string;
    dataTimestamp?: string;
    actionLabel?: string;
    actionUrl?: string;
  }): Promise<NotificationItem> {
    const userId = input.userId || "default_user";
    const meta = NOTIFICATION_TYPE_META[input.type] || NOTIFICATION_TYPE_META.aqi_deterioration;
    const severity = input.severity || meta.defaultSeverity;

    const newItem: NotificationItem = {
      id: `notif_${Date.now()}`,
      type: input.type,
      typeLabel: meta.label,
      typeIcon: meta.icon,
      title: input.title,
      message: input.message,
      severity,
      isRead: false,
      timeFormatted: "Just now",
      createdAt: new Date().toISOString(),
      dataSource: input.dataSource,
      dataTimestamp: input.dataTimestamp,
      currentAqi: input.currentAqi,
      previousAqi: input.previousAqi,
      actionLabel: input.actionLabel,
      actionUrl: input.actionUrl,
    };

    const dbConnected = await this.safeDbConnect();
    if (dbConnected && userId !== "default_user") {
      try {
        const created = await Notification.create({
          userId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : new mongoose.Types.ObjectId(),
          type: input.type,
          title: input.title,
          message: input.message,
          severity,
          priority: severity === "critical" ? "urgent" : severity === "warning" ? "high" : "medium",
          isRead: false,
          metadata: {
            aqi: input.currentAqi,
            previousAqi: input.previousAqi,
            source: input.dataSource,
            dataTimestamp: input.dataTimestamp,
            actionLabel: input.actionLabel,
            actionUrl: input.actionUrl,
          },
        });
        newItem.id = created._id.toString();
      } catch (err) {
        console.warn("MongoDB createNotification error:", err);
      }
    }

    // Prepend to in-memory store
    NotificationService.inMemoryNotifications.unshift(newItem);
    if (NotificationService.inMemoryNotifications.length > 50) {
      NotificationService.inMemoryNotifications.pop();
    }

    return newItem;
  }
}

export const notificationService = new NotificationService();
