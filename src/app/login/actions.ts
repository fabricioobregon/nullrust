"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { APP_SESSION_COOKIE, checkPassword, createAppSessionCookieValue } from "@/lib/auth/app-password";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const rawFrom = String(formData.get("from") ?? "/");
  // Guard against an open redirect via a crafted `from` value — only ever
  // follow a same-site path, never an absolute/external URL.
  const from = rawFrom.startsWith("/") && !rawFrom.startsWith("//") ? rawFrom : "/";

  if (!checkPassword(password)) {
    redirect(`/login?error=${encodeURIComponent("Incorrect password.")}&from=${encodeURIComponent(from)}`);
  }

  const store = await cookies();
  store.set(APP_SESSION_COOKIE, createAppSessionCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  redirect(from);
}
