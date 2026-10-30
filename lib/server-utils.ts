import crypto from "crypto";

/**
 * Constant-time comparison to prevent timing attacks when verifying administrative secrets.
 */
export function isTimingSafeMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

