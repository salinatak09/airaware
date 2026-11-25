import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type NotificationType =
  | "aqi_alert"
  | "mission_reminder"
  | "streak_risk"
  | "achievement"
  | "community_update"
  | "safety_advisory"
  | "system";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface INotificationMetadata {
  aqi?: number;
  category?: string;
  actionUrl?: string;
  badgeId?: string;
  [key: string]: unknown;
}

export interface INotification {
  _id?: string;
  userId: Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
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
        "aqi_alert",
        "mission_reminder",
        "streak_risk",
        "achievement",
        "community_update",
        "safety_advisory",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
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
