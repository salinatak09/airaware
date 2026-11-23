import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFamilyMember {
  name: string;
  ageGroup: "infant" | "child" | "teen" | "adult" | "senior";
  healthConditions: string[];
  vulnerabilityLevel: "low" | "medium" | "high" | "critical";
  notes?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  homeLocation?: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  familyMembers: IFamilyMember[];
  gamification: {
    points: number;
    level: number;
    streakDays: number;
    lastActiveDate?: Date;
  };
  preferences: {
    notificationsEnabled: boolean;
    aqiThresholdAlert: number;
    temperatureUnit: "celsius" | "fahrenheit";
  };
  createdAt: Date;
  updatedAt: Date;
}

const FamilyMemberSchema = new Schema<IFamilyMember>(
  {
    name: { type: String, required: true, trim: true },
    ageGroup: {
      type: String,
      enum: ["infant", "child", "teen", "adult", "senior"],
      default: "adult",
    },
    healthConditions: {
      type: [String],
      default: ["none"],
    },
    vulnerabilityLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
    notes: { type: String, maxlength: 250 },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, select: false },
    homeLocation: {
      city: { type: String, default: "New Delhi" },
      country: { type: String, default: "India" },
      latitude: { type: Number, default: 28.6139 },
      longitude: { type: Number, default: 77.209 },
    },
    familyMembers: {
      type: [FamilyMemberSchema],
      default: [],
    },
    gamification: {
      points: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      streakDays: { type: Number, default: 0 },
      lastActiveDate: { type: Date },
    },
    preferences: {
      notificationsEnabled: { type: Boolean, default: true },
      aqiThresholdAlert: { type: Number, default: 150 },
      temperatureUnit: { type: String, enum: ["celsius", "fahrenheit"], default: "celsius" },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model in Next.js development hot-reloading
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
