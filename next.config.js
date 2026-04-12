/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hdmuscle.com',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

module.exports = nextConfig;