import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    incomingRequests: {
      ignore: [/^\/api\/.*/],
    },
  },
};

export default nextConfig;
