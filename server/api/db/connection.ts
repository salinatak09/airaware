import "server-only";
import mongoose from "mongoose";
import { serverConfig } from "@/server/config/env";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connect to MongoDB using Mongoose with connection pooling and Next.js hot-reload caching.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(serverConfig.MONGODB_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        console.error("❌ MongoDB connection error:", error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

export type DbState = "disconnected" | "connected" | "connecting" | "disconnecting" | "uninitialized";

export interface DatabaseStatus {
  isConnected: boolean;
  readyState: number;
  stateLabel: DbState;
  host?: string;
  name?: string;
}

/**
 * Inspect the current Mongoose connection status without forcing a connection.
 */
export function getDatabaseStatus(): DatabaseStatus {
  const readyState = mongoose.connection.readyState;
  const stateLabels: Record<number, DbState> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    isConnected: readyState === 1,
    readyState,
    stateLabel: stateLabels[readyState] ?? "uninitialized",
    host: mongoose.connection.host || undefined,
    name: mongoose.connection.name || undefined,
  };
}

/**
 * Gracefully disconnect from MongoDB (useful for test suites or worker shutdown).
 */
export async function disconnectDatabase(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}
