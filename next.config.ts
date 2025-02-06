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
  experimental: {},
  trailingSlash: false,
  pageExtensions: ["tsx", "ts"],
  
};

export default nextConfig;
