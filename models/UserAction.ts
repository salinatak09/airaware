import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ActionType =
  | "air_check"
  | "mask_worn"
  | "purifier_on"
  | "indoor_recess"
  | "route_adjusted"
  | "window_sealed"
  | "report_submitted"
  | "hydration_logged"
  | "quiz_completed";

export interface IUserAction {
  _id?: string;
  userId: Types.ObjectId | string;
  actionType: ActionType;
  completedAt: Date;
  xpEarned: number;
  associatedMissionId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserActionDocument extends Document, Omit<IUserAction, "_id"> {}

const UserActionSchema = new Schema<IUserActionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      enum: [
        "air_check",
        "mask_worn",
        "purifier_on",
        "indoor_recess",
        "route_adjusted",
        "window_sealed",
        "report_submitted",
        "hydration_logged",
        "quiz_completed",
      ],
      required: true,
      index: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    xpEarned: {
      type: Number,
      default: 10,
      min: 0,
    },
    associatedMissionId: {
      type: String,
      trim: true,
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

// Compound indexes for analytics and user activity timelines
UserActionSchema.index({ userId: 1, completedAt: -1 });
UserActionSchema.index({ userId: 1, actionType: 1 });

export const UserAction: Model<IUserActionDocument> =
  (mongoose.models && mongoose.models.UserAction) ||
  mongoose.model<IUserActionDocument>("UserAction", UserActionSchema);
