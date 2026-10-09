import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { User } from "@/generated/prisma/client";

export const SESSION_COOKIE = "session";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

/** A stateless, signed cookie value — no server-side session table. Valid
 * for MAX_AGE_SECONDS from issuance; there's no revocation before then, which
 * is an acceptable trade for not needing a Session model for a single-user-
 * per-browser tool like this one. `expiresAt` defaults to that 30-day window
 * but is overridable so scripts/test-unit.ts can produce a validly-signed,
 * already-expired cookie to test expiry rejection specifically. */
export function createSessionCookieValue(userId: string, expiresAt = Date.now() + MAX_AGE_SECONDS * 1000): string {
  const payload = JSON.stringify({ userId, exp: expiresAt });
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

/** Exported for scripts/test-unit.ts — otherwise only used below. */
export function verifySessionCookieValue(value: string): string | null {
  const [payloadB64, signature] = value.split(".");
  if (!payloadB64 || !signature) return null;

  const expected = sign(payloadB64);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const { userId, exp } = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (typeof userId !== "string" || typeof exp !== "number" || Date.now() > exp) return null;
    return userId;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (!value) return null;

  const userId = verifySessionCookieValue(value);
  if (!userId) return null;

  return db.user.findUnique({ where: { id: userId } });
}
