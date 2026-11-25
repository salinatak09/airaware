import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPlanWindow {
  start: string;
  end: string;
  reason: string;
}

export interface IPlanMission {
  missionId: string;
  title: string;
  description: string;
  category: "protection" | "indoor" | "habit" | "community" | "transit";
  xpReward: number;
  completed: boolean;
  completedAt?: Date;
}

export interface IPlanRecommendations {
  general: string[];
  outdoorActivity: string[];
  indoorEnvironment: string[];
  commute: string[];
  exercise: string[];
}

export interface IAiModelMetadata {
  modelName: string;
  generatedAt: Date;
  latencyMs?: number;
  deterministicSafetyApplied: boolean;
}

export interface IDailyPlan {
  _id?: string;
  userId: Types.ObjectId | string;
  date: string; // YYYY-MM-DD
  aqiContext: {
    expectedAqi: number;
    category: string;
    safestWindow?: IPlanWindow;
    peakSmogWindow?: IPlanWindow;
    dominantRisk?: string;
  };
  missions: IPlanMission[];
  recommendations: IPlanRecommendations;
  planVersion: number;
  aiModelMetadata?: IAiModelMetadata;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDailyPlanDocument extends Document, Omit<IDailyPlan, "_id"> {}

const DailyPlanSchema = new Schema<IDailyPlanDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    aqiContext: {
      expectedAqi: { type: Number, required: true },
      category: { type: String, required: true },
      safestWindow: {
        start: { type: String, default: "01:00 PM" },
        end: { type: String, default: "03:30 PM" },
        reason: { type: String, default: "Optimal atmospheric thermal mixing layer" },
      },
      peakSmogWindow: {
        start: { type: String, default: "07:00 AM" },
        end: { type: String, default: "09:30 AM" },
        reason: { type: String, default: "Morning ground inversion traps vehicular emissions" },
      },
      dominantRisk: { type: String, default: "pm25" },
    },
    missions: [
      {
        missionId: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: {
          type: String,
          enum: ["protection", "indoor", "habit", "community", "transit"],
          default: "protection",
        },
        xpReward: { type: Number, default: 20 },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
      },
    ],
    recommendations: {
      general: { type: [String], default: [] },
      outdoorActivity: { type: [String], default: [] },
      indoorEnvironment: { type: [String], default: [] },
      commute: { type: [String], default: [] },
      exercise: { type: [String], default: [] },
    },
    planVersion: {
      type: Number,
      default: 1,
    },
    aiModelMetadata: {
      modelName: { type: String, default: "deterministic-engine" },
      generatedAt: { type: Date, default: Date.now },
      latencyMs: { type: Number, default: 0 },
      deterministicSafetyApplied: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one plan per user per calendar day
DailyPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyPlan: Model<IDailyPlanDocument> =
  (mongoose.models && mongoose.models.DailyPlan) ||
  mongoose.model<IDailyPlanDocument>("DailyPlan", DailyPlanSchema);
