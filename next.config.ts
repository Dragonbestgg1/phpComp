import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
    };
    return config;
  },
  output: "standalone",
  assetPrefix: process.env.NODE_ENV === "production" ? "" : undefined,
  experimental: {

  },
  trailingSlash: false,
};

export default nextConfig;
