export type NotificationType =
  | "aqi_deterioration"
  | "severe_aqi"
  | "daily_reminder"
  | "mission_reminder"
  | "streak_reminder"
  | "forecast_alert"
  | "community_update";

export type NotificationSeverity = "info" | "warning" | "critical" | "success";

export interface NotificationPreferences {
  // Category Toggles
  aqi_deterioration: boolean;
  severe_aqi: boolean;
  daily_reminder: boolean;
  mission_reminder: boolean;
  streak_reminder: boolean;
  forecast_alert: boolean;
  community_update: boolean;

  // Global Settings
  browserNotificationsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string; // e.g. "07:00"
  aqiThreshold: number; // e.g. 150
  minSeverity: NotificationSeverity;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  aqi_deterioration: true,
  severe_aqi: true,
  daily_reminder: true,
  mission_reminder: true,
  streak_reminder: true,
  forecast_alert: true,
  community_update: true,
  browserNotificationsEnabled: false,
  quietHoursEnabled: true,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  aqiThreshold: 150,
  minSeverity: "info",
};

export const NOTIFICATION_TYPE_META: Record<
  NotificationType,
  {
    label: string;
    icon: string;
    defaultSeverity: NotificationSeverity;
    description: string;
    categoryGroup: "aqi" | "daily" | "community";
  }
> = {
  aqi_deterioration: {
    label: "AQI Deterioration Alerts",
    icon: "📉",
    defaultSeverity: "warning",
    description: "Instant notice when local air quality rapidly degrades to a worse risk category.",
    categoryGroup: "aqi",
  },
  severe_aqi: {
    label: "Severe Smog Emergency Alerts",
    icon: "🚨",
    defaultSeverity: "critical",
    description: "Urgent health alerts when AQI spikes into Very Poor (300+) or Severe (400+).",
    categoryGroup: "aqi",
  },
  daily_reminder: {
    label: "Daily Morning Air Check",
    icon: "🌅",
    defaultSeverity: "info",
    description: "Morning brief with today's peak smog windows and school/commute safety advice.",
    categoryGroup: "daily",
  },
  mission_reminder: {
    label: "Mission & Clean Air Room Windows",
    icon: "🛡️",
    defaultSeverity: "info",
    description: "Timely prompts when afternoon thermal ventilation windows open or purifiers need attention.",
    categoryGroup: "daily",
  },
  streak_reminder: {
    label: "Streak Savers & Milestone Reminders",
    icon: "🔥",
    defaultSeverity: "info",
    description: "Evening reminder to log daily defense habits and maintain family protection streaks.",
    categoryGroup: "daily",
  },
  forecast_alert: {
    label: "Forecast & Thermal Inversion Shifts",
    icon: "🌪️",
    defaultSeverity: "warning",
    description: "Advance warning when weather inversions, fog, or low winds trap particulate overnight.",
    categoryGroup: "aqi",
  },
  community_update: {
    label: "Community Smoke & Hazard Reports",
    icon: "📢",
    defaultSeverity: "warning",
    description: "Alerts when neighbors report nearby open waste burning, heavy dust, or traffic bottlenecks.",
    categoryGroup: "community",
  },
};
