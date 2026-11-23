import mongoose from "mongoose";
import { env } from "@/lib/env";

/**
 * MongoDB connection cache interface for Next.js hot-reload persistence.
 */
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
 * Connect to MongoDB using Mongoose with connection pooling and caching.
 * Prevents multiple connections during Next.js hot-reloading.
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
      .connect(env.MONGODB_URI, opts)
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

/**
 * Returns current MongoDB connection status.
 * ReadyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 */
export function getDatabaseStatus(): {
  isConnected: boolean;
  readyState: number;
  stateLabel: string;
} {
  const state = mongoose.connection.readyState;
  const labels: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    isConnected: state === 1,
    readyState: state,
    stateLabel: labels[state] ?? "unknown",
  };
}
