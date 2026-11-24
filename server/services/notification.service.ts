import "server-only";

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
  private static notifications: AirAwareNotification[] = [
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

  async getNotifications(): Promise<AirAwareNotification[]> {
    return [...NotificationService.notifications];
  }

  async markAsRead(id: string): Promise<AirAwareNotification | null> {
    const item = NotificationService.notifications.find((n) => n.id === id);
    if (!item) return null;
    item.read = true;
    return { ...item };
  }

  async markAllAsRead(): Promise<void> {
    NotificationService.notifications.forEach((n) => (n.read = true));
  }
}

export const notificationService = new NotificationService();
