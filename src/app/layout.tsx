import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-4">
            <a href="/" className="text-lg font-semibold tracking-tight">
              AGENTS<span className="text-indigo-600">.md</span> Builder
            </a>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
