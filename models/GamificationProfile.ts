import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IBadgeRecord {
  badgeId: string;
  name: string;
  category: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  earnedAt: Date;
  description: string;
}

export interface IAchievementRecord {
  achievementId: string;
  title: string;
  progress: number; // 0 - 100%
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface IStreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: Date;
  streakFreezesAvailable: number;
}

export interface IGamificationProfile {
  _id?: string;
  userId: Types.ObjectId | string;
  totalXp: number;
  level: number;
  streak: IStreakData;
  badges: IBadgeRecord[];
  achievements: IAchievementRecord[];
  completedMissionsCount: number;
  weeklyXp: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGamificationProfileDocument extends Document, Omit<IGamificationProfile, "_id"> {}

const GamificationProfileSchema = new Schema<IGamificationProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    totalXp: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    streak: {
      currentStreak: { type: Number, default: 0, min: 0 },
      longestStreak: { type: Number, default: 0, min: 0 },
      lastActiveDate: { type: Date },
      streakFreezesAvailable: { type: Number, default: 1, min: 0 },
    },
    badges: [
      {
        badgeId: { type: String, required: true },
        name: { type: String, required: true },
        category: { type: String, default: "general" },
        icon: { type: String, default: "award" },
        tier: {
          type: String,
          enum: ["bronze", "silver", "gold", "platinum"],
          default: "bronze",
        },
        earnedAt: { type: Date, default: Date.now },
        description: { type: String, required: true },
      },
    ],
    achievements: [
      {
        achievementId: { type: String, required: true },
        title: { type: String, required: true },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        unlocked: { type: Boolean, default: false },
        unlockedAt: { type: Date },
      },
    ],
    completedMissionsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    weeklyXp: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const GamificationProfile: Model<IGamificationProfileDocument> =
  (mongoose.models && mongoose.models.GamificationProfile) ||
  mongoose.model<IGamificationProfileDocument>("GamificationProfile", GamificationProfileSchema);
