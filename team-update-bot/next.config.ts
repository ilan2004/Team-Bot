import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

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

const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
});

export default pwaConfig(nextConfig);
