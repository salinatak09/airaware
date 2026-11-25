import "server-only";
import { safetyEngine } from "./safety";

export interface ScheduledActivity {
  id: string;
  title: string;
  scheduledTime: string;
  durationMinutes: number;
  activityType: "outdoor_exercise" | "commute" | "school_run" | "indoor_rest" | "errands";
  airRiskLevel: "low" | "moderate" | "high" | "severe";
  recommendedMask: boolean;
  notes: string;
}

export interface DayPlan {
  date: string;
  overallSuitability: "good" | "moderate" | "caution" | "poor";
  safestOutdoorWindow: {
    start: string;
    end: string;
    reason: string;
  };
  activities: ScheduledActivity[];
}

export class PlanService {
  private static mockActivities: ScheduledActivity[] = [
    {
      id: "act_1",
      title: "Morning School Run",
      scheduledTime: "07:45 AM",
      durationMinutes: 30,
      activityType: "school_run",
      airRiskLevel: "high",
      recommendedMask: true,
      notes: "Morning ground smog peak. Wear KF94 mask.",
    },
    {
      id: "act_2",
      title: "Outdoor Walk & Errands",
      scheduledTime: "01:30 PM",
      durationMinutes: 45,
      activityType: "errands",
      airRiskLevel: "moderate",
      recommendedMask: false,
      notes: "Safest window of the day. Particulates dispersed by solar heating.",
    },
    {
      id: "act_3",
      title: "Evening Metro Commute",
      scheduledTime: "06:15 PM",
      durationMinutes: 40,
      activityType: "commute",
      airRiskLevel: "high",
      recommendedMask: true,
      notes: "Rush hour traffic emissions spike. Keep mask on outdoors.",
    },
  ];

  async getTodayPlan(aqi = 185): Promise<DayPlan> {
    const safety = safetyEngine.evaluateSafety({ aqi });

    let overallSuitability: DayPlan["overallSuitability"] = "moderate";
    if (safety.severity === "low") overallSuitability = "good";
    else if (safety.severity === "moderate") overallSuitability = "moderate";
    else if (safety.severity === "high") overallSuitability = "caution";
    else overallSuitability = "poor";

    return {
      date: new Date().toISOString().split("T")[0],
      overallSuitability,
      safestOutdoorWindow: {
        start: "12:30 PM",
        end: "03:30 PM",
        reason: "Solar warmth elevates the thermal mixing layer, dissipating heavy smog.",
      },
      activities: PlanService.mockActivities,
    };
  }

  async addActivity(activity: Omit<ScheduledActivity, "id">, currentAqi = 185): Promise<ScheduledActivity> {
    const actSafety = safetyEngine.evaluateSafety({
      aqi: currentAqi,
      activityContext: {
        plannedActivityType: activity.activityType,
        durationMinutes: activity.durationMinutes,
        scheduledTimeOfDay: activity.scheduledTime,
      },
    });

    const mappedRisk: ScheduledActivity["airRiskLevel"] =
      actSafety.severity === "critical" ? "severe" : actSafety.severity;

    const newAct: ScheduledActivity = {
      ...activity,
      id: `act_${Date.now()}`,
      airRiskLevel: activity.airRiskLevel || mappedRisk,
      recommendedMask: actSafety.restrictions.maskRequired,
      notes: activity.notes || actSafety.recommendations.outdoorActivity[0] || "Follow local air quality advisories.",
    };
    PlanService.mockActivities.push(newAct);
    return newAct;
  }
}

export const planService = new PlanService();
