import { createHmac, timingSafeEqual } from "node:crypto";

// Site-wide password gate — independent of the GitHub OAuth system in
// session.ts/crypto.ts, which is scoped to pushToGithub only (it needs a
// real per-user GitHub token, this just needs "is this a visitor who knows
// the password"). Reuses SESSION_SECRET for signing rather than adding yet
// another env var.
export const APP_SESSION_COOKIE = "app_session";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createAppSessionCookieValue(expiresAt = Date.now() + MAX_AGE_SECONDS * 1000): string {
  const payload = JSON.stringify({ exp: expiresAt });
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function isValidAppSessionCookie(value: string | undefined): boolean {
  if (!value) return false;
  const [payloadB64, signature] = value.split(".");
  if (!payloadB64 || !signature) return false;

  const expected = sign(payloadB64);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    return typeof exp === "number" && Date.now() <= exp;
  } catch {
    return false;
  }
}

/** Constant-time-ish comparison against APP_PASSWORD. Returns false (never
 * throws) if the env var isn't set, so a misconfigured deploy fails closed
 * rather than open. */
export function checkPassword(candidate: string): boolean {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return false;

  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false; // timingSafeEqual requires equal-length buffers
  return timingSafeEqual(a, b);
}
