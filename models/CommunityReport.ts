import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type CommunityReportType =
  | "garbage_burning"
  | "industrial_smoke"
  | "construction_dust"
  | "crop_residue"
  | "heavy_traffic"
  | "clean_corridor"
  | "other";

export type ModerationStatus = "pending" | "approved" | "rejected" | "flagged";

export interface ICommunityReport {
  _id?: string;
  userId: Types.ObjectId | string;
  location: {
    city: string;
    area: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude]
    };
    landmark?: string;
  };
  reportType: CommunityReportType;
  description: string;
  imageReference?: string;
  severity: "low" | "medium" | "high" | "severe";
  moderationStatus: ModerationStatus;
  upvotes: number;
  upvotedBy: Array<Types.ObjectId | string>;
  reportedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICommunityReportDocument extends Document, Omit<ICommunityReport, "_id"> {}

const CommunityReportSchema = new Schema<ICommunityReportDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    location: {
      city: { type: String, required: true, trim: true, index: true },
      area: { type: String, required: true, trim: true },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
          required: true,
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
        },
      },
      landmark: { type: String, trim: true, maxlength: 150 },
    },
    reportType: {
      type: String,
      enum: [
        "garbage_burning",
        "industrial_smoke",
        "construction_dust",
        "crop_residue",
        "heavy_traffic",
        "clean_corridor",
        "other",
      ],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    imageReference: {
      type: String,
      trim: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "severe"],
      default: "medium",
    },
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "flagged"],
      default: "pending",
      index: true,
    },
    upvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    upvotedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reportedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes:
// 1. Geospatial index for proximity-based citizen incident feeds
CommunityReportSchema.index({ "location.coordinates": "2dsphere" });

// 2. City-wide moderated report query index
CommunityReportSchema.index({ "location.city": 1, moderationStatus: 1, reportedAt: -1 });

export const CommunityReport: Model<ICommunityReportDocument> =
  (mongoose.models && mongoose.models.CommunityReport) ||
  mongoose.model<ICommunityReportDocument>("CommunityReport", CommunityReportSchema);
