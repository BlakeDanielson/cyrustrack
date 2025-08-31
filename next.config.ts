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
  // Configure images for Vercel Blob storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
