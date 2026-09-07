import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,   
  },
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
};

export default nextConfig;
