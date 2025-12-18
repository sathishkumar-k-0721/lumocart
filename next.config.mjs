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
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Optimize JavaScript bundle
  swcMinify: true,
  compress: true,
}

export default nextConfig
