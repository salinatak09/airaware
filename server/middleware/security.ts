import "server-only";
import { NextResponse } from "next/server";
import { SECURITY_HEADERS } from "@/server/config/constants";

/**
 * Injects hardened security headers onto any Next.js NextResponse.
 */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}
