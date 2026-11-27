import "server-only";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NotificationService } from "./notification.service.ts";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "../../lib/notification-constants.ts";

describe("NotificationService & AirAware Notification Engine Suite", () => {
  const service = new NotificationService();

  it("1. getNotifications: returns structured notifications, unread count, and data provenance", async () => {
    const result = await service.getNotifications();

    assert.ok(Array.isArray(result.notifications), "Must return notification array");
    assert.ok(result.notifications.length > 0, "Must return notifications");
    assert.ok(typeof result.unreadCount === "number", "Unread count must be a number");
    assert.ok(result.preferences, "Preferences must be returned");

    // Check data provenance & source transparency
    const aqiNotif = result.notifications.find((n) => n.type === "aqi_deterioration" || n.type === "severe_aqi");
    assert.ok(aqiNotif, "Must have an AQI alert");
    assert.ok(aqiNotif.dataSource, "Must specify data source");
    assert.ok(aqiNotif.dataTimestamp, "Must specify data timestamp");
    assert.ok(typeof aqiNotif.currentAqi === "number", "Must specify numerical AQI");
  });

  it("2. markAsRead & markAllAsRead: transitions read state cleanly", async () => {
    const freshUser = "user_test_read_" + Date.now();

    const created = await service.createNotification({
      userId: freshUser,
      type: "mission_reminder",
      title: "Afternoon Air Flush",
      message: "Optimal 15-minute cross ventilation window is open now.",
      actionLabel: "Ventilate Now",
      actionUrl: "/indoor",
    });

    assert.equal(created.isRead, false, "Newly created notification must be unread");

    // Mark single as read
    const readItem = await service.markAsRead(created.id);
    assert.ok(readItem);
    assert.equal(readItem.isRead, true);

    // Create two more unread items
    await service.createNotification({
      userId: freshUser,
      type: "daily_reminder",
      title: "Morning Brief",
      message: "Check today's smog route before school bus departure.",
    });

    await service.createNotification({
      userId: freshUser,
      type: "community_update",
      title: "Local Smoke Notice",
      message: "Biomass smoke reported 400m from your area.",
    });

    // Mark all as read
    const allResult = await service.markAllAsRead(freshUser);
    assert.ok(allResult.success);

    const postAll = await service.getNotifications({ userId: freshUser, unreadOnly: true });
    assert.equal(postAll.unreadCount, 0, "Unread count must be 0 after markAllAsRead");
  });

  it("3. User Preferences: toggles categories and filters inbox accordingly", async () => {
    const testUser = "pref_user_" + Date.now();

    const initial = await service.getUserPreferences(testUser);
    assert.equal(initial.aqi_deterioration, true);
    assert.equal(initial.severe_aqi, true);

    // Disable daily reminders
    await service.updateUserPreferences(testUser, { daily_reminder: false });
    const updated = await service.getUserPreferences(testUser);
    assert.equal(updated.daily_reminder, false);

    // Fetch notifications for this user; daily_reminder notifications must be suppressed
    const inbox = await service.getNotifications({ userId: testUser });
    const hasDailyReminder = inbox.notifications.some((n) => n.type === "daily_reminder");
    assert.equal(hasDailyReminder, false, "Disabled category must be excluded from user inbox");
  });

  it("4. evaluateAqiAlerts: detects severe spikes and generates emergency warnings", async () => {
    const testUser = "severe_user_" + Date.now();

    const alert = await service.evaluateAqiAlerts({
      userId: testUser,
      currentAqi: 420,
      previousAqi: 310,
      locationName: "Anand Vihar, Delhi",
      stationName: "CPCB Continuous Air Monitoring Station",
      timestamp: "11:00 AM",
    });

    assert.ok(alert, "Must generate severe smog alert");
    assert.equal(alert.type, "severe_aqi");
    assert.equal(alert.severity, "critical");
    assert.ok(alert.message.toLowerCase().includes("keep windows sealed") || alert.message.toLowerCase().includes("halt all outdoor"));
    assert.equal(alert.dataSource, "CPCB Continuous Air Monitoring Station");
  });

  it("5. evaluateAqiAlerts: detects AQI deterioration with actionable guidance & anti-spam cooldown", async () => {
    const testUser = "det_user_" + Date.now();

    // Sudden rise from 110 to 175 (+65 points into Poor bracket)
    const alert = await service.evaluateAqiAlerts({
      userId: testUser,
      currentAqi: 175,
      previousAqi: 110,
      locationName: "Rohini",
      stationName: "DPCC Station",
      timestamp: "11:30 AM",
    });

    assert.ok(alert, "Must generate deterioration alert");
    assert.equal(alert.type, "aqi_deterioration");
    assert.equal(alert.severity, "warning");
    assert.ok(alert.message.includes("Consider moving outdoor activities indoors"), "Must include actionable guidance");

    // Immediate second evaluation should be suppressed by anti-spam cooldown (returns null)
    const duplicateAlert = await service.evaluateAqiAlerts({
      userId: testUser,
      currentAqi: 180,
      previousAqi: 110,
      locationName: "Rohini",
      stationName: "DPCC Station",
      timestamp: "11:32 AM",
    });

    assert.equal(duplicateAlert, null, "Duplicate alert within cooldown must be suppressed to avoid spam");
  });
});
