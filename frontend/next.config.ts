import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/orders",
        destination: "/profile",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
