import test from "node:test";
import assert from "node:assert/strict";
import { AirQualitySafetyEngine } from "./safety-engine.ts";

test("AirQualitySafetyEngine Test Suite", async (t) => {
  const engine = new AirQualitySafetyEngine();

  await t.test("1. Good AQI: provides positive outdoor guidance with low severity", () => {
    const result = engine.evaluateSafety({
      aqi: 35,
      pollutants: {
        pm25: 15,
        pm10: 30,
        no2: 20,
        so2: 10,
        co: 0.4,
        o3: 35,
      },
      recordedAt: new Date().toISOString(),
    });

    assert.equal(result.category, "good");
    assert.equal(result.severity, "low");
    assert.equal(result.restrictions.maskRequired, false);
    assert.equal(result.restrictions.outdoorSportsRestricted, false);
    assert.equal(result.restrictions.windowVentilationAllowed, true);
    assert.equal(result.affectedGroups.generalPopulation, false);
    assert.ok(result.recommendations.outdoorActivity.some((r) => r.toLowerCase().includes("ideal") || r.toLowerCase().includes("enjoy")));
    assert.equal(result.confidence, "high");
    assert.equal(result.dataFreshness.isStale, false);
  });

  await t.test("2. Moderate AQI: advises sensitive groups and limits ventilation during peak hours", () => {
    const result = engine.evaluateSafety({
      aqi: 145,
      pollutants: {
        pm25: 65,
        pm10: 120,
        no2: 45,
        so2: 15,
        co: 0.8,
        o3: 50,
      },
      recordedAt: new Date().toISOString(),
    });

    assert.equal(result.category, "moderate");
    assert.equal(result.severity, "moderate");
    assert.equal(result.restrictions.windowVentilationAllowed, true); // Permitted during afternoon window
    assert.equal(result.restrictions.outdoorSportsRestricted, false);
    assert.equal(result.restrictions.maskRequired, false); // Not mandatory for general public at 145 without sensitivity
    assert.ok(result.recommendations.indoorEnvironment.length > 0);
  });

  await t.test("3. Poor AQI: mandates N95 masks, restricts outdoor sports, and seals windows", () => {
    const result = engine.evaluateSafety({
      aqi: 240,
      pollutants: {
        pm25: 110,
        pm10: 220,
        no2: 60,
        so2: 25,
        co: 1.2,
        o3: 40,
      },
      recordedAt: new Date().toISOString(),
    });

    assert.equal(result.category, "poor");
    assert.equal(result.severity, "high");
    assert.equal(result.restrictions.maskRequired, true);
    assert.equal(result.restrictions.maskTypeRecommended, "N95");
    assert.equal(result.restrictions.outdoorSportsRestricted, true);
    assert.equal(result.restrictions.windowVentilationAllowed, false);
    assert.equal(result.affectedGroups.generalPopulation, true);
    assert.equal(result.affectedGroups.respiratorySensitive, true);
    assert.ok(result.warnings.some((w) => w.code === "POOR_AIR_ADVISORY"));
  });

  await t.test("4. Very Poor AQI: flags severe respiratory risk and halts outdoor school activities", () => {
    const result = engine.evaluateSafety({
      aqi: 360,
      pollutants: {
        pm25: 220,
        pm10: 380,
        no2: 85,
        so2: 35,
        co: 1.8,
        o3: 60,
      },
      recordedAt: new Date().toISOString(),
    });

    assert.equal(result.category, "very_poor");
    assert.equal(result.severity, "severe");
    assert.equal(result.restrictions.maskRequired, true);
    assert.equal(result.restrictions.outdoorSportsRestricted, true);
    assert.equal(result.restrictions.windowVentilationAllowed, false);
    assert.equal(result.affectedGroups.generalPopulation, true);
    assert.equal(result.affectedGroups.children, true);
    assert.equal(result.affectedGroups.respiratorySensitive, true);
    assert.ok(result.warnings.some((w) => w.code === "VERY_POOR_SMOG_WARNING"));
    assert.ok(result.recommendations.indoorEnvironment.some((r) => r.toLowerCase().includes("purifier")));
  });

  await t.test("5. Severe AQI: triggers critical emergency warning and complete outdoor restriction", () => {
    const result = engine.evaluateSafety({
      aqi: 450,
      pollutants: {
        pm25: 390,
        pm10: 600,
        no2: 120,
        so2: 50,
        co: 2.8,
        o3: 70,
      },
      recordedAt: new Date().toISOString(),
    });

    assert.equal(result.category, "severe");
    assert.equal(result.severity, "critical");
    assert.equal(result.restrictions.maskRequired, true);
    assert.equal(result.restrictions.maskTypeRecommended, "N95");
    assert.equal(result.restrictions.outdoorSportsRestricted, true);
    assert.equal(result.restrictions.curfewOrSchoolClosureAdvisory, true);
    assert.equal(result.restrictions.windowVentilationAllowed, false);
    assert.ok(result.warnings.some((w) => w.code === "SEVERE_HAZARD_EMERGENCY" && w.level === "emergency"));
    assert.ok(result.restrictions.prohibitedActivities.includes("All non-essential outdoor transit and outdoor recreation"));
    assert.equal(result.affectedGroups.generalPopulation, true);
  });

  await t.test("6. Missing readings: falls back safely with low confidence and missing data warning", () => {
    const result = engine.evaluateSafety({
      recordedAt: undefined,
    });

    assert.ok(result.category);
    assert.equal(result.confidence, "low");
    assert.equal(result.dataFreshness.status, "missing");
    assert.equal(result.dataFreshness.isStale, true);
    assert.ok(result.warnings.some((w) => w.code === "DATA_READINGS_UNAVAILABLE"));
    assert.ok(result.disclaimer.length > 0);
  });

  await t.test("7. Stale readings: flags stale status and adjusts confidence accordingly", () => {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    const result = engine.evaluateSafety({
      aqi: 180,
      recordedAt: fourHoursAgo,
    });

    assert.equal(result.dataFreshness.isStale, true);
    assert.equal(result.dataFreshness.status, "stale");
    assert.ok(result.dataFreshness.ageSeconds >= 4 * 3600 - 10);
    assert.ok(["low", "medium"].includes(result.confidence));
    assert.ok(result.warnings.some((w) => w.code === "STALE_DATA_READING"));
  });

  await t.test("8. Children in household: elevates pediatric risk and issues school guidance", () => {
    const result = engine.evaluateSafety({
      aqi: 160,
      householdProfile: {
        hasChildren: true,
      },
      recordedAt: new Date().toISOString(),
    });

    assert.equal(result.affectedGroups.children, true);
    assert.ok(result.warnings.some((w) => w.code === "CHILD_PROTECTION_WATCH"));
    assert.ok(
      result.recommendations.schoolAndChildren.some((r) =>
        r.toLowerCase().includes("school") || r.toLowerCase().includes("recess") || r.toLowerCase().includes("child")
      )
    );
  });

  await t.test("9. Sensitive household members: triggers stricter thresholds and rescue guidance", () => {
    const result = engine.evaluateSafety({
      aqi: 130, // Moderate level where general public does not need N95
      householdProfile: {
        hasRespiratorySensitivity: true,
        hasCardiovascularSensitivity: true,
        isPregnant: true,
      },
      recordedAt: new Date().toISOString(),
    });

    assert.equal(result.affectedGroups.respiratorySensitive, true);
    assert.equal(result.affectedGroups.cardiovascularSensitive, true);
    assert.equal(result.affectedGroups.pregnancy, true);
    assert.equal(result.restrictions.maskRequired, true); // Stricter mask recommendation due to sensitivity
    assert.ok(result.warnings.some((w) => w.code === "ASTHMA_RESPIRATORY_WATCH"));
    assert.ok(result.recommendations.general.some((r) => r.toLowerCase().includes("inhaler") || r.toLowerCase().includes("medication")));
  });

  await t.test("10. Integrity: always includes disclaimer and explicitly refuses safe guarantees", () => {
    const goodResult = engine.evaluateSafety({ aqi: 15 });
    const severeResult = engine.evaluateSafety({ aqi: 500 });

    assert.ok(goodResult.disclaimer.includes("non-diagnostic"));
    assert.ok(goodResult.disclaimer.includes("No indoor or outdoor environment is guaranteed to be completely free"));
    assert.ok(severeResult.disclaimer.includes("non-diagnostic"));

    const allRecommendations = [
      ...goodResult.recommendations.general,
      ...goodResult.recommendations.outdoorActivity,
      ...goodResult.recommendations.indoorEnvironment,
    ].join(" ").toLowerCase();

    assert.ok(!allRecommendations.includes("100% safe") && !allRecommendations.includes("completely safe"));
  });
});
