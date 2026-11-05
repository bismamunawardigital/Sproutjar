import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse ships its own pdf.js build; bundling it breaks the worker lookup.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
