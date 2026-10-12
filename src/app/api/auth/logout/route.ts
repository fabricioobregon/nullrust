import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, SITE_SESSION_COOKIE } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  // Clears both: the GitHub-identity session (used only by pushToGithub)
  // and the site-login session — one "Sign out" fully logs out, landing
  // back on /login via proxy.ts since site_session is now gone.
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(SITE_SESSION_COOKIE);
  return response;
}
