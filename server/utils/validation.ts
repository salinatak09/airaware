import "server-only";
import { z, ZodError } from "zod";
import { ValidationError, BadRequestError } from "./errors";
import { ApiErrorDetail } from "@/types";

/**
 * Format Zod issues into standardized ApiErrorDetail array.
 */
export function formatZodIssues(error: ZodError): ApiErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));
}

/**
 * Validate and parse a JSON request body against a Zod schema.
 * Throws ValidationError or BadRequestError if invalid.
 */
export async function validateBody<TOutput, TInput = unknown>(
  request: Request,
  schema: z.ZodType<TOutput, z.ZodTypeDef, TInput>
): Promise<TOutput> {
  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    throw new BadRequestError("Invalid JSON in request body");
  }

  const result = schema.safeParse(rawBody);

  if (!result.success) {
    const details = formatZodIssues(result.error);
    throw new ValidationError("Request body validation failed", details);
  }

  return result.data;
}

/**
 * Validate URL search query parameters against a Zod schema.
 */
export function validateQuery<TOutput, TInput = unknown>(
  request: Request,
  schema: z.ZodType<TOutput, z.ZodTypeDef, TInput>
): TOutput {
  const url = new URL(request.url);
  const queryObj: Record<string, string | string[]> = {};

  url.searchParams.forEach((value, key) => {
    const existing = queryObj[key];
    if (existing) {
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        queryObj[key] = [existing, value];
      }
    } else {
      queryObj[key] = value;
    }
  });

  const result = schema.safeParse(queryObj);

  if (!result.success) {
    const details = formatZodIssues(result.error);
    throw new ValidationError("Query parameter validation failed", details);
  }

  return result.data;
}

/**
 * Validate route parameters (e.g. from context: { params: Promise<{ id: string }> })
 */
export async function validateParams<TOutput, TInput = unknown>(
  paramsPromise: Promise<unknown> | unknown,
  schema: z.ZodType<TOutput, z.ZodTypeDef, TInput>
): Promise<TOutput> {
  const resolved = await Promise.resolve(paramsPromise);
  const result = schema.safeParse(resolved);

  if (!result.success) {
    const details = formatZodIssues(result.error);
    throw new ValidationError("Route parameter validation failed", details);
  }

  return result.data;
}
