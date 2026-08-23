import type { NextConfig } from "next";

// Server-side backend URL:
//   Local:      http://localhost:5000  (default fallback)
//   Production: set BACKEND_URL env var on Vercel to your Render service URL
//               e.g. https://shopsense-ai-backend.onrender.com
//
// IMPORTANT: BACKEND_URL is a server-side-only variable (no NEXT_PUBLIC_ prefix).
// It is used ONLY by the Next.js proxy rewrite — never sent to the browser.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Proxy /api/* requests through Next.js to the Flask backend.
  // This eliminates all CORS issues — the browser always talks to the same origin.
  // Browser → Next.js (/api/*) → Flask (BACKEND_URL/api/*)
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
