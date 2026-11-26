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

export const HAZARD_METADATA: Record<
  CommunityReportType,
  { label: string; icon: string; defaultSeverity: "low" | "medium" | "high" | "severe" }
> = {
  garbage_burning: { label: "Open Garbage & Waste Burning", icon: "🔥", defaultSeverity: "severe" },
  smoke: { label: "Dense Smoke & Combustion", icon: "💨", defaultSeverity: "high" },
  industrial_smoke: { label: "Industrial & Factory Chimney Smoke", icon: "🏭", defaultSeverity: "severe" },
  construction_dust: { label: "Uncovered Construction Dust & Sand", icon: "🏗️", defaultSeverity: "high" },
  heavy_traffic: { label: "Heavy Diesel Traffic & Gridlock", icon: "🚗", defaultSeverity: "medium" },
  traffic_congestion: { label: "Traffic Congestion & Idling Zone", icon: "🚦", defaultSeverity: "medium" },
  crop_residue: { label: "Crop Residue / Stubble Burning", icon: "🌾", defaultSeverity: "severe" },
  unusual_pollution: { label: "Unusual Chemical Odor or Heavy Smog", icon: "⚠️", defaultSeverity: "high" },
  clean_corridor: { label: "Clean Green Corridor / Safe Route", icon: "🍃", defaultSeverity: "low" },
  other: { label: "Other Local Environmental Hazard", icon: "📍", defaultSeverity: "medium" },
};
