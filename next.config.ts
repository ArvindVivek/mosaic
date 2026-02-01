import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.valorant-api.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'titles.trackercdn.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
