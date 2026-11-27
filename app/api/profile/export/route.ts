import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { connectToDatabase } from "@/server/db";
import {
  User,
  HouseholdProfile,
  GamificationProfile,
  DailyPlan,
  UserAction,
  Notification,
  CommunityReport,
} from "@/models";
import { NotFoundError } from "@/server/utils/errors";

export const dynamic = "force-dynamic";

/**
 * GET /api/profile/export
 * Privacy-by-design & Data Portability export handler.
 * Delivers full user data in structured JSON format.
 */
export const GET = withApiHandler(
  async (_req: NextRequest, _ctx, user) => {
    await connectToDatabase();
    const userId = user!.id;

    const [userDoc, householdDoc, gamificationDoc, plans, actions, notifications, reports] =
      await Promise.all([
        User.findById(userId).lean().exec(),
        HouseholdProfile.findOne({ userId }).lean().exec(),
        GamificationProfile.findOne({ userId }).lean().exec(),
        DailyPlan.find({ userId }).sort({ date: -1 }).limit(30).lean().exec(),
        UserAction.find({ userId }).sort({ completedAt: -1 }).limit(100).lean().exec(),
        Notification.find({ userId }).sort({ createdAt: -1 }).limit(50).lean().exec(),
        CommunityReport.find({ userId }).sort({ reportedAt: -1 }).lean().exec(),
      ]);

    if (!userDoc) {
      throw new NotFoundError("User not found.");
    }

    const exportPackage = {
      exportedAt: new Date().toISOString(),
      platform: "AirAware Clean Air & Smog Defense",
      user: {
        id: userDoc._id.toString(),
        name: userDoc.name,
        email: userDoc.email,
        bio: userDoc.bio,
        phone: userDoc.phone,
        location: userDoc.location,
        preferences: userDoc.preferences,
        familyMembers: userDoc.familyMembers,
        createdAt: userDoc.createdAt,
      },
      householdProfile: householdDoc,
      gamification: gamificationDoc,
      recentDailyPlans: plans,
      completedActions: actions,
      notificationsHistory: notifications,
      communityReports: reports,
    };

    return new NextResponse(JSON.stringify(exportPackage, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="airaware-data-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  },
  { requireAuth: true }
);
