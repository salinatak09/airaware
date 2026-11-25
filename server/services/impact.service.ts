import "server-only";
import { connectToDatabase } from "@/server/db";
import { GamificationProfile } from "@/models/GamificationProfile";
import { UserAction } from "@/models/UserAction";

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  category: "indoor" | "protective" | "planning" | "habits";
  xpReward: number;
  completed: boolean;
}

export interface ImpactStats {
  xp: number;
  level: number;
  nextLevelXp: number;
  streakDays: number;
  cleanAirHoursProtected: number;
  masksWorn: number;
  purifierHoursRun: number;
  dailyMissions: DailyMission[];
}

export class ImpactService {
  private static userStats: ImpactStats = {
    xp: 340,
    level: 4,
    nextLevelXp: 500,
    streakDays: 7,
    cleanAirHoursProtected: 142,
    masksWorn: 18,
    purifierHoursRun: 96,
    dailyMissions: [
      {
        id: "m_1",
        title: "Morning Air Check",
        description: "Check the local AQI forecast before leaving home",
        category: "planning",
        xpReward: 30,
        completed: true,
      },
      {
        id: "m_2",
        title: "Seal Bedroom Windows",
        description: "Keep bedroom windows closed during peak traffic hours",
        category: "indoor",
        xpReward: 40,
        completed: true,
      },
      {
        id: "m_3",
        title: "Safe Commute Mask",
        description: "Wear an N95 or KF94 mask during the evening rush hour",
        category: "protective",
        xpReward: 50,
        completed: false,
      },
      {
        id: "m_4",
        title: "Pre-Bed Air Cleanse",
        description: "Run bedroom purifier at medium speed 1 hour before sleep",
        category: "habits",
        xpReward: 40,
        completed: false,
      },
    ],
  };

  async getImpactStats(userId?: string): Promise<ImpactStats> {
    try {
      await connectToDatabase();
      const filter = userId ? { userId } : {};
      const profile = await GamificationProfile.findOne(filter).lean().exec();

      if (profile) {
        const nextLevelXp = profile.level * 500;
        return {
          xp: profile.totalXp,
          level: profile.level,
          nextLevelXp,
          streakDays: profile.streak.currentStreak,
          cleanAirHoursProtected: 142 + profile.totalXp * 0.2,
          masksWorn: 18 + Math.floor(profile.totalXp / 50),
          purifierHoursRun: 96 + Math.floor(profile.totalXp / 30),
          dailyMissions: ImpactService.userStats.dailyMissions,
        };
      }
    } catch {
      // Fallback
    }

    return { ...ImpactService.userStats };
  }

  async completeMission(missionId: string, userId?: string): Promise<ImpactStats> {
    const mission = ImpactService.userStats.dailyMissions.find((m) => m.id === missionId);
    if (!mission) {
      throw new Error(`Mission ${missionId} not found`);
    }

    if (!mission.completed) {
      mission.completed = true;
      ImpactService.userStats.xp += mission.xpReward;
      if (ImpactService.userStats.xp >= ImpactService.userStats.nextLevelXp) {
        ImpactService.userStats.level += 1;
        ImpactService.userStats.nextLevelXp += 500;
      }

      try {
        await connectToDatabase();
        if (userId) {
          await GamificationProfile.findOneAndUpdate(
            { userId },
            {
              $inc: { totalXp: mission.xpReward, completedMissionsCount: 1 },
              $set: { "streak.lastActiveDate": new Date() },
            },
            { upsert: true }
          );

          await UserAction.create({
            userId,
            actionType: "quiz_completed",
            xpEarned: mission.xpReward,
            associatedMissionId: missionId,
            metadata: { missionTitle: mission.title },
          });
        }
      } catch {
        // Fallback
      }
    }

    return { ...ImpactService.userStats };
  }
}

export const impactService = new ImpactService();
