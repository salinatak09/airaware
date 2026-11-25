import "server-only";
import crypto from "crypto";

/**
 * Secure PBKDF2 Password Hashing Utility
 * Implements 100,000 iterations of SHA-512 with a cryptographically secure random 16-byte salt.
 * Timing-safe comparison prevents timing attacks.
 */

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

export function hashPassword(password: string): string {
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!password || !storedHash || !storedHash.includes(":")) {
    return false;
  }

  try {
    const [salt, originalHash] = storedHash.split(":");
    if (!salt || !originalHash) {
      return false;
    }

    const derivedKey = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
    const originalBuffer = Buffer.from(originalHash, "hex");
    const derivedBuffer = Buffer.from(derivedKey.toString("hex"), "hex");

    if (originalBuffer.length !== derivedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(originalBuffer, derivedBuffer);
  } catch {
    return false;
  }
}
