import "server-only";
import { NextResponse } from "next/server";
import { ApiResponseSuccess, ApiResponseError, ApiErrorDetail } from "@/types";
import { HTTP_STATUS, ERROR_CODES, SECURITY_HEADERS } from "@/server/config/constants";

/**
 * Attaches standard security headers to any NextResponse.
 */
export function applySecurityHeaders<T>(response: NextResponse<T>): NextResponse<T> {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Standardized JSON success response for Next.js Route Handlers.
 */
export function apiSuccess<T>(
  data: T,
  options?: {
    status?: number;
    message?: string;
    meta?: Record<string, unknown>;
    headers?: Record<string, string>;
  }
): NextResponse<ApiResponseSuccess<T>> {
  const status = options?.status ?? HTTP_STATUS.OK;
  const payload: ApiResponseSuccess<T> = {
    success: true,
    data,
    ...(options?.message ? { message: options.message } : {}),
    meta: {
      timestamp: new Date().toISOString(),
      ...options?.meta,
    },
  };

  const response = NextResponse.json(payload, { status });

  if (options?.headers) {
    Object.entries(options.headers).forEach(([k, v]) => response.headers.set(k, v));
  }

  return applySecurityHeaders(response);
}

/**
 * Standardized 201 Created response.
 */
export function apiCreated<T>(
  data: T,
  options?: {
    message?: string;
    meta?: Record<string, unknown>;
  }
): NextResponse<ApiResponseSuccess<T>> {
  return apiSuccess(data, {
    status: HTTP_STATUS.CREATED,
    message: options?.message ?? "Resource created successfully",
    meta: options?.meta,
  });
}

/**
 * Standardized JSON error response for Next.js Route Handlers.
 */
export function apiError(
  message: string,
  options?: {
    status?: number;
    code?: string;
    details?: ApiErrorDetail[];
    headers?: Record<string, string>;
  }
): NextResponse<ApiResponseError> {
  const status = options?.status ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const code = options?.code ?? ERROR_CODES.INTERNAL_SERVER_ERROR;

  const payload: ApiResponseError = {
    success: false,
    error: {
      code,
      message,
      ...(options?.details && options.details.length > 0 ? { details: options.details } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  const response = NextResponse.json(payload, { status });

  if (options?.headers) {
    Object.entries(options.headers).forEach(([k, v]) => response.headers.set(k, v));
  }

  return applySecurityHeaders(response);
}

/**
 * Reusable utility for 400 Bad Request
 */
export function apiBadRequest(message = "Bad request", details?: ApiErrorDetail[]) {
  return apiError(message, {
    status: HTTP_STATUS.BAD_REQUEST,
    code: ERROR_CODES.BAD_REQUEST,
    details,
  });
}

/**
 * Reusable utility for 401 Unauthorized
 */
export function apiUnauthorized(message = "Authentication required") {
  return apiError(message, {
    status: HTTP_STATUS.UNAUTHORIZED,
    code: ERROR_CODES.UNAUTHORIZED,
  });
}

/**
 * Reusable utility for 403 Forbidden
 */
export function apiForbidden(message = "Access forbidden") {
  return apiError(message, {
    status: HTTP_STATUS.FORBIDDEN,
    code: ERROR_CODES.FORBIDDEN,
  });
}

/**
 * Reusable utility for 404 Not Found
 */
export function apiNotFound(message = "Resource not found") {
  return apiError(message, {
    status: HTTP_STATUS.NOT_FOUND,
    code: ERROR_CODES.NOT_FOUND,
  });
}

/**
 * Reusable utility for 409 Conflict
 */
export function apiConflict(message = "Resource conflict") {
  return apiError(message, {
    status: HTTP_STATUS.CONFLICT,
    code: ERROR_CODES.CONFLICT,
  });
}

/**
 * Reusable utility for 422 Validation Error
 */
export function apiValidationError(message = "Validation failed", details?: ApiErrorDetail[]) {
  return apiError(message, {
    status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    code: ERROR_CODES.VALIDATION_ERROR,
    details,
  });
}

/**
 * Reusable utility for 429 Rate Limited
 */
export function apiRateLimited(message = "Too many requests. Please try again later.", retryAfterSeconds = 60) {
  return apiError(message, {
    status: HTTP_STATUS.TOO_MANY_REQUESTS,
    code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    headers: {
      "Retry-After": String(retryAfterSeconds),
    },
  });
}
