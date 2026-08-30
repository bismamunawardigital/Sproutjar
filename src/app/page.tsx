import Link from "next/link";
import { ArrowRight, CalendarCheck, HeartHandshake, Mic, Sprout, TrendingDown } from "lucide-react";
import { Logo } from "@/components/Logo";

const PILLARS = [
  {
    icon: Mic,
    title: "Ren, out loud",
    body: "A voice coach who runs a real coaching session — check in, agenda, strengths, one commitment — instead of a chatbot that hands you a spreadsheet.",
  },
  {
    icon: TrendingDown,
    title: "A date, not a vibe",
    body: "Every card, every monthly rate, simulated month by month. Snowball against avalanche, side by side, with the interest each one actually costs.",
  },
  {
    icon: Sprout,
    title: "Jars before the attack",
    body: "One month of essentials goes in a jar first, because without it the next surprise bill goes straight back on the card.",
  },
  {
    icon: HeartHandshake,
    title: "No shame in the room",
    body: "Positive psychology, not lectures. Ren names the strength that got you here before touching a single number.",
  },
];

const FLOW = [
  { step: "01", title: "Check in", body: "How the week with money actually felt, and one thing that went right." },
  { step: "02", title: "Set the agenda", body: "One sentence in your words: a number, a plan, or a clearer head." },
  { step: "03", title: "Face the numbers", body: "Ren pulls your live balances and today's real transfer offers mid-call." },
  { step: "04", title: "Leave with one thing", body: "A single if-then commitment, saved to your dashboard with a date." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-20 border-b border-sand/70 bg-cream/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="flex items-center gap-6 text-sm">
            <a href="#how" className="hidden text-ink-soft transition hover:text-bark sm:block">
              How a session runs
            </a>
            <Link
              href="/dashboard"
              className="rounded-full bg-bark px-5 py-2.5 font-medium text-cream transition hover:bg-moss"
            >
              Open the app
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="grain relative overflow-hidden">
          <div className="pointer-events-none absolute -right-40 -top-32 h-[28rem] w-[28rem] rounded-full bg-sprout/25 blur-3xl" />
          <div className="pointer-events-none absolute -left-52 top-40 h-96 w-96 rounded-full bg-clay/10 blur-3xl" />
          <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 sm:pt-28">
            <p className="rise inline-flex items-center gap-2 rounded-full border border-moss/25 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-moss">
              Financial wellness · Gulf-first
            </p>
            <h1 className="rise mt-7 max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              Talk your way out of
              <span className="text-moss"> credit card debt.</span>
            </h1>
            <p className="rise mt-7 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Sproutjar is a life-coaching app for money. You speak to Ren, a voice coach trained on
              positive psychology and Gulf debt reality. Ren does the arithmetic live, gives you a
              debt-free date, and holds you to exactly one commitment at a time.
            </p>
            <div className="rise mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-full bg-moss px-7 py-3.5 font-medium text-white shadow-lg shadow-moss/20 transition hover:bg-bark"
              >
                Start a session with Ren
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-bark/15 px-7 py-3.5 font-medium text-bark transition hover:border-bark/40"
              >
                See how a session runs
              </a>
            </div>

            <dl className="mt-20 grid gap-px overflow-hidden rounded-2xl border border-sand bg-sand sm:grid-cols-3">
              {[
                ["Six GCC countries", "AED, QAR, SAR, KWD, BHD, OMR — never mixed in one conversation."],
                ["Sharia-aware", "Profit rate, not interest, the moment you mention an Islamic card."],
                ["One commitment", "Every session closes with a single if-then plan you said out loud."],
              ].map(([term, detail]) => (
                <div key={term} className="bg-cream px-6 py-7">
                  <dt className="font-display text-lg font-semibold">{term}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="border-y border-sand bg-cream-deep">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
              A coach, a calculator, and a jar — in one call.
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {PILLARS.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-sand bg-cream p-7 transition hover:border-moss/40"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-moss/10 text-moss">
                    <Icon size={21} />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                  <p className="mt-2.5 leading-relaxed text-ink-soft">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">How a session runs</h2>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Ren never announces the phases. You just have a conversation. Underneath, it follows a
            coaching arc that ends somewhere concrete.
          </p>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map(({ step, title, body }) => (
              <li key={step} className="relative rounded-2xl border border-sand bg-white/60 p-6">
                <span className="font-display text-4xl font-semibold text-sprout">{step}</span>
                <h3 className="mt-3 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-14 flex flex-col gap-6 rounded-3xl border border-moss/20 bg-moss/5 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <CalendarCheck className="mt-1 shrink-0 text-moss" size={24} />
              <p className="max-w-xl leading-relaxed">
                <span className="font-medium">Every plan ends with a date.</span>{" "}
                <span className="text-ink-soft">
                  Total debt divided by real surplus, simulated with compounding — so Ren can say
                  &ldquo;you are free in fourteen months, that is October next year, and you will
                  still be in your twenties.&rdquo;
                </span>
              </p>
            </div>
            <Link
              href="/dashboard"
              className="shrink-0 rounded-full bg-bark px-6 py-3 text-center font-medium text-cream transition hover:bg-moss"
            >
              Get my date
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-sand">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p className="max-w-md">
            Sproutjar is a coaching tool, not a bank, a licensed financial advisor, or a debt
            collector. Hardship, restructuring or legal trouble belongs with a human at your bank.
          </p>
        </div>
      </footer>
    </div>
  );
}
