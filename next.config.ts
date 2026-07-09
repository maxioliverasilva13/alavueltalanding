import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "localhost",
    "*.localhost",
    "alavueltaapp.com",
    "*.alavueltaapp.com",
    "alavueltaapp.pro",
    "*.alavueltaapp.pro",
  ],
};

export default nextConfig;
