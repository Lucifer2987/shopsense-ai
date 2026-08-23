import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Proxy /api/* to the Flask backend so CORS is never needed
  // Browser calls http://localhost:3000/api/* → Next.js → http://localhost:5000/api/*
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
