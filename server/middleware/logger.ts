import "server-only";
import { NextRequest } from "next/server";

export interface LogContext {
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  startTime: number;
}

/**
 * Creates a request logging context.
 */
export function createLogContext(req: NextRequest): LogContext {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "unknown";

  return {
    method: req.method,
    url: req.nextUrl.pathname,
    ip,
    userAgent,
    startTime: Date.now(),
  };
}

/**
 * Logs the completion of an API request with latency and status.
 */
export function logRequestCompletion(ctx: LogContext, statusCode: number): void {
  const duration = Date.now() - ctx.startTime;
  const isError = statusCode >= 400;
  const logFn = isError ? console.warn : console.log;

  logFn(
    `[API] ${ctx.method} ${ctx.url} - ${statusCode} (${duration}ms) [client: ${ctx.ip}]`
  );
}
