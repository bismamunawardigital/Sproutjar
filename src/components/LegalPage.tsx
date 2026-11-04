import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LEGAL_UPDATED } from "@/lib/legal";

export type LegalSection = { title: string; body: React.ReactNode };

/** Privacy, terms and help share one quiet layout: short sections, one idea each. */
export function LegalPage({
  label,
  title,
  intro,
  sections,
  dated = true,
}: {
  label: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  dated?: boolean;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-rule bg-cream/95">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3">
          <Link href="/">
            <Logo />
          </Link>
          <Link href="/dashboard" className="text-[13px] font-bold text-ink-300">
            Back to the app
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-md px-5 py-8">
        <p className="label">{label}</p>
        <h1 className="mt-2 text-[24px] font-bold leading-snug text-ink-900">{title}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-500">{intro}</p>
        {dated ? <p className="mt-2 text-[12px] text-ink-300">Last updated {LEGAL_UPDATED}</p> : null}
        <div className="mt-6 space-y-3">
          {sections.map((section) => (
            <section key={section.title} className="rounded-card border border-rule bg-card p-5">
              <h2 className="text-[15px] font-bold text-ink-900">{section.title}</h2>
              <div className="mt-2 space-y-2 text-[14px] leading-relaxed text-ink-500">{section.body}</div>
            </section>
          ))}
        </div>
        <nav className="mt-8 flex flex-wrap gap-5 text-[13px] font-bold text-ink-400">
          <Link href="/privacy" className="underline underline-offset-2 hover:text-ink-700">Privacy</Link>
          <Link href="/terms" className="underline underline-offset-2 hover:text-ink-700">Terms</Link>
          <Link href="/help" className="underline underline-offset-2 hover:text-ink-700">Help</Link>
        </nav>
      </main>
    </div>
  );
}
