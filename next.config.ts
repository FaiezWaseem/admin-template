import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    adapterPath: require.resolve("next-bun-compile"),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
