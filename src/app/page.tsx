import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { HeroPlant } from "@/components/HeroPlant";
import { Logo } from "@/components/Logo";
import { Plant } from "@/components/Plant";
import { formatMoney, formatRate } from "@/lib/money";

export const metadata: Metadata = {
  title: "Sproutjar: grow out of debt habits into savings habits",
  description:
    "A positive-psychology financial wellness coach you can call. Sproutjar starts with a realistic payoff plan for credit-card debt in the Gulf, then Ren helps you keep the habit when life gets messy.",
};

const CURRENCY = "AED";

const STARTER_OPTIONS = [
  "I make a budget and never stick to it",
  "Something always knocks me off track mid-month",
  "I am not sure what I want my money to do for me",
  "I want one small habit I can actually keep",
];

const REN_STRENGTHS = [
  {
    title: "Life coaching techniques",
    body: "Open questions, reflection and one clear commitment per call. The methods good coaches use, brought into your everyday money life.",
    icon: "chat",
  },
  {
    title: "Positive psychology",
    body: "Ren starts from what already works for you, not from what is wrong with you. Strengths first, then the gap.",
    icon: "sun",
  },
  {
    title: "Goals in your own words",
    body: "Ren helps you work out what you actually want your money to do, then turns it into a goal that belongs to you.",
    icon: "target",
  },
  {
    title: "Accountability that grows with you",
    body: "Ren remembers what you said you would do, notices what got in the way, and helps you keep the plan growing.",
    icon: "sprout",
  },
] as const;

const EXAMPLE_CARDS = [
  { name: "Emirates NBD", balance: 18500, monthlyRate: 0.0325, minimum: 1110, focus: true },
  { name: "ADCB", balance: 12400, monthlyRate: 0.0299, minimum: 744, focus: false },
  { name: "FAB", balance: 8200, monthlyRate: 0.035, minimum: 492, focus: false },
];
const EXAMPLE_MONTHLY_ATTACK = 6500;
const EXAMPLE_OPENING = 87645;
const EXAMPLE_CURRENT = 39100;

const CALL_STAGES = [
  {
    when: "Before the call",
    body: "Ren has already read your balances, your last commitment and what happened since. If you are not sure what to talk about, it suggests two or three agendas and you pick one.",
  },
  {
    when: "During the call",
    body: "You talk, Ren listens. It asks what you want from the time, reflects your own words back, and asks before it challenges you. No lectures, no scripts.",
  },
  {
    when: "After the call",
    body: "One goal and one commitment, written to the screen in your words. The next call opens on what you intended, what you did and what you learned.",
  },
];

const COMPARISON = [
  {
    need: "Remembers your balances and what you said last time",
    other: "ChatGPT starts from zero each chat",
  },
  {
    need: "Builds a payoff plan from your real cards and rates",
    other: "A spreadsheet does the maths once, then goes quiet",
  },
  {
    need: "Re-plans when a month goes wrong",
    other: "You rebuild the sheet, or the app turns red",
  },
  {
    need: "Someone to talk to on payday",
    other: "A human coach helps, but weekly sessions cost more than most people in debt can justify",
  },
  {
    need: "Ends every call with one goal and one commitment",
    other: "No memory of what you promised yourself",
  },
  {
    need: "Coaching structure inside your everyday financial life",
    other: "Tracking or talking, rarely both",
  },
];

const FAQ = [
  {
    q: "Is this financial advice?",
    a: "No. Sproutjar is coaching, not financial, legal or religious advice. Ren can explain how a plan works and send you to your bank, regulator or a qualified professional for anything that needs a ruling.",
  },
  {
    q: "Which countries is it for?",
    a: "The Gulf and wider GCC: UAE, Saudi Arabia, Qatar, Kuwait, Bahrain and Oman. Card terms, rate conventions and regulatory caps are checked against where you live.",
  },
  {
    q: "Do I have to link my bank?",
    a: "No. You enter balances, rates and minimums by hand today. Soon you will be able to upload a card statement and let Sproutjar read the numbers for you. Either way, nothing moves without your tap.",
  },
  {
    q: "What does Ren know about me?",
    a: "Ren reads the numbers and notes you have entered, plus the goals and commitments from previous calls, before it speaks. It never starts from scratch and it never pretends to know something it does not.",
  },
  {
    q: "What happens when I click Plant the first seed?",
    a: "You answer a few quick questions, then see your first coaching agenda and start building your plan. The questions take a couple of minutes and you can change your answers later.",
  },
];

const WAVE_BARS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden>
      <circle cx="10" cy="10" r="10" fill="#DEEADF" />
      <path d="M6 10.5l2.5 2.5 5.5-6" stroke="#2F6243" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function PrimaryCta({ href, className = "" }: { href: string; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full bg-stem-700 px-6 py-3 text-[16px] font-bold text-white shadow-sh-2 transition hover:bg-stem-600 hover:shadow-sh-3 ${className}`}
    >
      Plant the first seed
      <ArrowRight className="ml-2 h-4 w-4" />
    </Link>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink-900 sm:text-[34px]">{children}</h2>
  );
}

function StrengthIcon({ icon }: { icon: (typeof REN_STRENGTHS)[number]["icon"] }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden {...common}>
      {icon === "chat" ? <path d="M4 5h16v11H9l-5 4V5zM8 9h8M8 12h5" /> : null}
      {icon === "sun" ? <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z" /> : null}
      {icon === "target" ? <path d="M12 3a9 9 0 100 18 9 9 0 000-18zM12 8a4 4 0 100 8 4 4 0 000-8zM12 12h.01" /> : null}
      {icon === "sprout" ? <path d="M12 21v-8M12 13c0-4 3-7 8-7 0 4-3 7-8 7zM12 13c0-3-2.5-5.5-6-5.5 0 3.5 2.5 5.5 6 5.5" /> : null}
    </svg>
  );
}

function StarterCard() {
  return (
    <div className="rounded-card border border-rule bg-card p-5 shadow-sh-2 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="label">Your first agenda</p>
        <span className="chip c-neutral">Example</span>
      </div>
      <p className="mt-3 text-[17px] font-bold text-ink-900">Pick the one that sounds most like you</p>
      <ul className="mt-4 space-y-2">
        {STARTER_OPTIONS.map((question, i) => {
          const chosen = i === 1;
          return (
            <li
              key={question}
              className={`flex items-center gap-3 rounded-sm border px-3.5 py-3 text-[14px] ${
                chosen ? "border-stem bg-leaf-50 font-bold text-ink-900" : "border-rule bg-cream text-ink-700"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  chosen ? "border-stem-700 bg-stem-700" : "border-ink-300"
                }`}
                aria-hidden
              >
                {chosen ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
              </span>
              {question}
            </li>
          );
        })}
      </ul>
      <div className="mt-5 flex items-start gap-3 rounded-sm bg-ink-800 p-4 text-cream">
        <span className="ren-orb orb-listening mt-0.5 h-8 w-8 shrink-0 rounded-full" aria-hidden />
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-leaf-300">Ren suggests</p>
          <p className="mt-1 text-[15px] font-bold leading-snug">Find what knocks the month over</p>
          <p className="mt-1 text-[13px] leading-relaxed text-cream/75">
            Let us walk through your last three months and spot the one thing that keeps throwing the plan off. Then we
            plan around it, not against it. About ten minutes.
          </p>
        </div>
      </div>
    </div>
  );
}

function ExamplePlanCard() {
  return (
    <div className="rounded-card border border-rule bg-card p-5 shadow-sh-2">
      <div className="flex items-center justify-between gap-3">
        <p className="label">Your plan</p>
        <span className="chip c-neutral">Example</span>
      </div>
      <div className="mt-4 divide-y divide-rule">
        {EXAMPLE_CARDS.map((card) => (
          <div key={card.name} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-[15px] font-bold text-ink-900">
                {card.name}
                {card.focus ? <span className="chip c-grow">Start here</span> : null}
              </p>
              <p className="n text-[15px] text-ink-900">{formatMoney(card.balance, CURRENCY)}</p>
            </div>
            <p className="mt-1 text-[12px] text-ink-400">
              {formatRate(card.monthlyRate)} · min <span className="n">{formatMoney(card.minimum, CURRENCY)}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-sm bg-cream p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[12px] font-bold text-ink-500">Pay towards your cards each month</p>
            <p className="n text-[22px] font-extrabold text-stem-700">{formatMoney(EXAMPLE_MONTHLY_ATTACK, CURRENCY)}</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] font-bold text-ink-500">Order</p>
            <p className="text-[15px] font-bold text-ink-900">Highest interest rate first</p>
          </div>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
          Pay minimums on every card, put the rest on Emirates NBD. Debt-free in <span className="n">14</span> months.
        </p>
      </div>
      <div className="mt-5 flex items-center gap-4 rounded-sm bg-cream-2 p-4">
        <Plant state={{ stemPct: 0.55, leafPairs: 3, rootDepth: 4, sparks: false, cleared: false }} className="h-20 w-20" />
        <div>
          <p className="text-[12px] font-bold text-ink-500">Principal cleared</p>
          <p className="n text-[17px] text-ink-900">{formatMoney(EXAMPLE_OPENING - EXAMPLE_CURRENT, CURRENCY)}</p>
          <p className="text-[12px] text-ink-400">
            of <span className="n">{formatMoney(EXAMPLE_OPENING, CURRENCY)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function RenCallCard() {
  return (
    <div className="rounded-card border border-rule bg-card p-6 shadow-sh-2 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <p className="label">Tuesday, after payday</p>
        <span className="chip c-grow">20 min</span>
      </div>
      <div className="mt-8 flex flex-col items-center">
        <span className="relative flex h-32 w-32 items-center justify-center" aria-hidden>
          <span className="orb-halo absolute inset-0 rounded-full" />
          <span className="orb-halo orb-halo-2 absolute inset-0 rounded-full" />
          <span className="ren-orb orb-listening absolute inset-4 rounded-full shadow-sh-3" />
        </span>
        <div className="mt-6 flex h-7 items-end gap-[3px]" aria-hidden>
          {WAVE_BARS.map((bar) => (
            <span
              key={bar}
              className="wave-bar w-[3px] rounded-full bg-stem-500/70"
              style={{ animationDelay: `${bar * 110}ms` }}
            />
          ))}
        </div>
        <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.14em] text-stem-700">Ren</p>
        <p className="mt-2 max-w-sm text-center text-[18px] font-bold leading-snug text-ink-900 sm:text-[20px]">
          &ldquo;Last time you wanted to look at moving the ADCB balance somewhere cheaper. Shall we see what that would save you?&rdquo;
        </p>
      </div>
      <div className="mt-8 rounded-sm bg-cream p-4">
        <p className="label">Agenda</p>
        <p className="mt-1.5 text-[15px] font-bold text-ink-900">Cut the rent you pay on the debt</p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
          What the interest costs you each month, whether a balance transfer would lower it, and what the offer would
          need to say before it is worth it.
        </p>
      </div>
      <p className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-ink-800 py-3.5 text-[15px] font-bold text-cream">
        <span className="h-2 w-2 rounded-full bg-leaf-300" aria-hidden />
        Call Ren
      </p>
    </div>
  );
}

function ProgressCard() {
  return (
    <div className="rounded-card border border-rule bg-card p-5 shadow-sh-2 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="label">Since your last call</p>
        <span className="chip c-neutral">Example</span>
      </div>
      <div className="mt-4 flex items-center gap-5">
        <Plant state={{ stemPct: 0.62, leafPairs: 3, rootDepth: 6, sparks: false, cleared: false }} className="h-28 w-28 shrink-0" />
        <div className="space-y-3 text-[13px] leading-relaxed">
          <div>
            <p className="font-bold text-ink-900">Stem</p>
            <p className="text-ink-500">Grows on every dirham of principal you clear.</p>
          </div>
          <div>
            <p className="font-bold text-ink-900">Roots</p>
            <p className="text-ink-500">Grow on every call, even in a month when the stem barely moves.</p>
          </div>
        </div>
      </div>
      <ol className="mt-5 divide-y divide-rule border-t border-rule text-[14px]">
        <li className="flex gap-3 py-3">
          <span className="w-24 shrink-0 text-[12px] font-bold text-ink-400">You said</span>
          <span className="text-ink-900">Pay <span className="n">{formatMoney(4100, CURRENCY)}</span> on Emirates NBD by the 28th.</span>
        </li>
        <li className="flex gap-3 py-3">
          <span className="w-24 shrink-0 text-[12px] font-bold text-ink-400">What happened</span>
          <span className="text-ink-900">Car repair. You paid <span className="n">{formatMoney(2800, CURRENCY)}</span> and kept every minimum.</span>
        </li>
        <li className="flex gap-3 py-3">
          <span className="w-24 shrink-0 text-[12px] font-bold text-ink-400">Ren opens with</span>
          <span className="text-ink-900">&ldquo;You kept the minimums in a hard month. What made that possible?&rdquo;</span>
        </li>
      </ol>
      <p className="mt-3 text-[12px] text-stem-700">Debt-free date moved one month. The plant did not wilt.</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-20 border-b border-rule bg-cream/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <Link href="/" aria-label="Sproutjar home">
            <Logo />
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/case-study"
              className="hidden text-[13px] font-bold text-ink-500 transition hover:text-ink-900 sm:inline"
            >
              Case study
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-ink-800 px-4 py-2 text-[13px] font-bold text-ink-800 transition hover:bg-ink-800 hover:text-cream"
            >
              Try the live app
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-20">
        {/* Hero */}
        <section className="grid items-center gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <h1 className="text-[34px] font-extrabold leading-[1.1] tracking-[-0.02em] text-ink-900 sm:text-[44px] lg:text-[50px]">
              Grow your way out of debt habits into savings habits
            </h1>
            <p className="mt-5 text-[17px] leading-relaxed text-ink-500 sm:text-[18px]">
              Sproutjar is a positive-psychology financial wellness coach you can call. It starts with a realistic payoff
              plan from your balances, rates and minimums, then Ren helps you keep going when life gets messy.
            </p>
            <p className="mt-3 text-[17px] leading-relaxed text-ink-500">
              No lectures. No perfect plan. Just support, reflection and accountability around the goals that matter to
              you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PrimaryCta href="/onboarding" />
              <a
                href="#start"
                className="inline-flex items-center rounded-full bg-cream-2 px-5 py-3 text-[15px] font-bold text-ink-800 transition hover:bg-cream-2/80"
              >
                See how it works
              </a>
            </div>
            <p className="mt-4 text-[13px] text-ink-300">A few quick questions. Your first coaching agenda. No credit card needed.</p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <HeroPlant className="w-full max-w-[220px] sm:max-w-[270px] lg:max-w-[330px]" />
          </div>
        </section>

        {/* What Ren brings */}
        <section id="start" className="pt-6">
          <SectionTitle>What Ren brings to the call.</SectionTitle>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-500">
            Not a lecture and not a spreadsheet. Ren works the way a good coach works, around the goals you choose.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {REN_STRENGTHS.map((item) => (
              <li key={item.title} className="rounded-card border border-rule bg-card p-5 shadow-sh-1">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-leaf-100 text-stem-700">
                  <StrengthIcon icon={item.icon} />
                </span>
                <p className="mt-4 text-[16px] font-bold leading-snug text-ink-900">{item.title}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-500">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Not sure where to start? */}
        <section className="mt-20 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle>Not sure where to start?</SectionTitle>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-500">
              That is okay. Answer a few quick questions and Ren suggests a few things you could explore first. You pick
              what feels useful. Ren helps you take it from there.
            </p>
            <p className="mt-3 text-[17px] leading-relaxed text-ink-500">
              You are still the one growing the plant. Ren just makes sure you do not have to grow it alone.
            </p>
            <div className="mt-7">
              <PrimaryCta href="/onboarding" />
              <p className="mt-2 text-[13px] text-ink-400">Find your starting point with Ren.</p>
            </div>
          </div>
          <StarterCard />
        </section>

        {/* Plan */}
        <section className="mt-20 grid items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <ExamplePlanCard />
          </div>
          <div className="order-1 lg:order-2">
            <SectionTitle>See the whole debt, and the way out of it.</SectionTitle>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-500">
              Enter what you owe once. Sproutjar shows every card at its real rate, works out a monthly amount from your
              salary, essentials and obligations, and tells you the single move to make this month.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Two ways to order the cards, highest interest rate first or smallest balance first, with the date each one gives you",
                "A card quoted at 3.25% a month shown as 39% a year, so the cost is not abstract",
                "A bad month gets a re-plan, not a restart. The date may move, the habit stays",
                "After the last card, the same plan turns to a reserve and then to savings jars",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] leading-snug text-ink-700">
                  <Check className="mt-0.5 h-5 w-5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Meet Ren */}
        <section className="mt-20 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle>A coach you can call.</SectionTitle>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-500">
              Ren is a voice coach, not a chatbot. You call when talking is easier than another spreadsheet, and every
              call has an agenda: one you bring, or one Ren suggests from what it already knows about you.
            </p>
            <ol className="mt-7 space-y-5 border-l-2 border-rule pl-5">
              {CALL_STAGES.map((stage) => (
                <li key={stage.when}>
                  <p className="text-[15px] font-bold text-ink-900">{stage.when}</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-ink-500">{stage.body}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-[15px] leading-relaxed text-ink-500">
              Ren is not a substitute for a human coach. It brings the most useful parts of coaching into your everyday
              financial life: discovering what matters, turning it into action, noticing what gets in the way, and staying
              accountable while you learn.
            </p>
          </div>
          <RenCallCard />
        </section>

        {/* Accountability */}
        <section className="mt-20 rounded-card bg-leaf-50 p-6 sm:p-8 lg:p-10">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <ProgressCard />
            </div>
            <div className="order-1 lg:order-2">
              <SectionTitle>An accountability partner who listens, not lectures.</SectionTitle>
              <p className="mt-4 text-[17px] leading-relaxed text-ink-500">
                Most plans do not fail on the maths. They fail in the third month, when a school fee lands or the
                remittance is higher than expected and there is no one to say the number out loud to.
              </p>
              <p className="mt-3 text-[17px] leading-relaxed text-ink-500">
                Ren tracks what you intended, what you did and what got in the way. It notices the pattern with you,
                without shame, and asks what still works this month. You choose the amount. The plan recomputes. Your plant
                keeps growing.
              </p>
              <p className="mt-6 text-[15px] font-bold text-ink-900">
                Talk when talking is easier. Type when it is not.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="mt-20">
          <SectionTitle>Why not just a spreadsheet, ChatGPT or a budgeting app?</SectionTitle>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-500">
            Each of them does one part of the job. None of them remembers you, re-plans with you and asks on payday what
            happened.
          </p>
          <div className="mt-8 overflow-x-auto rounded-card border border-rule bg-card">
            <table className="w-full min-w-[560px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-rule bg-cream">
                  <th className="px-5 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.06em] text-ink-500">What you need</th>
                  <th className="px-5 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.06em] text-stem-700">Sproutjar</th>
                  <th className="px-5 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.06em] text-ink-500">Elsewhere</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {COMPARISON.map((row) => (
                  <tr key={row.need}>
                    <td className="px-5 py-4 font-bold text-ink-900">{row.need}</td>
                    <td className="px-5 py-4 align-middle">
                      <span className="flex items-center gap-2 text-[13px] font-bold text-stem-700">
                        <Check className="h-5 w-5 shrink-0" /> Yes
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-ink-500">{row.other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Trust */}
        <section className="mt-24 rounded-card border border-rule bg-card p-8 sm:p-10 lg:p-12">
          <div className="max-w-2xl">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-leaf-100 text-stem-700" aria-hidden>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
                <path d="M8 10.5V7.5a4 4 0 018 0v3" />
                <path d="M12 14.5v2.5" />
              </svg>
            </span>
            <h2 className="mt-6 text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-ink-900 sm:text-[30px]">
              Your financial data stays yours.
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-500">
              Talking about debt is personal. Sproutjar only asks for what the plan needs, keeps it for you and Ren
              alone, and never sells it or shares it with banks, advertisers or anyone else.
            </p>
          </div>
          <ul className="mt-10 grid gap-x-10 gap-y-7 text-[15px] leading-relaxed text-ink-500 sm:grid-cols-2">
            <li className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0" />
              <span>
                <span className="font-bold text-ink-900">No bank login, no card numbers.</span> You enter balances, rates,
                minimums, income and regular outgoings by hand. That is all the plan needs.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0" />
              <span>
                <span className="font-bold text-ink-900">Never sold, never shared.</span> Your numbers exist so Ren and your
                dashboard read the same plan. No one else sees them.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0" />
              <span>
                <span className="font-bold text-ink-900">Nothing moves money.</span> Ren can suggest a change to the plan,
                but only your tap confirms it, and no payment ever leaves through Sproutjar.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0" />
              <span>
                <span className="font-bold text-ink-900">Coaching, not advice.</span> Ren is not a financial, legal or
                religious adviser and says so when a question needs a ruling.
              </span>
            </li>
          </ul>
          <div className="mt-10 flex flex-col gap-3 rounded-sm bg-cream p-5 sm:flex-row sm:items-center sm:gap-5">
            <span className="chip c-neutral w-fit shrink-0">Coming soon</span>
            <p className="text-[15px] leading-relaxed text-ink-700">
              <span className="font-bold text-ink-900">Statement reading.</span> Upload a card statement and Sproutjar will
              pick out the balance, rate, minimum and due date for you. Still no bank login, and you check every number
              before it goes into the plan.
            </p>
          </div>
        </section>

        {/* Evidence / case study */}
        <section id="case-study" className="mt-20 grid items-center gap-8 rounded-card bg-ink-800 p-6 text-cream sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10">
          <div>
            <h2 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[30px]">
              Built from research.
            </h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-cream/80">
              Sproutjar grew out of first-person accounts from salaried people in the GCC carrying credit-card debt, and
              the research on goal progress monitoring, habit formation and coaching practice. There are no invented
              users, testimonials or outcome figures here.
            </p>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-cream/80">
              Reviewers and incubation teams: the full research, product decisions, rate sources and a walkthrough of the
              seeded demo are in the case study.
            </p>
          </div>
          <Link
            href="/case-study"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cream px-6 py-3.5 text-[15px] font-bold text-ink-900 transition hover:bg-cream-2"
          >
            Read the case study <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* FAQ */}
        <section className="mt-20">
          <SectionTitle>Questions</SectionTitle>
          <dl className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {FAQ.map((item) => (
              <div key={item.q}>
                <dt className="text-[16px] font-bold text-ink-900">{item.q}</dt>
                <dd className="mt-1 text-[15px] leading-relaxed text-ink-500">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Final CTA */}
        <section className="mt-24 text-center">
          <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink-900 sm:text-[36px]">
            You choose what you want to grow.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[17px] leading-relaxed text-ink-500">
            A few questions. Your first coaching agenda. Somewhere meaningful to begin.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryCta href="/onboarding" />
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full border border-ink-800 px-5 py-3 text-[15px] font-bold text-ink-800 transition hover:bg-ink-800 hover:text-cream"
            >
              Try the live app
            </Link>
          </div>
          <p className="mt-10 text-[17px] font-bold text-stem-700">Plant it. Water it. Grow it.</p>
        </section>
      </main>

      <footer className="border-t border-rule py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 px-5 sm:flex-row sm:items-center">
          <Logo />
          <div className="flex items-center gap-6 text-[13px] font-bold text-ink-500">
            <Link href="/case-study" className="transition hover:text-ink-900">
              Case study
            </Link>
            <Link href="/dashboard" className="transition hover:text-ink-900">
              Live app
            </Link>
            <Link href="/onboarding" className="transition hover:text-ink-900">
              Plant the first seed
            </Link>
          </div>
          <p className="text-[12px] text-ink-300">Coaching, not advice.</p>
        </div>
      </footer>
    </div>
  );
}
