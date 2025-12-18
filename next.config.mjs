import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable to prevent double API calls in development
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'], // Modern formats for faster loading
    minimumCacheTTL: 60, // Cache images for 60 seconds
    deviceSizes: [640, 750, 828, 1080, 1200], // Mobile-first sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Smaller sizes for mobile
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Optimize JavaScript bundle
  swcMinify: true,
  compress: true,
  // Mobile optimizations
  poweredByHeader: false, // Remove X-Powered-By header (smaller response)
}

// PWA configuration for offline support and instant mobile loads
const config = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst', // Cache images aggressively
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /^\/api\/store-data$/,
      handler: 'StaleWhileRevalidate', // Show cached, fetch in background
      options: {
        cacheName: 'api-store-data',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60, // 1 minute
        },
      },
    },
    {
      urlPattern: /^\/api\//,
      handler: 'NetworkFirst', // Try network, fallback to cache
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 3, // Fallback to cache after 3s
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60,
        },
      },
    },
  ],
})(nextConfig);

export default config;
