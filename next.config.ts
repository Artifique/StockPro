import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
  allowedDevOrigins: [
    "localhost",
    ".space.z.ai",
    "preview-chat-534c9948-d5d2-42f6-afbd-34840d76c1ea.space.z.ai",
  ],
};

export default nextConfig;
