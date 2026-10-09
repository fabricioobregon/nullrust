import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getGithubAuthorizeUrl } from "@/lib/auth/github";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const state = randomBytes(16).toString("hex");
  const redirectUri = new URL("/api/auth/github/callback", request.url).toString();

  const response = NextResponse.redirect(getGithubAuthorizeUrl(state, redirectUri));
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
