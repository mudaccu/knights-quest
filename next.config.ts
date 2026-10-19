import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The floating dev badge overlaps the mobile navigation while developing.
  devIndicators: false,
};

export default nextConfig;
