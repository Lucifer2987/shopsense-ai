import type { NextConfig } from "next";

// API proxy is handled by src/middleware.ts at request time (Edge Runtime).
// This reads process.env.BACKEND_URL live on every request — no URLs baked
// into build manifests. Set BACKEND_URL on Vercel to your Render service URL.

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
