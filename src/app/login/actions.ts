"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionCookieValue, SITE_SESSION_COOKIE } from "@/lib/auth/session";

/** Only ever follow a same-site path from an untrusted `from` field — never
 * an absolute/external URL (open-redirect guard). */
function safeFrom(raw: string): string {
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const from = safeFrom(String(formData.get("from") ?? "/"));

  const user = email ? await db.user.findUnique({ where: { email } }) : null;
  const valid = user?.passwordHash ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !valid) {
    redirect(`/login?error=${encodeURIComponent("Incorrect email or password.")}&from=${encodeURIComponent(from)}`);
  }

  const store = await cookies();
  store.set(SITE_SESSION_COOKIE, createSessionCookieValue(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  redirect(from);
}
