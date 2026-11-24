import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, ValidationError } from "@/server/utils/errors";
import { apiError, apiValidationError, apiRateLimited, applySecurityHeaders } from "@/server/utils/response";
import { createLogContext, logRequestCompletion } from "./logger";
import { checkRateLimit, RateLimitOptions } from "./rate-limiter";
import { requireAuth, AuthenticatedUser } from "./auth";
import { formatZodIssues } from "@/server/utils/validation";

export interface ApiHandlerOptions {
  rateLimit?: RateLimitOptions | boolean;
  requireAuth?: boolean;
  log?: boolean;
}

export type HandlerWithUser<TContext = unknown> = (
  req: NextRequest,
  context: TContext,
  user?: AuthenticatedUser
) => Promise<NextResponse | Response>;

/**
 * Higher-order Route Handler wrapper providing:
 * - Centralized try/catch error handling
 * - Request logging & latency measurement
 * - In-memory rate limiting with 429 response
 * - Optional auth guard
 * - Security headers injection
 */
export function withApiHandler<TContext = unknown>(
  handler: HandlerWithUser<TContext>,
  options: ApiHandlerOptions = {}
) {
  return async (req: NextRequest, context: TContext): Promise<NextResponse | Response> => {
    const logCtx = createLogContext(req);
    let user: AuthenticatedUser | undefined;

    try {
      // 1. Rate Limiting Check
      if (options.rateLimit !== false) {
        const rateLimitOpts = typeof options.rateLimit === "object" ? options.rateLimit : undefined;
        checkRateLimit(req, rateLimitOpts);
      }

      // 2. Authentication Guard
      if (options.requireAuth) {
        user = await requireAuth(req);
      }

      // 3. Execute Core Route Logic
      const response = await handler(req, context, user);

      // 4. Log Completion & Apply Security Headers
      if (options.log !== false) {
        logRequestCompletion(logCtx, response.status);
      }

      if (response instanceof NextResponse) {
        return applySecurityHeaders(response);
      }
      return response;
    } catch (err: unknown) {
      let errorResponse: NextResponse;

      if (err instanceof AppError) {
        if (err.statusCode === 429 && "retryAfterSeconds" in err) {
          const retrySeconds = (err as { retryAfterSeconds: number }).retryAfterSeconds;
          errorResponse = apiRateLimited(err.message, retrySeconds);
        } else {
          errorResponse = apiError(err.message, {
            status: err.statusCode,
            code: err.code,
            details: err.details,
          });
        }
      } else if (err instanceof ZodError) {
        const details = formatZodIssues(err);
        errorResponse = apiValidationError("Validation failed for input data", details);
      } else if (err instanceof ValidationError) {
        errorResponse = apiValidationError(err.message, err.details);
      } else {
        const isProd = process.env.NODE_ENV === "production";
        const message = isProd ? "Internal server error occurred" : (err as Error)?.message || "Internal server error";
        console.error("Unhandled API Error:", err);
        errorResponse = apiError(message, { status: 500 });
      }

      if (options.log !== false) {
        logRequestCompletion(logCtx, errorResponse.status);
      }

      return applySecurityHeaders(errorResponse);
    }
  };
}
