import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["fictional-goggles-979x44xx49p537gwr-3000.github.dev", "localhost:3000"]
    }
  }
  
};

export default nextConfig;
