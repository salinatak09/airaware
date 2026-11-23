/**
 * AirAware - Color Tokens & AQI Severity Palette
 *
 * Strict Rule: AQI colors MUST match severity levels.
 * Green is exclusively reserved for Good (0-50). Dangerous levels are orange, red, purple, maroon.
 */

export interface AqiTheme {
  category: "good" | "moderate" | "sensitive" | "unhealthy" | "veryUnhealthy" | "hazardous";
  label: string;
  range: string;
  colorHex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeClass: string;
  pillColor: string;
  description: string;
  actionGuidance: string;
}

export function getAqiTheme(aqi: number): AqiTheme {
  if (aqi <= 50) {
    return {
      category: "good",
      label: "Good",
      range: "0 - 50",
      colorHex: "#78D6B0",
      bgClass: "bg-aqi-good-bg",
      textClass: "text-aqi-good-text",
      borderClass: "border-aqi-good-border",
      badgeClass: "bg-[#E0F5EB] text-[#175C48] border-[#C1EBD7]",
      pillColor: "#78D6B0",
      description: "Air quality is ideal. Perfect conditions for outdoor play and deep breathing.",
      actionGuidance: "Enjoy fresh air! Great time to ventilate your home.",
    };
  }

  if (aqi <= 100) {
    return {
      category: "moderate",
      label: "Moderate",
      range: "51 - 100",
      colorHex: "#FFE58A",
      bgClass: "bg-aqi-moderate-bg",
      textClass: "text-aqi-moderate-text",
      borderClass: "border-aqi-moderate-border",
      badgeClass: "bg-[#FFFBEA] text-[#854D0E] border-[#FFF4C2]",
      pillColor: "#FFE58A",
      description: "Air quality is acceptable. Exceptionally sensitive people may feel mild irritation.",
      actionGuidance: "Safe for most. Sensitive family members should monitor symptoms.",
    };
  }

  if (aqi <= 150) {
    return {
      category: "sensitive",
      label: "Unhealthy for Sensitive Groups",
      range: "101 - 150",
      colorHex: "#FB923C",
      bgClass: "bg-aqi-sensitive-bg",
      textClass: "text-aqi-sensitive-text",
      borderClass: "border-aqi-sensitive-border",
      badgeClass: "bg-[#FFF7ED] text-[#9A3412] border-[#FFEDD5]",
      pillColor: "#FB923C",
      description: "Members of sensitive groups may experience health effects. General public less affected.",
      actionGuidance: "Children and elderly should reduce prolonged heavy exertion outdoors.",
    };
  }

  if (aqi <= 200) {
    return {
      category: "unhealthy",
      label: "Unhealthy",
      range: "151 - 200",
      colorHex: "#EF4444",
      bgClass: "bg-aqi-unhealthy-bg",
      textClass: "text-aqi-unhealthy-text",
      borderClass: "border-aqi-unhealthy-border",
      badgeClass: "bg-[#FEF2F2] text-[#991B1B] border-[#FEE2E2]",
      pillColor: "#EF4444",
      description: "Everyone may begin to experience health effects. Sensitive groups experience more serious effects.",
      actionGuidance: "Wear N95/FFP2 masks outdoors. Keep home windows closed and run purifiers.",
    };
  }

  if (aqi <= 300) {
    return {
      category: "veryUnhealthy",
      label: "Very Unhealthy",
      range: "201 - 300",
      colorHex: "#A855F7",
      bgClass: "bg-aqi-veryUnhealthy-bg",
      textClass: "text-aqi-veryUnhealthy-text",
      borderClass: "border-aqi-veryUnhealthy-border",
      badgeClass: "bg-[#FAF5FF] text-[#6B21A8] border-[#F3E8FF]",
      pillColor: "#A855F7",
      description: "Health alert: The risk of health effects is increased for everyone.",
      actionGuidance: "Avoid all outdoor physical activities. Run HEPA air purifiers at high speed.",
    };
  }

  return {
    category: "hazardous",
    label: "Hazardous",
    range: "301+",
    colorHex: "#881337",
    bgClass: "bg-aqi-hazardous-bg",
    textClass: "text-aqi-hazardous-text",
    borderClass: "border-aqi-hazardous-border",
    badgeClass: "bg-[#FFF1F2] text-[#4C0519] border-[#FFE4E6]",
    pillColor: "#881337",
    description: "Health warning of emergency conditions. The entire population is likely to be affected.",
    actionGuidance: "Stay indoors. Seal gaps, use air filtration, and avoid all outdoor exposure.",
  };
}

export const brandTokens = {
  mint: "#78D6B0",
  forest: "#175C48",
  background: "#F7FAF7",
  cream: "#FFF8E8",
  sky: "#BFE8FF",
  lavender: "#DCD3FF",
  peach: "#FFD6BD",
  yellow: "#FFE58A",
} as const;
