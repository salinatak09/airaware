import "server-only";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GeminiService } from "./gemini.ts";
import type { AiContextInput } from "./types.ts";

describe("GeminiService & Safety Guardrails Test Suite", () => {
  const gemini = new GeminiService();

  const mockSevereContext: AiContextInput = {
    currentAqi: 340,
    category: "Severe",
    pollutants: { pm25: 220, pm10: 380, no2: 65 },
    dataSource: "CPCB Ground Stations",
    dataTimestamp: new Date().toISOString(),
    userLocation: { city: "Delhi", area: "Anand Vihar" },
    householdProfile: {
      householdSize: { adults: 2, children: 1, elderly: 1, total: 4 },
      sensitivePreferences: {
        hasRespiratorySensitivity: true,
        hasCardiovascularSensitivity: true,
        isPregnant: false,
        hasInfant: false,
      },
    },
    commute: {
      commuteType: "metro",
      durationMinutes: 45,
      travelWindow: "morning_rush",
    },
    lifestyle: {
      workSchedule: "fixed_office",
      exerciseHabits: "outdoor_morning",
      outdoorActivityFrequency: "daily",
    },
    homeEnvironment: {
      homeType: "apartment",
      floorLevel: 4,
      ventilationType: "natural",
      cookingFuel: "lpg",
      hasBalconyOrGarden: true,
      purifierAvailability: {
        hasPurifier: false,
        purifierCount: 0,
        roomsWithPurifiers: [],
        purifierType: "none",
      },
    },
    budget: {
      budgetRange: "minimal",
      improvementPriorities: ["sealing", "mopping"],
    },
  };

  it("1. Personalized Daily Plan: Enforces severe risk level and mandatory masks", async () => {
    const plan = await gemini.generateDailyPlan(mockSevereContext);

    assert.ok(plan.summary, "Plan must have a summary");
    assert.equal(plan.riskLevel, "severe", "Risk level must reflect severe ambient AQI");
    assert.ok(plan.timeWindows.length >= 3, "Must produce multiple time windows");
    assert.ok(plan.dailyMissions.length >= 3, "Must produce daily missions");
    assert.ok(plan.disclaimer.includes("AirAware safety advisories"), "Must contain non-diagnostic disclaimer");

    // Outdoor activities should be restricted under severe AQI
    const outdoorWindow = plan.timeWindows.find((tw) =>
      tw.activity.toLowerCase().includes("outdoor")
    );
    if (outdoorWindow) {
      assert.equal(outdoorWindow.safetyLevel, "avoid", "Outdoor activities must be marked avoid in severe AQI");
    }
  });

  it("2. Indoor Advice: Respects minimal budget and forbids window ventilation during severe AQI", async () => {
    const indoor = await gemini.generateIndoorAdvice(mockSevereContext);

    assert.ok(indoor.airQualityAssessment, "Must contain air quality assessment");
    assert.equal(indoor.ventilationWindow.recommended, false, "Ventilation must be prohibited during severe pollution");
    assert.ok(indoor.budgetFriendlyInterventions.length >= 2, "Must offer low/free budget solutions");

    // Minimal budget should emphasize free solutions like wet mopping
    const hasFreeTip = indoor.budgetFriendlyInterventions.some((tip) => tip.cost === "free");
    assert.ok(hasFreeTip, "Must provide zero-cost interventions for minimal budget households");
    assert.ok(indoor.disclaimer.length > 0, "Must include disclaimer");
  });

  it("3. Commute Advice: Mandates N95 respirator and internal AC recirculation", async () => {
    const commute = await gemini.generateCommuteAdvice(mockSevereContext);

    assert.ok(commute.riskAssessment, "Must assess commute risk");
    assert.equal(commute.maskGuidance.required, true, "Mask must be mandatory in severe pollution");
    assert.ok(
      commute.maskGuidance.maskType.includes("N95") || commute.maskGuidance.maskType.includes("FFP2"),
      "Must mandate high-efficiency respirator"
    );
    assert.ok(commute.exposureMitigationTips.length >= 2, "Must provide mitigation tips");
  });

  it("4. Conversational AI Assistant: Provides protective guidance and sanitizes false safety claims", async () => {
    const reply = await gemini.generateChatReply(
      "Can my 5-year-old child play football outdoors today?",
      mockSevereContext
    );

    assert.ok(reply.reply, "Must produce a text reply");
    assert.ok(
      reply.reply.toLowerCase().includes("avoid") ||
        reply.reply.toLowerCase().includes("suspend") ||
        reply.reply.toLowerCase().includes("indoor"),
      "Must advise against outdoor child sports in severe AQI"
    );
    assert.ok(!reply.reply.includes("100% safe"), "Must never promise 100% safety");
    assert.ok(reply.disclaimer?.includes("non-diagnostic"), "Must attach non-diagnostic disclaimer");
  });

  it("5. AQI Explanation: Explains PM2.5 in simple terms with pediatric and elderly impacts", async () => {
    const explanation = await gemini.explainAqi(mockSevereContext);

    assert.ok(explanation.headline, "Must have headline");
    assert.ok(explanation.dominantPollutantExplanation.includes("PM2.5"), "Must detail PM2.5 particulate penetration");
    assert.ok(explanation.whatThisMeansForChildren.length > 0, "Must describe pediatric lung development vulnerability");
    assert.ok(explanation.whatThisMeansForElderly.length > 0, "Must describe elderly vulnerability");
    assert.ok(explanation.simpleAnalogy.length > 0, "Must provide relatable analogy");
  });

  it("6. Daily Summary: Supplies structured executive briefing for the dashboard", async () => {
    const summary = await gemini.generateDailySummary(mockSevereContext);

    assert.ok(summary.greeting, "Must include greeting");
    assert.ok(summary.headline, "Must include headline");
    assert.ok(summary.topAction.toLowerCase().includes("mask"), "Top action must prioritize mask in severe air");
    assert.ok(summary.missionsXP > 0, "Must reward XP for daily actions");
  });
});
