import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['geist'],
  // Ensure the app runs on the port provided by Render
  async serverRuntimeConfig() {
    return {
      port: process.env.PORT || 3000,
    };
  },
  // Optimize for production deployment
  output: 'standalone',
  experimental: {
    // Enable server actions if needed
    serverActions: true,
  },
};

export default nextConfig;
