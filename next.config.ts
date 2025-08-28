import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ESLint will run during builds and fail if there are errors
  eslint: {
    ignoreDuringBuilds: false,
  },
  // TypeScript errors will fail the build
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
