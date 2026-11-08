import type { Metadata } from "next";

export const SITE_DESCRIPTION = "A payoff plan for your cards, with Ren, an AI voice coach for money habits in the Gulf.";

export function pageMetadata(title: string, description = SITE_DESCRIPTION): Metadata {
  return {
    title,
    description,
    openGraph: {
      title, description, siteName: "Sproutjar", type: "website",
      images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Sproutjar. A plan for your cards. Ren, your AI voice coach." }],
    },
  };
}
