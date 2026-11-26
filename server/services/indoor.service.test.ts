import "server-only";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { IndoorService } from "./indoor.service.ts";

describe("IndoorService & Indoor Air Quality Engine Suite", () => {
  const indoorService = new IndoorService();

  it("1. getIndoorOverview: clearly distinguishes modeled estimates from hardware measurements", async () => {
    const overview = await indoorService.getIndoorOverview();

    assert.ok(overview, "Overview must be returned");
    assert.equal(overview.hasHardwareSensor, false, "Default hasHardwareSensor must be false");
    assert.equal(overview.statusType, "modeled_estimate", "Status type must be labeled modeled_estimate");
    assert.ok(
      overview.measurementNotice.toLowerCase().includes("no paired hardware") ||
      overview.measurementNotice.toLowerCase().includes("modeled"),
      "Must state that indoor values are modeled estimates without an actual hardware sensor"
    );
    assert.ok(overview.sanctuaryScore >= 0 && overview.sanctuaryScore <= 100);
    assert.ok(overview.estimatedIndoorPm25.min > 0);
  });

  it("2. Plant Myth Buster: scientifically refutes that houseplants meaningfully filter room air", async () => {
    const overview = await indoorService.getIndoorOverview();

    assert.ok(overview.plantMythBuster, "Must provide plant myth buster section");
    assert.ok(
      overview.plantMythBuster.scientificTruth.toLowerCase().includes("not meaningfully") ||
      overview.plantMythBuster.scientificTruth.toLowerCase().includes("overwhelm"),
      "Must clarify that houseplants do not meaningfully filter room air"
    );
    assert.ok(
      overview.plantMythBuster.nasaStudyClarification.includes("1989 NASA") ||
      overview.plantMythBuster.nasaStudyClarification.includes("sealed"),
      "Must explain the hermetically sealed nature of the 1989 NASA experiment"
    );
    assert.ok(
      overview.plantMythBuster.verdict.toLowerCase().includes("per square meter") ||
      overview.plantMythBuster.verdict.toLowerCase().includes("rely on"),
      "Must give clear realistic verdict"
    );
  });

  it("3. Window Ventilation Guidance: aligns with outdoor AQI and diurnal thermal window", async () => {
    const overview = await indoorService.getIndoorOverview();

    assert.ok(overview.ventilationStatus, "Ventilation status must be present");
    assert.ok(["keep_closed", "ventilate_recommended", "caution"].includes(overview.ventilationStatus.state));
    assert.ok(overview.ventilationStatus.bestDiurnalWindow.includes("1:00 PM"));
  });

  it("4. Checklist Toggle: allows checking/unchecking indoor healthy habits", async () => {
    const checklistBefore = (await indoorService.getIndoorOverview()).checklist;
    const testItem = checklistBefore[0];

    const updatedChecklist = await indoorService.toggleChecklistItem(testItem.id, true);
    const toggled = updatedChecklist.find((i) => i.id === testItem.id);
    assert.equal(toggled?.completed, true, "Item should now be completed");

    // Toggle back
    const revertedChecklist = await indoorService.toggleChecklistItem(testItem.id, false);
    const reverted = revertedChecklist.find((i) => i.id === testItem.id);
    assert.equal(reverted?.completed, false, "Item should revert to uncompleted");
  });

  it("5. Home Health Missions: awards XP and enforces anti-exploit guard against duplicate XP", async () => {
    const overview = await indoorService.getIndoorOverview();
    const testMission = overview.homeMissions[0];

    // First completion
    const firstAttempt = await indoorService.completeHomeMission("test_user_indoor", testMission.id);
    assert.equal(firstAttempt.alreadyCompleted, false);
    assert.equal(firstAttempt.xpEarned, testMission.xpReward);

    // Duplicate attempt
    const secondAttempt = await indoorService.completeHomeMission("test_user_indoor", testMission.id);
    assert.equal(secondAttempt.alreadyCompleted, true, "Must flag already completed");
    assert.equal(secondAttempt.xpEarned, 0, "Must award 0 duplicate XP");
  });

  it("6. Comprehensive Guidance: provides cleaner-air room, cooking, cleaning, CADR & low-cost solutions", async () => {
    const overview = await indoorService.getIndoorOverview();

    // Cleaner air room
    assert.ok(overview.cleanerRoomGuidance.steps.length >= 3);

    // Cooking safety
    assert.ok(overview.cookingSafety.exhaustTiming.includes("exhaust"));
    assert.ok(overview.cookingSafety.panLidTechnique.toLowerCase().includes("lid"));

    // Cleaning: wet mopping vs dry sweeping
    assert.ok(overview.cleaningAdvice.wetMoppingVsSweeping.recommendation.toLowerCase().includes("wet mop"));
    assert.ok(overview.cleaningAdvice.wetMoppingVsSweeping.whySweepingIsHarmful.toLowerCase().includes("resuspend") ||
      overview.cleaningAdvice.wetMoppingVsSweeping.whySweepingIsHarmful.toLowerCase().includes("blower"));

    // Purifier & CADR
    assert.ok(overview.purifierGuidance.cadrRecommendation.includes("CADR"));
    assert.ok(overview.purifierGuidance.ozoneWarning.toLowerCase().includes("ozone"));
    assert.ok(overview.purifierGuidance.diyOption.name.includes("Corsi-Rosenthal") || overview.purifierGuidance.diyOption.name.includes("Fan"));

    // Low cost tiers
    assert.ok(overview.lowCostSolutions.some((s) => s.tier === "free"));
    assert.ok(overview.lowCostSolutions.some((s) => s.tier === "under_500"));
    assert.ok(overview.lowCostSolutions.some((s) => s.tier === "under_1500"));
  });
});
