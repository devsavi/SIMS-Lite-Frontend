import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict React mode
  reactStrictMode: true,

  // Output for production deployment (standalone for Docker/containers)
  // output: "standalone",

  // Compression
  compress: true,

  // Image optimisation domains — add backend domain when known
  images: {
    remotePatterns: [],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // TypeScript errors fail the build
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
