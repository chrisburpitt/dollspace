import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Allow up to 3MB for image uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '3mb',
    },
  },
  // 2. Keep your existing development origin rules
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // If you need the specific allowed origins flag in newer Next versions:
  async headers() {
    return [];
  }
};

export default nextConfig;
