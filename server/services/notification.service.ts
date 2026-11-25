import "server-only";
import { connectToDatabase } from "@/server/db";
import { Notification } from "@/models/Notification";

export interface AirAwareNotification {
  id: string;
  type: "smog_alert" | "window_recommendation" | "purifier_filter" | "achievement";
  title: string;
  message: string;
  severity: "info" | "warning" | "alert";
  timestamp: string;
  read: boolean;
}

export class NotificationService {
  private static fallbackNotifications: AirAwareNotification[] = [
    {
      id: "notif_1",
      type: "smog_alert",
      title: "Severe Smog Alert",
      message: "AQI spiked to 185 in your neighborhood. Keep windows sealed.",
      severity: "alert",
      timestamp: "15 min ago",
      read: false,
    },
    {
      id: "notif_2",
      type: "window_recommendation",
      title: "Optimal Clean Air Window",
      message: "Atmospheric mixing is at its peak between 12:30 PM and 3:30 PM today.",
      severity: "info",
      timestamp: "2 hours ago",
      read: false,
    },
    {
      id: "notif_3",
      type: "achievement",
      title: "7-Day Streak Achieved!",
      message: "Congratulations! You protected your family 7 days in a row (+50 XP).",
      severity: "info",
      timestamp: "Yesterday",
      read: true,
    },
  ];

  async getNotifications(userId?: string): Promise<AirAwareNotification[]> {
    try {
      await connectToDatabase();
      const filter = userId ? { userId } : {};
      const docs = await Notification.find(filter)
        .sort({ isRead: 1, createdAt: -1 })
        .limit(20)
        .lean()
        .exec();

      if (docs && docs.length > 0) {
        return docs.map((doc) => {
          const typeMapping: Record<string, AirAwareNotification["type"]> = {
            aqi_alert: "smog_alert",
            mission_reminder: "window_recommendation",
            streak_risk: "achievement",
            achievement: "achievement",
            safety_advisory: "smog_alert",
          };

          const createdTime = doc.createdAt ? new Date(doc.createdAt).getTime() : Date.now();
          const minutesAgo = Math.max(1, Math.floor((Date.now() - createdTime) / 60000));
          const timeLabel = minutesAgo < 60 ? `${minutesAgo} min ago` : `${Math.floor(minutesAgo / 60)} hours ago`;

          return {
            id: doc._id.toString(),
            type: typeMapping[doc.type] || "smog_alert",
            title: doc.title,
            message: doc.message,
            severity: doc.priority === "urgent" || doc.priority === "high" ? "alert" : doc.priority === "medium" ? "warning" : "info",
            timestamp: timeLabel,
            read: doc.isRead,
          };
        });
      }
    } catch {
      // Fallback
    }

    return [...NotificationService.fallbackNotifications];
  }

  async markAsRead(id: string): Promise<AirAwareNotification | null> {
    try {
      await connectToDatabase();
      const doc = await Notification.findByIdAndUpdate(
        id,
        { isRead: true, readAt: new Date() },
        { new: true }
      ).lean();

      if (doc) {
        return {
          id: doc._id.toString(),
          type: "smog_alert",
          title: doc.title,
          message: doc.message,
          severity: "info",
          timestamp: "Just now",
          read: true,
        };
      }
    } catch {
      // Fallback
    }

    const item = NotificationService.fallbackNotifications.find((n) => n.id === id);
    if (!item) return null;
    item.read = true;
    return { ...item };
  }

  async markAllAsRead(userId?: string): Promise<void> {
    try {
      await connectToDatabase();
      const filter = userId ? { userId } : {};
      await Notification.updateMany(filter, { isRead: true, readAt: new Date() });
    } catch {
      // Fallback
    }

    NotificationService.fallbackNotifications.forEach((n) => (n.read = true));
  }
}

export const notificationService = new NotificationService();
