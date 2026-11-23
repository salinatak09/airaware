import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { apiError } from "./response";
import { ApiErrorDetail } from "@/types";

/**
 * Base custom application error with HTTP status codes and error keys.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ApiErrorDetail[];

  constructor(message: string, statusCode = 500, code = "INTERNAL_SERVER_ERROR", details?: ApiErrorDetail[]) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request", details?: ApiErrorDetail[]) {
    super(message, 400, "BAD_REQUEST", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation Failed", details?: ApiErrorDetail[]) {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}

/**
 * Converts any caught error into a standardized NextResponse with appropriate status code.
 */
export function handleApiError(error: unknown) {
  // 1. Handle Zod validation errors
  if (error instanceof ZodError) {
    const details: ApiErrorDetail[] = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
      code: err.code,
    }));

    return apiError("Validation failed for input data", {
      status: 422,
      code: "VALIDATION_ERROR",
      details,
    });
  }

  // 2. Handle Application Custom Errors
  if (error instanceof AppError) {
    return apiError(error.message, {
      status: error.statusCode,
      code: error.code,
      details: error.details,
    });
  }

  // 3. Handle Mongoose / MongoDB Specific Errors
  if (typeof error === "object" && error !== null) {
    const errObj = error as { name?: string; code?: number; message?: string };
    
    // Duplicate Key Error
    if (errObj.code === 11000) {
      return apiError("A record with that identifier already exists.", {
        status: 409,
        code: "DUPLICATE_KEY",
      });
    }

    // CastError (invalid ObjectId, etc.)
    if (errObj.name === "CastError") {
      return apiError("Invalid identifier provided.", {
        status: 400,
        code: "INVALID_IDENTIFIER",
      });
    }
  }

  // 4. Fallback for unhandled/internal errors
  console.error("Unhandled API Server Error:", error);
  const isDev = process.env.NODE_ENV === "development";
  const errorMessage = isDev && error instanceof Error ? error.message : "An unexpected server error occurred.";

  return apiError(errorMessage, {
    status: 500,
    code: "INTERNAL_SERVER_ERROR",
  });
}

/**
 * Wrapper for Next.js Route Handlers with automatic centralized error handling.
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse | Response>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  }) as T;
}
