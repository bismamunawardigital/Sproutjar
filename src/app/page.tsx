import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Plant } from "@/components/Plant";

const PILLARS = [
  {
    title: "Ren remembers",
    body: "Every call has a length and a subject, and Ren knows what you tried last month and whether it worked. You never start from scratch.",
  },
  {
    title: "One plant, growing two ways",
    body: "Money you pay off grows the stem. Turning up and doing what you said grows the roots. Even a hard month moves something.",
  },
  {
    title: "A real date, not a guess",
    body: "Every balance and rate, worked out month by month. See what paying the smallest card first costs you against paying the priciest first.",
  },
  {
    title: "A bad week costs you nothing here",
    body: "No streaks, no red, no telling you off. The plant stays where it is and Ren just asks what got in the way.",
  },
];

const SESSION_FLOW = [
  {
    title: "Ren asks what you need",
    body: "Clearer on something, a decision, a plan, or just somewhere to think out loud? Asked first, every time, so Ren doesn't fix a problem you didn't bring.",
  },
  {
    title: "You talk, Ren listens",
    body: "No advice until Ren actually understands the situation. Nothing gets glossed over to get to the encouraging bit.",
  },
  {
    title: "Your ideas first",
    body: "\u201cWhat could you do?\u201d Then quiet. Then \u201cwhat else?\u201d Ren only adds its own once yours are out, and asks before it does.",
  },
  {
    title: "One small thing, your choice",
    body: "Small enough to fit your week, tied to something you already do. If you're not sure about it, it gets smaller — never bigger.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-20 border-b border-rule bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3.5">
          <Logo />
          <Link
            href="/dashboard"
            className="rounded-full bg-ink-800 px-4 py-2 text-[13px] font-bold text-cream transition hover:bg-ink-700"
          >
            Open the demo
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pb-20">
        <section className="grid items-center gap-8 py-12 sm:grid-cols-2 sm:py-16">
          <div>
            <span className="chip c-grow">UAE and Qatar</span>
            <h1 className="mt-4 text-[34px] font-extrabold leading-[1.1] tracking-[-0.02em] text-ink-900 sm:text-[42px]">
              You already know what you should do. This is about why it doesn&rsquo;t happen.
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-500">
              Sproutjar helps people carrying <span className="n">20,000</span> to{" "}
              <span className="n">150,000</span> across credit cards get out from under it. Ren is
              the coach — someone you talk to each week, who keeps track of the plan so you
              don&rsquo;t have to hold it all in your head.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/onboarding"
                className="rounded-full bg-stem-600 px-6 py-3 text-[15px] font-bold text-white transition hover:bg-stem-700"
              >
                Set it up with your numbers
              </Link>
              <Link href="/dashboard" className="text-[13px] font-bold text-ink-400 underline">
                Or look around the demo first
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <Plant
              state={{ stemPct: 0.58, leafPairs: 3, rootDepth: 4, sparks: false, cleared: false }}
              className="w-64 sm:w-full"
            />
          </div>
        </section>

        <section className="rounded-card bg-ink-800 p-6 text-cream sm:p-8">
          <div className="flex items-start gap-5">
            <span className="ren-orb orb-listening h-16 w-16 shrink-0 rounded-full" />
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-leaf-300">
                Ren
              </p>
              <p className="mt-2 text-[19px] font-bold leading-snug sm:text-[22px]">
                &ldquo;I&rsquo;m a coach, not a bank and not your mum. I won&rsquo;t lecture you, I
                won&rsquo;t be shocked by a number, and I won&rsquo;t pretend a bad month
                didn&rsquo;t happen.&rdquo;
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-cream/70">
                Ren already knows your balances, what the interest is costing you this month, and
                what you were trying last time. You never have to explain it again.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="rounded-card border border-rule bg-card p-5">
              <h2 className="text-[17px] font-bold leading-snug text-ink-900">{pillar.title}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-400">{pillar.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <p className="label">How a call with Ren goes</p>
          <ol className="mt-4 space-y-4 border-l border-rule pl-5">
            {SESSION_FLOW.map((step, index) => (
              <li key={step.title} className="relative">
                <span className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full bg-stem" />
                <p className="text-[15px] font-bold text-ink-900">
                  <span className="n mr-2 text-ink-300">{index + 1}</span>
                  {step.title}
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-400">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10 rounded-card border border-rule bg-card p-5 sm:p-6">
          <p className="label">What Ren won&rsquo;t do</p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-400">
            Ren won&rsquo;t sell you a product, tell you where your case stands legally, or give you
            a religious ruling. It will explain exactly how a contract works, and send you to your
            bank, the Central Bank or a professional for anything that needs an actual ruling.
            Anything country-specific is checked against where you live first.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-block rounded-full bg-ink-800 px-5 py-2.5 text-[14px] font-bold text-cream transition hover:bg-ink-700"
          >
            Have a look
          </Link>
        </section>
      </main>

      <footer className="border-t border-rule py-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5">
          <Logo />
          <p className="text-[12px] text-ink-300">Coaching, not advice.</p>
        </div>
      </footer>
    </div>
  );
}
