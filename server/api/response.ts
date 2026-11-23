import { NextResponse } from "next/server";
import {
  ApiResponseSuccess,
  ApiResponseError,
  ApiErrorDetail,
} from "@/types";

/**
 * Creates a standardized JSON success response for Next.js Route Handlers.
 */
export function apiSuccess<T>(
  data: T,
  options?: {
    status?: number;
    message?: string;
    meta?: Record<string, unknown>;
  }
): NextResponse<ApiResponseSuccess<T>> {
  const status = options?.status ?? 200;
  const payload: ApiResponseSuccess<T> = {
    success: true,
    data,
    ...(options?.message ? { message: options.message } : {}),
    meta: {
      timestamp: new Date().toISOString(),
      ...options?.meta,
    },
  };

  return NextResponse.json(payload, { status });
}

/**
 * Creates a standardized JSON error response for Next.js Route Handlers.
 */
export function apiError(
  message: string,
  options?: {
    status?: number;
    code?: string;
    details?: ApiErrorDetail[];
  }
): NextResponse<ApiResponseError> {
  const status = options?.status ?? 500;
  const code = options?.code ?? "INTERNAL_SERVER_ERROR";

  const payload: ApiResponseError = {
    success: false,
    error: {
      code,
      message,
      ...(options?.details ? { details: options.details } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(payload, { status });
}
