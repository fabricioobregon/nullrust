"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSessionCookieValue, SITE_SESSION_COOKIE } from "@/lib/auth/session";

const MIN_PASSWORD_LENGTH = 8;

function safeFrom(raw: string): string {
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
}

function redirectWithError(message: string, email: string, from: string): never {
  const params = new URLSearchParams({ error: message, email, from });
  redirect(`/signup?${params.toString()}`);
}

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const from = safeFrom(String(formData.get("from") ?? "/"));

  if (!email || !email.includes("@")) redirectWithError("Enter a valid email address.", email, from);
  if (password.length < MIN_PASSWORD_LENGTH) {
    redirectWithError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, email, from);
  }
  if (password !== confirmPassword) redirectWithError("Passwords don't match.", email, from);

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) redirectWithError("That email is already registered — log in instead.", email, from);

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({ data: { email, passwordHash } });

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
