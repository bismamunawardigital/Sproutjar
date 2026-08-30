import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Plant } from "@/components/Plant";

const PILLARS = [
  {
    title: "Every session has a reason",
    body: "A length, an agenda, and why that agenda. Ren remembers what it proposed last month and whether it worked, which is the thing a general assistant structurally cannot do.",
  },
  {
    title: "The stem grows on money, the roots on the work",
    body: "Principal cleared grows the plant upward. Sessions held and commitments kept grow it downward. A hard month still moves something.",
  },
  {
    title: "A date that moves when you tell the truth",
    body: "Every balance, every monthly rate with its annual equivalent, simulated month by month. Smallest-first against highest-rate, with the interest each one actually costs.",
  },
  {
    title: "A missed week costs you nothing here",
    body: "No red, no streaks, no guilt copy. The plant holds where it was and Ren asks what happened between deciding and the moment it didn't.",
  },
];

const SESSION_FLOW = [
  {
    title: "Contracting",
    body: "\u201cClearer, a decision, a plan, or somewhere to think out loud?\u201d Asked first, every time, so Ren doesn't solve a problem you didn't bring.",
  },
  {
    title: "Explore before intervening",
    body: "Reality first. Strengths, values and resources come after it's understood — never as a way around it.",
  },
  {
    title: "Options generated with you",
    body: "\u201cWhat could you do?\u201d Then silence. Then \u201cwhat else?\u201d Ren offers its own only once yours are out, and asks first.",
  },
  {
    title: "One commitment you actually own",
    body: "With a trigger, and an honest check: do you intend to do that, or does it just sound right while we're talking? If you hedge, it shrinks.",
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
              Sproutjar is debt recovery coaching for people carrying{" "}
              <span className="n">20,000</span> to <span className="n">150,000</span> across cards
              and BNPL. Ren is the coach inside it — a voice you talk to weekly, who holds the plan
              so you don&rsquo;t have to keep it all in your head.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-full bg-stem-600 px-6 py-3 text-[15px] font-bold text-white transition hover:bg-stem-700"
              >
                Meet Ren
              </Link>
              <p className="text-[13px] text-ink-400">
                Demo account: three cards, eleven weeks, six sessions.
              </p>
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
                Ren opens knowing your balances, what the interest costs you this month and what you
                said you&rsquo;d do last time. It never opens by asking for data.
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
          <p className="label">How a session runs</p>
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
          <p className="label">What Ren will not do</p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-400">
            No regulated financial advice, no product recommendations, no legal characterisation of
            your situation and no religious rulings. Ren describes exactly how a contract works and
            routes you to your bank, the Central Bank, or a professional for anything that turns on
            a ruling. Jurisdiction-specific facts are checked against your country first.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-block rounded-full bg-ink-800 px-5 py-2.5 text-[14px] font-bold text-cream transition hover:bg-ink-700"
          >
            Open the demo
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
