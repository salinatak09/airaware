import "server-only";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess } from "@/server/utils/response";
import { withApiHandler } from "@/server/middleware/with-api-handler";
import { validateBody } from "@/server/utils/validation";
import { geminiService } from "@/server/services/ai/gemini";
import { AiContextInputSchema } from "@/server/services/ai/types";
import { connectToDatabase } from "@/server/db";
import { HouseholdProfile, ChatSession, AQIReading } from "@/models";
import { RATE_LIMIT } from "@/server/config/constants";

export const dynamic = "force-dynamic";

const chatRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty").max(1000, "Prompt is too long"),
  sessionId: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
  context: AiContextInputSchema.partial().optional(),
});

/**
 * GET /api/ai/chat
 * Fetch chat sessions or active conversation history for the authenticated user.
 */
export const GET = withApiHandler(async (req: NextRequest, _ctx, user) => {
  if (!user?.id) {
    return apiSuccess({
      sessions: [],
      activeSession: null,
    });
  }

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const requestedSessionId = searchParams.get("sessionId");

    if (requestedSessionId) {
      const session = await ChatSession.findOne({
        _id: requestedSessionId,
        userId: user.id,
      })
        .lean()
        .exec();

      return apiSuccess({ activeSession: session });
    }

    // Get recent sessions list
    const sessions = await ChatSession.find({ userId: user.id })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("_id title persona sessionMetadata updatedAt createdAt")
      .lean()
      .exec();

    // Get active (most recent) session
    const activeSession = await ChatSession.findOne({ userId: user.id })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    return apiSuccess({
      sessions,
      activeSession,
    });
  } catch (err) {
    console.error("[GET /api/ai/chat] Failed to fetch chat history:", err);
    return apiSuccess({ sessions: [], activeSession: null });
  }
});

/**
 * POST /api/ai/chat
 * Conversational AI Assistant using Google Gemini with deterministic safety rules.
 * Automatically appends messages to active/created ChatSession.
 */
export const POST = withApiHandler(
  async (req: NextRequest, _ctx, user) => {
    const body = await validateBody(req, chatRequestSchema);

    // Build context with fallback defaults
    const context = {
      currentAqi: body.context?.currentAqi ?? 185,
      category: body.context?.category ?? "Poor",
      pollutants: body.context?.pollutants ?? { pm25: 110, pm10: 195, no2: 45 },
      dataSource: body.context?.dataSource ?? "CPCB Ground Stations + Open-Meteo High Resolution Model",
      dataTimestamp: body.context?.dataTimestamp ?? new Date().toISOString(),
      userLocation: body.context?.userLocation ?? { city: "New Delhi" },
      householdProfile: body.context?.householdProfile,
      commute: body.context?.commute,
      lifestyle: body.context?.lifestyle,
      homeEnvironment: body.context?.homeEnvironment,
      budget: body.context?.budget,
      completedActions: body.context?.completedActions,
    };

    // If authenticated, enrich with persisted database profile
    if (user?.id) {
      try {
        await connectToDatabase();
        const [hp, latestReading] = await Promise.all([
          HouseholdProfile.findOne({ userId: user.id }).lean().exec(),
          AQIReading.findOne().sort({ recordedAt: -1 }).lean().exec(),
        ]);

        if (latestReading && !body.context?.currentAqi) {
          context.currentAqi = latestReading.aqi.indianAqi;
          context.category = latestReading.aqi.indianCategory;
          context.pollutants = {
            pm25: latestReading.pollutantMeasurements.pm25,
            pm10: latestReading.pollutantMeasurements.pm10,
            no2: latestReading.pollutantMeasurements.no2,
            so2: latestReading.pollutantMeasurements.so2,
            co: latestReading.pollutantMeasurements.co,
            o3: latestReading.pollutantMeasurements.o3,
          };
          context.dataSource = `${latestReading.source} (${latestReading.sourceType})`;
          context.dataTimestamp = new Date(latestReading.recordedAt).toISOString();
        }

        if (hp) {
          if (!body.context?.householdProfile) {
            context.householdProfile = {
              householdSize: hp.householdSize,
              sensitivePreferences: hp.sensitiveGroupPreferences,
            };
          }
          if (!body.context?.commute) {
            context.commute = hp.commute;
          }
          if (!body.context?.lifestyle) {
            context.lifestyle = hp.lifestyle;
          }
          if (!body.context?.homeEnvironment) {
            context.homeEnvironment = {
              ...hp.homeEnvironment,
              purifierAvailability: hp.purifierAvailability,
            };
          }
          if (!body.context?.budget) {
            context.budget = hp.budgetPreferences;
          }
        }
      } catch (err) {
        console.warn("[POST /api/ai/chat] Database context enrichment skipped:", err);
      }
    }

    // Call Gemini with full context & safety rules
    const result = await geminiService.generateChatReply(body.prompt, context, body.history);

    let activeSessionId = body.sessionId;

    // Persist conversation turn in ChatSession for authenticated users
    if (user?.id) {
      try {
        await connectToDatabase();
        const userMessage = {
          messageId: `msg_${Date.now()}_u`,
          role: "user" as const,
          content: body.prompt,
          timestamp: new Date(),
          aqiContext: { aqi: context.currentAqi, category: context.category, city: context.userLocation.city },
        };

        const assistantMessage = {
          messageId: `msg_${Date.now()}_a`,
          role: "assistant" as const,
          content: result.reply,
          timestamp: new Date(),
          aqiContext: { aqi: context.currentAqi, category: context.category, city: context.userLocation.city },
          safetyAdvisories: result.safetyWarnings,
        };

        if (activeSessionId && activeSessionId !== "new") {
          const updated = await ChatSession.findOneAndUpdate(
            { _id: activeSessionId, userId: user.id },
            {
              $push: { messages: { $each: [userMessage, assistantMessage] } },
              $inc: { "sessionMetadata.messageCount": 2 },
            },
            { new: true }
          );
          if (updated) {
            activeSessionId = updated._id.toString();
          }
        } else {
          // Create new session
          const newSession = await ChatSession.create({
            userId: user.id,
            title: body.prompt.slice(0, 42),
            persona: "daily_planner",
            messages: [userMessage, assistantMessage],
            sessionMetadata: {
              initialAqi: context.currentAqi,
              city: context.userLocation.city,
              clientPlatform: "web",
              messageCount: 2,
            },
          });
          activeSessionId = newSession._id.toString();
        }
      } catch (err) {
        console.warn("[POST /api/ai/chat] Session persistence non-blocking error:", err);
      }
    }

    return apiSuccess(
      {
        ...result,
        sessionId: activeSessionId,
      },
      {
        message: "Chat reply generated successfully",
      }
    );
  },
  {
    rateLimit: {
      maxRequests: RATE_LIMIT.AI_MAX_REQUESTS,
      windowMs: RATE_LIMIT.AI_WINDOW_MS,
      keyPrefix: "ai-chat",
    },
  }
);

/**
 * DELETE /api/ai/chat
 * Clears conversation history for the user or deletes a specific session.
 */
export const DELETE = withApiHandler(async (req: NextRequest, _ctx, user) => {
  if (!user?.id) {
    return apiSuccess({ cleared: true }, { message: "Local session reset" });
  }

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      await ChatSession.deleteOne({ _id: sessionId, userId: user.id });
    } else {
      await ChatSession.deleteMany({ userId: user.id });
    }

    return apiSuccess({ cleared: true }, { message: "Chat conversation cleared" });
  } catch (err) {
    console.error("[DELETE /api/ai/chat] Error clearing chat session:", err);
    return apiSuccess({ cleared: true });
  }
});
