import "server-only";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PlanService } from "./plan.service.ts";
import { DailyPlan, GamificationProfile } from "../../models/index.ts";

describe("PlanService & My Day Feature Test Suite", () => {
  const planService = new PlanService();

  it("1. generatePlan: produces structured timeline recommendations with whyItMatters & priorities", async () => {
    // Generate plan for test user
    const testUserId = "507f191e810c19729de860ea";
    const testDate = "2026-11-26";

    const plan = await planService.generatePlan({
      userId: testUserId,
      date: testDate,
      currentAqi: 240,
      city: "New Delhi",
      forceRegenerate: true,
    });

    assert.ok(plan, "Plan document must be created");
    assert.equal(plan.date, testDate);
    assert.ok(plan.missions.length >= 4, "Must generate at least 4 timeline missions");

    const firstMission = plan.missions[0];
    assert.ok(firstMission.time, "Mission must have scheduled time");
    assert.ok(firstMission.title, "Mission must have a title");
    assert.ok(firstMission.description, "Mission must have description");
    assert.ok(firstMission.whyItMatters, "Mission must explain why it matters");
    assert.ok(firstMission.priority, "Mission must have priority rating");
    assert.ok(firstMission.estimatedDuration, "Mission must have estimated duration");
    assert.ok(firstMission.xpReward > 0, "Mission must offer XP reward");
    assert.equal(firstMission.completed, false, "Mission starts uncompleted");

    // Check safest window and peak smog window
    assert.ok(plan.aqiContext.safestWindow?.start, "Must specify safest outdoor window");
    assert.ok(plan.aqiContext.peakSmogWindow?.start, "Must specify peak smog window");
  });

  it("2. updateMission: completes mission and awards XP", async () => {
    const testUserId = "507f191e810c19729de860ea";
    const testDate = "2026-11-26";

    const plan = await planService.getTodayPlan(testUserId);
    const mission = plan.missions[0];

    const result = await planService.updateMission(
      plan._id.toString(),
      mission.missionId,
      testUserId,
      { action: "complete" }
    );

    assert.equal(result.alreadyCompleted, false);
    assert.equal(result.mission.completed, true);
    assert.equal(result.xpEarned, mission.xpReward);
  });

  it("3. Anti-Exploit Guard: mission completion CANNOT award XP multiple times", async () => {
    const testUserId = "507f191e810c19729de860ea";
    const plan = await planService.getTodayPlan(testUserId);
    const mission = plan.missions[0];

    // Second completion attempt
    const secondAttempt = await planService.updateMission(
      plan._id.toString(),
      mission.missionId,
      testUserId,
      { action: "complete" }
    );

    assert.equal(secondAttempt.alreadyCompleted, true, "Must flag already completed");
    assert.equal(secondAttempt.xpEarned, 0, "Must award 0 duplicate XP");
  });

  it("4. updateMission: allows skipping and rescheduling", async () => {
    const testUserId = "507f191e810c19729de860ea";
    const plan = await planService.getTodayPlan(testUserId);
    const secondMission = plan.missions[1];

    // Reschedule
    const resched = await planService.updateMission(
      plan._id.toString(),
      secondMission.missionId,
      testUserId,
      { action: "reschedule", rescheduledTime: "03:15 PM" }
    );
    assert.equal(resched.mission.time, "03:15 PM");
    assert.equal(resched.mission.rescheduledTime, "03:15 PM");

    // Skip
    const skipped = await planService.updateMission(
      plan._id.toString(),
      secondMission.missionId,
      testUserId,
      { action: "skip" }
    );
    assert.equal(skipped.mission.skipped, true);
  });
});
