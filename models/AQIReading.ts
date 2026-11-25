import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPollutantMeasurements {
  pm25: number; // µg/m³
  pm10: number; // µg/m³
  no2?: number; // µg/m³
  so2?: number; // µg/m³
  co?: number;  // mg/m³
  o3?: number;  // µg/m³
}

export interface IAQIValues {
  indianAqi: number;
  indianCategory: "good" | "satisfactory" | "moderate" | "poor" | "very_poor" | "severe";
  usAqi?: number;
  usCategory?: string;
  dominantPollutant?: string;
}

export interface IAQIWeatherContext {
  temperature?: number; // °C
  humidity?: number;    // %
  windSpeed?: number;   // km/h
  windDirection?: number;
  dispersionIndex?: "poor" | "moderate" | "good";
}

export interface IAQIReading {
  _id?: string;
  location: {
    city: string;
    area?: string;
    state?: string;
    country: string;
    stationName?: string;
  };
  coordinates: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  pollutantMeasurements: IPollutantMeasurements;
  aqi: IAQIValues;
  aqiStandard: string;
  source: string;
  sourceType: "modeled" | "ground_station" | "satellite" | "hybrid";
  recordedAt: Date;
  weather?: IAQIWeatherContext;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAQIReadingDocument extends Document, Omit<IAQIReading, "_id"> {}

const AQIReadingSchema = new Schema<IAQIReadingDocument>(
  {
    location: {
      city: { type: String, required: true, trim: true, index: true },
      area: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, default: "India", trim: true },
      stationName: { type: String, trim: true },
    },
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
    pollutantMeasurements: {
      pm25: { type: Number, required: true, min: 0 },
      pm10: { type: Number, required: true, min: 0 },
      no2: { type: Number, min: 0 },
      so2: { type: Number, min: 0 },
      co: { type: Number, min: 0 },
      o3: { type: Number, min: 0 },
    },
    aqi: {
      indianAqi: { type: Number, required: true, min: 0 },
      indianCategory: {
        type: String,
        enum: ["good", "satisfactory", "moderate", "poor", "very_poor", "severe"],
        required: true,
      },
      usAqi: { type: Number, min: 0 },
      usCategory: { type: String },
      dominantPollutant: { type: String, default: "pm25" },
    },
    aqiStandard: {
      type: String,
      default: "CPCB_NAQI",
      trim: true,
    },
    source: {
      type: String,
      default: "Open-Meteo",
      trim: true,
    },
    sourceType: {
      type: String,
      enum: ["modeled", "ground_station", "satellite", "hybrid"],
      default: "modeled",
    },
    recordedAt: {
      type: Date,
      required: true,
      index: true,
    },
    weather: {
      temperature: { type: Number },
      humidity: { type: Number },
      windSpeed: { type: Number },
      windDirection: { type: Number },
      dispersionIndex: {
        type: String,
        enum: ["poor", "moderate", "good"],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes:
// 1. Geospatial 2dsphere index for radius and proximity queries
AQIReadingSchema.index({ coordinates: "2dsphere" });

// 2. Querying recent readings for a city
AQIReadingSchema.index({ "location.city": 1, recordedAt: -1 });

// 3. Chronological sorting
AQIReadingSchema.index({ recordedAt: -1 });

export const AQIReading: Model<IAQIReadingDocument> =
  (mongoose.models && mongoose.models.AQIReading) ||
  mongoose.model<IAQIReadingDocument>("AQIReading", AQIReadingSchema);
