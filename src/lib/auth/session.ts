import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { User } from "@/generated/prisma/client";

// Two separate cookies, same signing scheme and secret, deliberately —
// they identify two unrelated things on possibly-different User rows (see
// schema.prisma's User model comment): SESSION_COOKIE is a GitHub identity
// (pushToGithub only), SITE_SESSION_COOKIE is "logged into the site at all"
// (checked by src/proxy.ts, set by login/signup). Reusing one signed-value
// scheme for both is a deliberate simplification: a cookie value is only
// ever meaningful as "this userId, validly signed" either way, and both
// ultimately authenticate the same real person, so there's no privilege
// difference to protect between them.
export const SESSION_COOKIE = "session";
export const SITE_SESSION_COOKIE = "site_session";
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
 * is an acceptable trade for not needing a Session model for a tool at this
 * scale. `expiresAt` defaults to that 30-day window but is overridable so
 * scripts/test-unit.ts can produce a validly-signed, already-expired cookie
 * to test expiry rejection specifically. */
export function createSessionCookieValue(userId: string, expiresAt = Date.now() + MAX_AGE_SECONDS * 1000): string {
  const payload = JSON.stringify({ userId, exp: expiresAt });
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

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

async function getUserFromCookie(cookieName: string): Promise<User | null> {
  const store = await cookies();
  const value = store.get(cookieName)?.value;
  if (!value) return null;

  const userId = verifySessionCookieValue(value);
  if (!userId) return null;

  return db.user.findUnique({ where: { id: userId } });
}

/** The GitHub-identity session — only ever meaningful to pushToGithub. */
export async function getCurrentUser(): Promise<User | null> {
  return getUserFromCookie(SESSION_COOKIE);
}

/** The site-login session — whoever is actually using the app right now,
 * per the email+password account they signed up/logged in with. */
export async function getSiteUser(): Promise<User | null> {
  return getUserFromCookie(SITE_SESSION_COOKIE);
}
