import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Exclude scripts directory from type checking during build
    tsconfigPath: "./tsconfig.build.json",
  },
};

export default nextConfig;
