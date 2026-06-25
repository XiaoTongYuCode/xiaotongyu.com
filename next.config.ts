import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.183"],
  devIndicators: false,
  turbopack: {
    rules: {
      "*.mp3": {
        type: "asset",
      },
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.mp3$/i,
      type: "asset/resource",
    });

    return config;
  },
};

export default nextConfig;
