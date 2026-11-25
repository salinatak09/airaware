import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IHouseholdSize {
  adults: number;
  children: number;
  elderly: number;
  total: number;
}

export interface ISensitiveGroupPreferences {
  hasRespiratorySensitivity: boolean;
  hasCardiovascularSensitivity: boolean;
  isPregnant: boolean;
  hasInfant: boolean;
  notes?: string;
}

export interface ILifestylePreferences {
  workSchedule: "fixed_office" | "hybrid" | "work_from_home" | "outdoor_work" | "student" | "retired";
  exerciseHabits: "outdoor_morning" | "outdoor_evening" | "indoor_gym" | "none" | "intermittent";
  outdoorActivityFrequency: "daily" | "weekends_only" | "occasional" | "rare";
}

export interface ICommutePreferences {
  commuteType: "car" | "metro" | "bus" | "two_wheeler" | "walking" | "bicycle" | "mixed";
  durationMinutes: number;
  travelWindow: "early_morning" | "morning_rush" | "midday" | "evening_rush" | "night";
}

export interface IHomeEnvironment {
  homeType: "apartment" | "independent_house" | "villa" | "other";
  floorLevel: number;
  ventilationType: "natural" | "central_ac" | "split_ac" | "mixed";
  cookingFuel: "lpg" | "induction_electric" | "piped_gas" | "biomass";
  hasBalconyOrGarden: boolean;
}

export interface IPurifierAvailability {
  hasPurifier: boolean;
  purifierCount: number;
  roomsWithPurifiers: string[];
  purifierType: "hepa" | "carbon_hepa" | "diy" | "none";
  lastFilterChangeDate?: Date;
}

export interface IBudgetPreferences {
  budgetRange: "minimal" | "moderate" | "comprehensive";
  improvementPriorities: string[];
}

export interface IHouseholdProfile {
  _id?: string;
  userId: Types.ObjectId | string;
  householdSize: IHouseholdSize;
  sensitiveGroupPreferences: ISensitiveGroupPreferences;
  lifestyle: ILifestylePreferences;
  commute: ICommutePreferences;
  homeEnvironment: IHomeEnvironment;
  purifierAvailability: IPurifierAvailability;
  budgetPreferences: IBudgetPreferences;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IHouseholdProfileDocument extends Document, Omit<IHouseholdProfile, "_id"> {}

const HouseholdProfileSchema = new Schema<IHouseholdProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    householdSize: {
      adults: { type: Number, default: 2, min: 1 },
      children: { type: Number, default: 0, min: 0 },
      elderly: { type: Number, default: 0, min: 0 },
      total: { type: Number, default: 2, min: 1 },
    },
    // Non-diagnostic, generic sensitivity preferences to safeguard family without clinical history
    sensitiveGroupPreferences: {
      hasRespiratorySensitivity: { type: Boolean, default: false },
      hasCardiovascularSensitivity: { type: Boolean, default: false },
      isPregnant: { type: Boolean, default: false },
      hasInfant: { type: Boolean, default: false },
      notes: { type: String, maxlength: 200, trim: true },
    },
    lifestyle: {
      workSchedule: {
        type: String,
        enum: ["fixed_office", "hybrid", "work_from_home", "outdoor_work", "student", "retired"],
        default: "hybrid",
      },
      exerciseHabits: {
        type: String,
        enum: ["outdoor_morning", "outdoor_evening", "indoor_gym", "none", "intermittent"],
        default: "intermittent",
      },
      outdoorActivityFrequency: {
        type: String,
        enum: ["daily", "weekends_only", "occasional", "rare"],
        default: "occasional",
      },
    },
    commute: {
      commuteType: {
        type: String,
        enum: ["car", "metro", "bus", "two_wheeler", "walking", "bicycle", "mixed"],
        default: "metro",
      },
      durationMinutes: { type: Number, default: 30, min: 0, max: 240 },
      travelWindow: {
        type: String,
        enum: ["early_morning", "morning_rush", "midday", "evening_rush", "night"],
        default: "morning_rush",
      },
    },
    homeEnvironment: {
      homeType: {
        type: String,
        enum: ["apartment", "independent_house", "villa", "other"],
        default: "apartment",
      },
      floorLevel: { type: Number, default: 2 },
      ventilationType: {
        type: String,
        enum: ["natural", "central_ac", "split_ac", "mixed"],
        default: "mixed",
      },
      cookingFuel: {
        type: String,
        enum: ["lpg", "induction_electric", "piped_gas", "biomass"],
        default: "piped_gas",
      },
      hasBalconyOrGarden: { type: Boolean, default: false },
    },
    purifierAvailability: {
      hasPurifier: { type: Boolean, default: false },
      purifierCount: { type: Number, default: 0, min: 0 },
      roomsWithPurifiers: {
        type: [String],
        default: [],
      },
      purifierType: {
        type: String,
        enum: ["hepa", "carbon_hepa", "diy", "none"],
        default: "none",
      },
      lastFilterChangeDate: { type: Date },
    },
    budgetPreferences: {
      budgetRange: {
        type: String,
        enum: ["minimal", "moderate", "comprehensive"],
        default: "moderate",
      },
      improvementPriorities: {
        type: [String],
        default: ["air_purifier", "plants", "weather_stripping"],
      },
    },
  },
  {
    timestamps: true,
  }
);

export const HouseholdProfile: Model<IHouseholdProfileDocument> =
  (mongoose.models && mongoose.models.HouseholdProfile) ||
  mongoose.model<IHouseholdProfileDocument>("HouseholdProfile", HouseholdProfileSchema);
