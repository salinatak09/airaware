import "server-only";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CommunityService, HAZARD_METADATA } from "./community.service.ts";

describe("CommunityService & Neighborhood Pollution Engine Suite", () => {
  const service = new CommunityService();

  it("1. getReports: retrieves community reports with proper data distinction and provenance", async () => {
    const reports = await service.getReports();

    assert.ok(Array.isArray(reports), "Reports must be an array");
    assert.ok(reports.length > 0, "Must return at least default fallback reports");

    const first = reports[0];
    assert.ok(first.id);
    assert.ok(first.neighborhood);
    assert.ok(first.hazardType);
    assert.ok(first.hazardLabel);
    assert.ok(first.hazardIcon);
    assert.equal(first.provenance, "citizen_report", "Must be stamped citizen_report");
    assert.equal(first.isOfficialSensor, false, "Must never be marked as official sensor");
    assert.ok(first.disclaimer.toLowerCase().includes("not an official aqi"), "Must contain safety disclaimer");
    assert.equal(first.isApproximate, true, "Must be flagged as approximate location");
  });

  it("2. Privacy Preservation: sanitizes addresses and fuzzes coordinates", () => {
    // Coordinate fuzzing
    const rawLat = 28.5682491;
    const rawLon = 77.2435182;
    const [fuzzedLon, fuzzedLat] = service.fuzzCoordinates(rawLat, rawLon);

    assert.notEqual(rawLat, fuzzedLat, "Latitude must be rounded/fuzzed");
    assert.notEqual(rawLon, fuzzedLon, "Longitude must be rounded/fuzzed");
    // Ensure precision is not down to micrometers
    assert.ok(fuzzedLat.toString().split(".")[1].length <= 3, "Lat decimal precision should be max 3 digits");

    // Address sanitization
    const sanitized1 = service.sanitizeApproximateAddress("Flat 302, Green Valley Apartments, Lajpat Nagar IV", "Lajpat Nagar IV");
    assert.equal(sanitized1.includes("Flat 302"), false, "Must strip flat number");

    const sanitized2 = service.sanitizeApproximateAddress("House #14, Lane 2, Dwarka Sector 12", "Dwarka");
    assert.equal(sanitized2.includes("House #14"), false, "Must strip house number");

    const fallback = service.sanitizeApproximateAddress("", "Rohini");
    assert.equal(fallback, "Near Rohini");
  });

  it("3. Anti-Spam & Abuse: enforces rate limiting and submission cooldowns", () => {
    const testUser = "user_test_spam_" + Date.now();

    // 1st submission allowed
    const check1 = service.checkRateLimit(testUser);
    assert.equal(check1.allowed, true);

    // Immediate 2nd submission should be blocked by cooldown (<30s)
    const check2 = service.checkRateLimit(testUser);
    assert.equal(check2.allowed, false, "Rapid submission must be throttled");
    assert.ok(check2.retryAfterSeconds! > 0);
  });

  it("4. createReport: records report with approximate coordinates and pending moderation", async () => {
    const freshUser = "user_report_author_" + Math.random().toString(36).substring(7);

    const result = await service.createReport({
      userId: freshUser,
      authorName: "Kavita R.",
      city: "New Delhi",
      area: "Mayur Vihar Phase 1",
      landmark: "Near Metro Station Pillar 58",
      rawAddress: "Flat 4B, Pocket 1, Mayur Vihar Phase 1",
      latitude: 28.6052,
      longitude: 77.2941,
      reportType: "garbage_burning",
      description: "Dry leaf and garden waste burning near central park corner causing throat irritation.",
      severity: "severe",
    });

    assert.ok(result.report);
    assert.equal(result.report.neighborhood, "Mayur Vihar Phase 1");
    assert.equal(result.report.hazardType, "garbage_burning");
    assert.equal(result.report.moderationStatus, "pending");
    assert.equal(result.report.isApproximate, true);
    assert.equal(result.report.approximateLocation.includes("Flat 4B"), false, "Must sanitize flat number");
    assert.equal(result.xpAwarded, 25, "Must award 25 XP for community contribution");
  });

  it("5. Moderation Workflow: confirms/upvotes promote to verified; flags mark flagged", async () => {
    const freshUser = "user_mod_" + Math.random().toString(36).substring(7);

    const created = await service.createReport({
      userId: freshUser,
      city: "New Delhi",
      area: "Saket",
      reportType: "construction_dust",
      description: "Uncovered sand piles blowing across pedestrian walkway without water suppression.",
    });

    const reportId = created.report.id;

    // Upvote 1
    const up1 = await service.upvoteReport(reportId, "voter_1");
    assert.equal(up1.upvotes >= 1, true);

    // Upvote 2
    await service.upvoteReport(reportId, "voter_2");

    // Upvote 3 -> should promote to verified
    const up3 = await service.upvoteReport(reportId, "voter_3");
    assert.equal(up3.status, "verified", "3 upvotes must promote status to verified");

    // Flagging test on another report
    const flaggedReport = await service.createReport({
      userId: freshUser + "_flag",
      city: "New Delhi",
      area: "Narela",
      reportType: "industrial_smoke",
      description: "Checking factory chimney emissions during late evening hours.",
    });

    await service.flagReport(flaggedReport.report.id, "spam", "user_f1");
    await service.flagReport(flaggedReport.report.id, "spam", "user_f2");
    const flag3 = await service.flagReport(flaggedReport.report.id, "spam", "user_f3");
    assert.equal(flag3.status, "flagged", "3 flags must mark status as flagged");
  });

  it("6. Community Challenges & Awareness Activities: retrieves and allows participation", async () => {
    const data = await service.getCommunityChallenges();

    assert.ok(Array.isArray(data.challenges), "Challenges must be an array");
    assert.ok(data.challenges.length > 0);
    assert.ok(data.challenges.some((c) => c.category === "anti_burning"));

    assert.ok(Array.isArray(data.awarenessActivities), "Activities must be an array");
    assert.ok(data.awarenessActivities.length > 0);

    // Participate in challenge
    const challengeId = data.challenges[0].id;
    const partResult = await service.participateInChallenge(challengeId, "participant_1");
    assert.equal(partResult.success, true);
    assert.ok(partResult.xpAwarded > 0);

    // Toggle RSVP
    const actId = data.awarenessActivities[0].id;
    const initialAttending = data.awarenessActivities[0].isAttending;
    const rsvpResult = await service.toggleActivityRsvp(actId);
    assert.equal(rsvpResult.isAttending, !initialAttending);
  });
});
