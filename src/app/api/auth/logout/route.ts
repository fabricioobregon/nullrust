import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { APP_SESSION_COOKIE } from "@/lib/auth/app-password";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  // Clears both: the GitHub-identity session (used only by pushToGithub)
  // and the site-wide password gate — one "Sign out" fully logs out,
  // landing back on /login via middleware since app_session is now gone.
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(APP_SESSION_COOKIE);
  return response;
}
