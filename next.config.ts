import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/schedule": ["./backend/*.py", "./backend/requirements.txt"],
  },
};

export default nextConfig;
