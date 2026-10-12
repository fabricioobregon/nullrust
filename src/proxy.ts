import { NextRequest, NextResponse } from "next/server";
import { SITE_SESSION_COOKIE, verifySessionCookieValue } from "@/lib/auth/session";

// Renamed from "middleware" in this Next.js version — see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
// Defaults to (and as of this version, can only run on) the Node.js
// runtime, which is what node:crypto (used by verifySessionCookieValue)
// needs — setting a `runtime` export here would throw.
export function proxy(request: NextRequest) {
  const cookie = request.cookies.get(SITE_SESSION_COOKIE)?.value;
  if (cookie && verifySessionCookieValue(cookie)) return NextResponse.next();

  const url = new URL("/login", request.url);
  url.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!login|signup|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
