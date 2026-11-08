import type { Metadata } from "next";

export const SITE_DESCRIPTION = "A payoff plan for your cards, with Ren, an AI voice coach for money habits in the Gulf.";

const PAGES: Record<string, { path: string; description: string }> = {
  "Sproutjar: grow out of debt habits into savings habits": { path: "/", description: SITE_DESCRIPTION },
  "Today · Sproutjar": { path: "/dashboard", description: "Your next money step, card payment plan and check-in with Ren, your AI voice coach." },
  "Your plan · Sproutjar": { path: "/dashboard/plan", description: "Your cards, savings jars and estimated payoff plan, using the figures you confirmed." },
  "Ren, your AI coach · Sproutjar": { path: "/dashboard/ren", description: "Choose a topic for Ren, your AI voice coach, and revisit your saved talks and next steps." },
  "You · Sproutjar": { path: "/dashboard/you", description: "Your money story, budget, preferences and account privacy controls." },
  "Sign in · Sproutjar": { path: "/sign-in", description: "Sign in to your Sproutjar plan and keep your numbers and coaching steps together." },
  "Your first plan · Sproutjar": { path: "/onboarding", description: "Start with your own words and confirmed card figures to build your first Sproutjar plan." },
  "Privacy · Sproutjar": { path: "/privacy", description: "How Sproutjar handles personal data, voice coaching and your privacy choices." },
  "Terms · Sproutjar": { path: "/terms", description: "The terms for using Sproutjar, its estimates and AI coaching services." },
  "Help · Sproutjar": { path: "/help", description: "Help with Sproutjar, your figures, Ren calls and contacting support." },
  "Delete my account · Sproutjar": { path: "/delete-public", description: "How to delete your Sproutjar account and request help with provider-held transcripts." },
  "Account deleted · Sproutjar": { path: "/account-deleted", description: "Your Sproutjar account deletion confirmation and provider transcript request guidance." },
  "Sproutjar: how it was researched, designed and built": { path: "/case-study", description: "The research, design decisions and engineering behind Sproutjar." },
  "Sproutjar: pitch deck": { path: "/deck", description: "The Sproutjar pitch deck and live product demonstration." },
};

export function pageMetadata(title: string, description?: string): Metadata {
  const page = PAGES[title];
  description ??= page?.description ?? SITE_DESCRIPTION;
  return {
    title,
    description,
    alternates: page ? { canonical: page.path } : undefined,
    robots: page && /^\/(dashboard|onboarding|sign-in|account-deleted)/.test(page.path) ? { index: false, follow: false } : undefined,
    openGraph: {
      title, description, url: page?.path, siteName: "Sproutjar", type: "website",
      images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Sproutjar. A plan for your cards. Ren, your AI voice coach." }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image.png"] },
  };
}
