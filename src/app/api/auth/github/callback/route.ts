import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/auth/crypto";
import { exchangeCodeForToken, fetchGithubProfile } from "@/lib/auth/github";
import { createSessionCookieValue, SESSION_COOKIE } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.cookies.get("oauth_state")?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/?error=github_auth_failed", request.url));
  }

  const redirectUri = new URL("/api/auth/github/callback", request.url).toString();
  const accessToken = await exchangeCodeForToken(code, redirectUri);
  const profile = await fetchGithubProfile(accessToken);
  const encryptedGithubToken = encrypt(accessToken);

  const user = await db.user.upsert({
    where: { githubId: profile.id },
    create: {
      githubId: profile.id,
      githubLogin: profile.login,
      githubAvatarUrl: profile.avatarUrl,
      encryptedGithubToken,
    },
    update: {
      githubLogin: profile.login,
      githubAvatarUrl: profile.avatarUrl,
      encryptedGithubToken,
    },
  });

  // One-time bridge for data that predates user accounts: if this user is
  // the only one who has ever signed in, claim every still-unowned project
  // instead of leaving pre-existing projects permanently orphaned.
  const userCount = await db.user.count();
  if (userCount === 1) {
    await db.project.updateMany({ where: { ownerId: null }, data: { ownerId: user.id } });
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(SESSION_COOKIE, createSessionCookieValue(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
  response.cookies.delete("oauth_state");
  return response;
}
