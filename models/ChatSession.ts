import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IChatMessage {
  messageId: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  aqiContext?: {
    aqi: number;
    category: string;
    city: string;
  };
  safetyAdvisories?: string[];
}

export interface IChatSessionMetadata {
  initialAqi?: number;
  city: string;
  clientPlatform: string;
  messageCount: number;
}

export interface IChatSession {
  _id?: string;
  userId: Types.ObjectId | string;
  title: string;
  persona: "daily_planner" | "pediatric_advisor" | "fitness_coach" | "elderly_care";
  messages: IChatMessage[];
  sessionMetadata: IChatSessionMetadata;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatSessionDocument extends Document, Omit<IChatSession, "_id"> {}

const ChatSessionSchema = new Schema<IChatSessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "Aero Air Quality Consultation",
      trim: true,
      maxlength: 120,
    },
    persona: {
      type: String,
      enum: ["daily_planner", "pediatric_advisor", "fitness_coach", "elderly_care"],
      default: "daily_planner",
    },
    messages: [
      {
        messageId: { type: String, required: true },
        role: {
          type: String,
          enum: ["user", "assistant", "system"],
          required: true,
        },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        aqiContext: {
          aqi: { type: Number },
          category: { type: String },
          city: { type: String },
        },
        safetyAdvisories: { type: [String], default: [] },
      },
    ],
    sessionMetadata: {
      initialAqi: { type: Number },
      city: { type: String, default: "New Delhi" },
      clientPlatform: { type: String, default: "web" },
      messageCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

ChatSessionSchema.index({ userId: 1, updatedAt: -1 });

export const ChatSession: Model<IChatSessionDocument> =
  (mongoose.models && mongoose.models.ChatSession) ||
  mongoose.model<IChatSessionDocument>("ChatSession", ChatSessionSchema);
