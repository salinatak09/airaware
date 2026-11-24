import "server-only";

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

  async getTodayPlan(): Promise<DayPlan> {
    return {
      date: new Date().toISOString().split("T")[0],
      overallSuitability: "caution",
      safestOutdoorWindow: {
        start: "12:30 PM",
        end: "03:30 PM",
        reason: "Solar warmth elevates the thermal mixing layer, dissipating heavy smog.",
      },
      activities: PlanService.mockActivities,
    };
  }

  async addActivity(activity: Omit<ScheduledActivity, "id">): Promise<ScheduledActivity> {
    const newAct: ScheduledActivity = {
      ...activity,
      id: `act_${Date.now()}`,
    };
    PlanService.mockActivities.push(newAct);
    return newAct;
  }
}

export const planService = new PlanService();
