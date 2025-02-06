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
  trailingSlash: false,
  pageExtensions: ["tsx", "ts", "js"], // Ensure JS files are considered as well
};

export default nextConfig;
