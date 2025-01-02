import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // AWS Configuration
    NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
    NEXT_PUBLIC_AWS_USER_POOL_ID: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
    NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID,
    
    // Azure DB Configuration
    AZURE_DB_USER: process.env.AZURE_DB_USER,
    AZURE_DB_PASSWORD: process.env.AZURE_DB_PASSWORD,
    AZURE_DB_NAME: process.env.AZURE_DB_NAME,
    AZURE_DB_SERVER: process.env.AZURE_DB_SERVER,

    // Azure OpenAI Configuration
    NEXT_PUBLIC_AZURE_OPENAI_API_KEY: process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY,
    NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT,
    NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT_NAME: process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT_NAME,
  },
};

export default nextConfig;
