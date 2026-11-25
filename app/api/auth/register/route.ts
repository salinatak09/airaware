import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiCreated } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { connectToDatabase } from "@/server/db";
import { User, HouseholdProfile, GamificationProfile } from "@/models";
import { hashPassword } from "@/server/utils/password";
import { ConflictError } from "@/server/utils/errors";

export const dynamic = "force-dynamic";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Please provide a valid email address").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  city: z.string().default("New Delhi"),
  area: z.string().default("Central Delhi"),
});

/**
 * POST /api/auth/register
 * Register a new AirAware family account
 */
export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await validateBody(req, registerSchema);

  await connectToDatabase();

  // Check existing user
  const existing = await User.findOne({ email: body.email }).exec();
  if (existing) {
    throw new ConflictError("An account with this email address already exists.");
  }

  const passwordHash = hashPassword(body.password);

  const user = await User.create({
    name: body.name,
    email: body.email,
    passwordHash,
    authProvider: "credentials",
    avatar: "aero-avatar-default",
    location: {
      city: body.city,
      area: body.area,
      country: "India",
      coordinates: {
        type: "Point",
        coordinates: [77.209, 28.6139],
      },
      latitude: 28.6139,
      longitude: 77.209,
    },
    onboardingComplete: false,
    preferences: {
      notificationsEnabled: true,
      aqiThresholdAlert: 150,
      temperatureUnit: "celsius",
      aqiStandard: "CPCB_NAQI",
    },
  });

  // Initialize companion Household and Gamification records
  await Promise.all([
    HouseholdProfile.create({
      userId: user._id,
      householdSize: { adults: 1, children: 0, elderly: 0, total: 1 },
      sensitiveGroupPreferences: {
        hasRespiratorySensitivity: false,
        hasCardiovascularSensitivity: false,
        isPregnant: false,
        hasInfant: false,
      },
    }),
    GamificationProfile.create({
      userId: user._id,
      totalXp: 50, // Starting bonus
      level: 1,
      streak: {
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date(),
        streakFreezesAvailable: 1,
      },
      completedMissionsCount: 0,
      weeklyXp: 50,
    }),
  ]);

  return apiCreated(
    {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        location: user.location,
        onboardingComplete: false,
      },
    },
    {
      message: "Account created successfully! Please sign in to activate your protection shield.",
    }
  );
});
