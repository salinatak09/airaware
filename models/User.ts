import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFamilyMember {
  name: string;
  ageGroup: "infant" | "child" | "teen" | "adult" | "senior";
  healthConditions: string[];
  vulnerabilityLevel: "low" | "medium" | "high" | "critical";
  notes?: string;
}

export interface IUserPrivacySettings {
  approximateLocationOnly: boolean;
  anonymizeCommunityReports: boolean;
  optOutAnalytics: boolean;
  optOutHealthContext: boolean;
}

export interface IAIPersonalizationSettings {
  enabled: boolean;
  enableCommuteAdvice: boolean;
  enableIndoorAdvice: boolean;
  storeChatHistory: boolean;
}

export interface IUserPreferences {
  theme?: "light" | "dark" | "system";
  language?: string;
  notificationsEnabled: boolean;
  aqiThresholdAlert?: number;
  aqiAlertThreshold?: number; // Alias for clarity
  temperatureUnit: "celsius" | "fahrenheit";
  aqiStandard?: "CPCB_NAQI" | "US_EPA";
  distanceUnit?: "km" | "miles";
  privacy?: IUserPrivacySettings;
  aiPersonalization?: IAIPersonalizationSettings;
}

export interface IUserLocation {
  city: string;
  area?: string;
  state?: string;
  country: string;
  coordinates: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isApproximate?: boolean;
}

export interface IUserData {
  _id?: string;
  name: string;
  email: string;
  bio?: string;
  phone?: string;
  authProvider?: "credentials" | "google" | "apple" | "anonymous";
  authProviderId?: string;
  passwordHash?: string;
  avatar?: string;
  location?: IUserLocation;
  homeLocation?: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  familyMembers: IFamilyMember[];
  gamification?: {
    points: number;
    level: number;
    streakDays: number;
    lastActiveDate?: Date;
  };
  preferences: IUserPreferences;
  onboardingComplete?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends Document, Omit<IUserData, "_id"> {}

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

const UserSchema = new Schema<IUserDocument>(
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
    bio: { type: String, trim: true, maxlength: 250 },
    phone: { type: String, trim: true, maxlength: 20 },
    authProvider: {
      type: String,
      enum: ["credentials", "google", "apple", "anonymous"],
      default: "credentials",
    },
    authProviderId: {
      type: String,
      sparse: true,
      index: true,
    },
    passwordHash: { type: String, select: false },
    avatar: {
      type: String,
      default: "aero-avatar-default",
    },
    location: {
      city: { type: String, default: "New Delhi", trim: true },
      area: { type: String, default: "Connaught Place", trim: true },
      state: { type: String, default: "Delhi", trim: true },
      country: { type: String, default: "India" },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [77.209, 28.6139], // Delhi default
        },
      },
      latitude: { type: Number, default: 28.6139 },
      longitude: { type: Number, default: 77.209 },
      timezone: { type: String, default: "Asia/Kolkata" },
      isApproximate: { type: Boolean, default: true },
    },
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
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "light",
      },
      language: { type: String, default: "en" },
      notificationsEnabled: { type: Boolean, default: true },
      aqiThresholdAlert: { type: Number, default: 150 },
      aqiAlertThreshold: { type: Number, default: 150 },
      temperatureUnit: {
        type: String,
        enum: ["celsius", "fahrenheit"],
        default: "celsius",
      },
      aqiStandard: {
        type: String,
        enum: ["CPCB_NAQI", "US_EPA"],
        default: "CPCB_NAQI",
      },
      distanceUnit: {
        type: String,
        enum: ["km", "miles"],
        default: "km",
      },
      privacy: {
        approximateLocationOnly: { type: Boolean, default: true },
        anonymizeCommunityReports: { type: Boolean, default: false },
        optOutAnalytics: { type: Boolean, default: false },
        optOutHealthContext: { type: Boolean, default: false },
      },
      aiPersonalization: {
        enabled: { type: Boolean, default: true },
        enableCommuteAdvice: { type: Boolean, default: true },
        enableIndoorAdvice: { type: Boolean, default: true },
        storeChatHistory: { type: Boolean, default: true },
      },
    },
    onboardingComplete: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial 2dsphere index for location proximity queries
UserSchema.index({ "location.coordinates": "2dsphere" });

export const User: Model<IUserDocument> =
  (mongoose.models && mongoose.models.User) ||
  mongoose.model<IUserDocument>("User", UserSchema);
