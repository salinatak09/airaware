import "server-only";
import { NextRequest } from "next/server";
import { RateLimitError } from "@/server/utils/errors";
import { RATE_LIMIT } from "@/server/config/constants";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory bucket cache keyed by IP or identifier
const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleRecords(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitOptions {
  maxRequests?: number;
  windowMs?: number;
  keyPrefix?: string;
}

/**
 * Check and increment rate limit for a client IP.
 * Throws RateLimitError if exceeded.
 */
export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions = {}
): {
  remaining: number;
  limit: number;
  resetSeconds: number;
} {
  cleanupStaleRecords();

  const maxRequests = options.maxRequests ?? RATE_LIMIT.DEFAULT_MAX_REQUESTS;
  const windowMs = options.windowMs ?? RATE_LIMIT.DEFAULT_WINDOW_MS;
  const prefix = options.keyPrefix ?? "default";

  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  const storeKey = `${prefix}:${ip}`;

  const now = Date.now();
  const existing = rateLimitStore.get(storeKey);

  if (!existing || now > existing.resetAt) {
    rateLimitStore.set(storeKey, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      remaining: maxRequests - 1,
      limit: maxRequests,
      resetSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= maxRequests) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    throw new RateLimitError(
      `Too many requests. Please retry in ${retryAfter} seconds.`,
      retryAfter
    );
  }

  existing.count += 1;
  const remaining = Math.max(0, maxRequests - existing.count);
  const resetSeconds = Math.ceil((existing.resetAt - now) / 1000);

  return {
    remaining,
    limit: maxRequests,
    resetSeconds,
  };
}
