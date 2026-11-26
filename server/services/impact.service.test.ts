import "server-only";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ImpactService, LEVEL_SYSTEM, XP_RULES } from "./impact.service.ts";

describe("ImpactService & Gamification Engine Suite", () => {
  const impactService = new ImpactService();

  it("1. getGamificationOverview: returns structured XP, level, and streak", async () => {
    const data = await impactService.getGamificationOverview();

    assert.ok(data, "Dashboard data must be returned");
    assert.ok(data.totalXp >= 0, "Total XP must be non-negative");
    assert.ok(data.level.current >= 1 && data.level.current <= 8, "Level must be between 1 and 8");
    assert.ok(data.level.title, "Level must have a title");
    assert.ok(data.level.progressPercent >= 0 && data.level.progressPercent <= 100);
    assert.ok(data.streak.currentStreak >= 0, "Streak must be non-negative");
  });

  it("2. Honest Impact Metrics: NEVER fabricates pollution avoided or carbon savings", async () => {
    const data = await impactService.getGamificationOverview();

    assert.ok(data.honestImpact, "Honest impact metrics must be present");
    assert.ok(
      data.honestImpact.transparencyNotice.toLowerCase().includes("validated behavioral") ||
      data.honestImpact.transparencyNotice.toLowerCase().includes("do not fabricate"),
      "Must state that impact metrics are behavioral choices and not fabricated grams"
    );
    assert.ok(typeof data.honestImpact.totalActionsCompleted === "number");
    assert.ok(typeof data.honestImpact.daysWithPrecautions === "number");
    assert.ok(typeof data.honestImpact.cleanTransitCommutesLogged === "number");
    assert.ok(typeof data.honestImpact.sanctuaryHabitsMaintained === "number");

    // Strictly ensure no fabricated grams or lung percentage fields exist
    const rawKeys = Object.keys(data.honestImpact);
    assert.equal(rawKeys.includes("gramsAvoided"), false);
    assert.equal(rawKeys.includes("carbonSavedKg"), false);
    assert.equal(rawKeys.includes("lungCapacityGained"), false);
  });

  it("3. Level Progression: accurately calculates tier transitions", () => {
    const lvl1 = impactService.calculateLevelDetails(50);
    assert.equal(lvl1.current, 1);
    assert.equal(lvl1.title, "Air Novice");
    assert.equal(lvl1.progressPercent, 50);

    const lvl2 = impactService.calculateLevelDetails(150);
    assert.equal(lvl2.current, 2);
    assert.equal(lvl2.title, "Air Aware");

    const lvl4 = impactService.calculateLevelDetails(500);
    assert.equal(lvl4.current, 4);
    assert.equal(lvl4.title, "Sanctuary Guardian");
  });

  it("4. Badges & Challenges: includes all required badges and household challenges", async () => {
    const data = await impactService.getGamificationOverview();

    const badgeNames = data.badges.map((b) => b.name);
    assert.ok(badgeNames.includes("First Breath"), "Must include First Breath badge");
    assert.ok(badgeNames.includes("AQI Explorer"), "Must include AQI Explorer badge");
    assert.ok(badgeNames.includes("Indoor Guardian"), "Must include Indoor Guardian badge");
    assert.ok(badgeNames.includes("7-Day Streak"), "Must include 7-Day Streak badge");
    assert.ok(badgeNames.includes("Pollution Protector"), "Must include Pollution Protector badge");
    assert.ok(badgeNames.includes("Family Champion"), "Must include Family Champion badge");

    // Household challenges
    assert.ok(data.householdChallenges.length >= 2, "Must include household challenges");
    assert.ok(data.householdChallenges.some((c) => c.title.includes("Zero Agarbatti")));
  });

  it("5. XP Logging & Anti-Exploit Guard: awards XP and blocks duplicate rewards on the same day", async () => {
    const testMissionId = "m_daily_commute_test";

    // 1st attempt: should succeed and award XP
    const firstResult = await impactService.logUserAction(
      "test_user_gamification",
      "mask_worn",
      testMissionId,
      "N95 Commute Test"
    );

    assert.equal(firstResult.alreadyCompleted, false);
    assert.equal(firstResult.xpEarned, XP_RULES.CLEAN_COMMUTE);

    // 2nd attempt on same day: anti-exploit guard must reject duplicate XP
    const secondResult = await impactService.logUserAction(
      "test_user_gamification",
      "mask_worn",
      testMissionId,
      "N95 Commute Test"
    );

    assert.equal(secondResult.alreadyCompleted, true, "Must flag already completed");
    assert.equal(secondResult.xpEarned, 0, "Must award 0 duplicate XP");
  });
});
