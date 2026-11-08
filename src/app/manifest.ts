import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "@/lib/metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Sproutjar",
    short_name: "Sproutjar",
    description: SITE_DESCRIPTION,
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f2ede4",
    theme_color: "#22302a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
