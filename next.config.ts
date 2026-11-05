import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
