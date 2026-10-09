import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AGENTS.md Builder",
  description: "Configure your stack and conventions, then generate an AGENTS.md file.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              AGENTS<span className="text-indigo-600">.md</span> Builder
            </Link>
            {user && (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 text-sm text-slate-600">
                  {user.githubAvatarUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.githubAvatarUrl} alt="" className="h-6 w-6 rounded-full" />
                  )}
                  {user.githubLogin}
                </span>
                <form action="/api/auth/logout" method="post">
                  <button type="submit" className="text-sm text-slate-500 hover:text-slate-700">
                    Sign out
                  </button>
                </form>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
