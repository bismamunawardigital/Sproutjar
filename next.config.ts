import type { NextConfig } from "next";

const clerk = "https://clerk.sproutjar.app https://*.clerk.accounts.dev https://*.accounts.dev https://*.clerk.com https://*.clerk-telemetry.com";
const vercel = "https://vercel.live https://*.vercel.live https://*.vercel.app https://*.vercel.com https://*.vercel-insights.com";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""} ${clerk} ${vercel} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${clerk} ${vercel} https://img.clerk.com https://images.clerk.dev`,
  "font-src 'self' data:",
  `connect-src 'self' ${clerk} ${vercel} wss://*.vercel.live https://*.convex.cloud https://*.convex.site wss://*.convex.cloud https://*.elevenlabs.io wss://*.elevenlabs.io https://*.livekit.cloud wss://*.livekit.cloud https://*.livekit.io wss://*.livekit.io ${process.env.NODE_ENV === "development" ? "http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*" : ""}`,
  `frame-src 'self' ${clerk} ${vercel} https://challenges.cloudflare.com https://accounts.google.com https://appleid.apple.com`,
  "media-src 'self' blob: data: https://*.elevenlabs.io",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://clerk.sproutjar.app https://*.accounts.dev https://accounts.google.com https://appleid.apple.com",
  "frame-ancestors 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy-Report-Only", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
          ...(process.env.NODE_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
        ],
      },
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] },
    ];
  },
  // pdf-parse ships its own pdf.js build; bundling it breaks the worker lookup.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  // Vercel's file tracing misses the worker that pdf.js imports at runtime.
  outputFileTracingIncludes: {
    "/api/statement/pdf": [
      "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
    ],
  },
};

export default nextConfig;
