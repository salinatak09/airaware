import { z } from "zod";

/**
 * Server-side environment variables schema.
 * All sensitive keys (MongoDB URI, Gemini API Key, Auth secrets) must remain strictly on the server.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required")
    .default("mongodb://localhost:27017/airaware"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required").default("dummy_gemini_key_for_dev"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required").default("development_secret_only_change_in_production_32chars!"),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
  OPEN_METEO_AIR_QUALITY_URL: z
    .string()
    .url()
    .default("https://air-quality-api.open-meteo.com/v1/air-quality"),
});

/**
 * Client-accessible public environment variables schema.
 * Must start with NEXT_PUBLIC_.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("AirAware"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

const mergedEnvSchema = serverEnvSchema.merge(clientEnvSchema);

export type Env = z.infer<typeof mergedEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

function parseEnv(): Env {
  const isServer = typeof window === "undefined";

  if (!isServer) {
    // On the client, only validate and return NEXT_PUBLIC variables
    const clientResult = clientEnvSchema.safeParse({
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    });

    if (!clientResult.success) {
      console.error("Invalid client environment variables:", clientResult.error.format());
      throw new Error("Invalid client environment configuration.");
    }
    return clientResult.data as Env;
  }

  // On the server, validate full environment
  const serverResult = mergedEnvSchema.safeParse(process.env);

  if (!serverResult.success) {
    console.error("❌ Invalid environment variables:", serverResult.error.format());
    // In production, throw to prevent runtime surprises with missing critical secrets
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid server environment configuration. Check your .env setup.");
    }
  }

  return (serverResult.success ? serverResult.data : mergedEnvSchema.parse({})) as Env;
}

export const env = parseEnv();
