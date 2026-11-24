import "server-only";
import { z } from "zod";

/**
 * Server Environment Variables Schema.
 * Sensitive API keys and database credentials are strictly guarded here
 * and forbidden from leaking to client bundles.
 */
const serverConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required")
    .default("mongodb://localhost:27017/airaware"),
  GEMINI_API_KEY: z
    .string()
    .min(1, "GEMINI_API_KEY is required")
    .default("dummy_gemini_key_for_dev"),
  NEXTAUTH_SECRET: z
    .string()
    .min(1, "NEXTAUTH_SECRET is required")
    .default("development_secret_only_change_in_production_32chars!"),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
  OPEN_METEO_AIR_QUALITY_URL: z
    .string()
    .url()
    .default("https://air-quality-api.open-meteo.com/v1/air-quality"),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
});

export type ServerConfig = z.infer<typeof serverConfigSchema>;

function loadServerConfig(): ServerConfig {
  const result = serverConfigSchema.safeParse(process.env);

  if (!result.success) {
    const formattedErrors = result.error.format();
    console.error("❌ Invalid server configuration:", formattedErrors);

    if (process.env.NODE_ENV === "production") {
      throw new Error("Critical server environment variables missing or invalid.");
    }
    // Return parsed defaults in development to prevent startup crashes when keys are not yet filled
    return serverConfigSchema.parse({});
  }

  return result.data;
}

export const serverConfig = loadServerConfig();
