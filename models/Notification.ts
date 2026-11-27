import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type NotificationType =
  | "aqi_deterioration"
  | "severe_aqi"
  | "daily_reminder"
  | "mission_reminder"
  | "streak_reminder"
  | "forecast_alert"
  | "community_update"
  // Legacy aliases for backward compatibility
  | "aqi_alert"
  | "streak_risk"
  | "achievement"
  | "safety_advisory"
  | "system";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";
export type NotificationSeverity = "info" | "warning" | "critical" | "success";

export interface INotificationMetadata {
  aqi?: number;
  previousAqi?: number;
  category?: string;
  stationName?: string;
  source?: string;
  dataTimestamp?: string;
  actionUrl?: string;
  actionLabel?: string;
  badgeId?: string;
  missionId?: string;
  [key: string]: unknown;
}

export interface INotification {
  _id?: string;
  userId: Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  severity: NotificationSeverity;
  isRead: boolean;
  readAt?: Date;
  metadata?: INotificationMetadata;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotificationDocument extends Document, Omit<INotification, "_id"> {}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "aqi_deterioration",
        "severe_aqi",
        "daily_reminder",
        "mission_reminder",
        "streak_reminder",
        "forecast_alert",
        "community_update",
        "aqi_alert",
        "streak_risk",
        "achievement",
        "safety_advisory",
        "system",
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 600,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    severity: {
      type: String,
      enum: ["info", "warning", "critical", "success"],
      default: "info",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// High-speed user notification inbox querying (unread first, latest first)
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification: Model<INotificationDocument> =
  (mongoose.models && mongoose.models.Notification) ||
  mongoose.model<INotificationDocument>("Notification", NotificationSchema);
