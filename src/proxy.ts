import { NextRequest, NextResponse } from "next/server";
import { APP_SESSION_COOKIE, isValidAppSessionCookie } from "@/lib/auth/app-password";

// Renamed from "middleware" in this Next.js version — see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
// Defaults to (and as of this version, can only run on) the Node.js
// runtime, which is what node:crypto (used by isValidAppSessionCookie)
// needs — setting a `runtime` export here would throw.
export function proxy(request: NextRequest) {
  const cookie = request.cookies.get(APP_SESSION_COOKIE)?.value;
  if (isValidAppSessionCookie(cookie)) return NextResponse.next();

  const url = new URL("/login", request.url);
  url.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
