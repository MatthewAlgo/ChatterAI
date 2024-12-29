import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
    NEXT_PUBLIC_AWS_USER_POOL_ID: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
    NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID,
  },
};

export default nextConfig;
