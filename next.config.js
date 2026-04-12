/** @type {import('next').NextConfig} */
const nextConfig = {
  // Handle images from external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hdmuscle.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.myshopify.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    unoptimized: true,
  },
  
  trailingSlash: true,
  poweredByHeader: false,
  
  reactStrictMode: true,
};

module.exports = nextConfig;