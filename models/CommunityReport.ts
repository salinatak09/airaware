import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type CommunityReportType =
  | "garbage_burning"
  | "smoke"
  | "industrial_smoke"
  | "construction_dust"
  | "crop_residue"
  | "heavy_traffic"
  | "traffic_congestion"
  | "unusual_pollution"
  | "clean_corridor"
  | "other";

export type ModerationStatus = "pending" | "approved" | "verified" | "flagged" | "rejected";

export interface ICommunityReport {
  _id?: string;
  userId: Types.ObjectId | string;
  authorName?: string;
  authorRole?: string;
  location: {
    city: string;
    area: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude]
    };
    landmark?: string;
    approximateAddress?: string;
    isApproximate: boolean;
  };
  reportType: CommunityReportType;
  description: string;
  imageReference?: string; // Optional image URL or base64 data
  severity: "low" | "medium" | "high" | "severe";
  moderationStatus: ModerationStatus;
  upvotes: number;
  upvotedBy: Array<Types.ObjectId | string>;
  flagsCount: number;
  flaggedBy: Array<Types.ObjectId | string>;
  observedAt: Date;
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
    authorName: {
      type: String,
      trim: true,
      default: "Local Resident",
    },
    authorRole: {
      type: String,
      trim: true,
      default: "Community Watcher",
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
      approximateAddress: { type: String, trim: true, maxlength: 200 },
      isApproximate: { type: Boolean, default: true },
    },
    reportType: {
      type: String,
      enum: [
        "garbage_burning",
        "smoke",
        "industrial_smoke",
        "construction_dust",
        "crop_residue",
        "heavy_traffic",
        "traffic_congestion",
        "unusual_pollution",
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
      enum: ["pending", "approved", "verified", "flagged", "rejected"],
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
    flagsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    flaggedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    observedAt: {
      type: Date,
      default: Date.now,
    },
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
