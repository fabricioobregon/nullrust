import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app has real mutating actions behind simple GET/POST pages (delete
  // project/repo, OAuth login) with no other framing protection — worth the
  // baseline headers even for a low-traffic personal tool.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
