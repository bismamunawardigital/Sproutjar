import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { DeckViewer } from "./DeckViewer";
import { deckSlides } from "./slides";
import "./deck.css";

export const metadata: Metadata = {
  title: "Sproutjar: pitch deck",
  description:
    "The Sproutjar pitch deck: a voice coach for salaried people clearing credit card debt across the GCC, the research behind it, the product live today, and the business model.",
  robots: { index: false, follow: false },
};

const PDF_PATH = "/deck/Sproutjar-pitch-deck.pdf";

export default function DeckPage() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="deck-chrome sticky top-0 z-20 border-b border-rule bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-5 py-3.5">
          <Link href="/" aria-label="Sproutjar home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/case-study"
              className="hidden rounded-full px-3 py-2 text-[13px] font-bold text-ink-700 transition hover:text-ink-900 sm:inline-block"
            >
              Case study
            </Link>
            <a
              href={PDF_PATH}
              download
              className="whitespace-nowrap rounded-full border border-rule bg-card px-4 py-2 text-[13px] font-bold text-ink-900 transition hover:bg-cream-2"
            >
              <span className="sm:hidden">PDF</span>
              <span className="hidden sm:inline">Download PDF</span>
            </a>
            <Link
              href="/dashboard"
              className="whitespace-nowrap rounded-full bg-ink-800 px-4 py-2 text-[13px] font-bold text-cream transition hover:bg-ink-700"
            >
              Try the live app
            </Link>
          </nav>
        </div>
      </header>

      <main className="deck-page mx-auto max-w-[1280px] px-5 pb-16 pt-6 sm:pt-8">
        <div className="deck-chrome mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 sm:mb-6">
          <h1 className="text-[15px] font-extrabold uppercase tracking-[0.08em] text-stem-700">
            Pitch deck
          </h1>
          <p className="text-[13px] text-ink-500">
            {deckSlides.length} slides, September 2026. Scroll, or{" "}
            <a href={PDF_PATH} download className="font-bold text-ink-900 underline underline-offset-2">
              download the PDF
            </a>
            .
          </p>
        </div>
        <DeckViewer slides={deckSlides} />
      </main>
    </div>
  );
}
