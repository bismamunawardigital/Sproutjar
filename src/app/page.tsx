import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { Plant } from "@/components/Plant";
import { formatMoney, formatRate } from "@/lib/money";

export const metadata: Metadata = {
  title: "Sproutjar — Build your credit-card payoff plan",
  description:
    "Add your card balances, rates and minimums. Sproutjar turns them into a realistic payoff plan for UAE and GCC credit cards, then helps you adjust when the month doesn't go to plan.",
};

const currency = "AED";

const EXAMPLE_CARDS = [
  { name: "Emirates NBD", balance: 18500, monthlyRate: 0.0325, minimum: 1110, focus: true },
  { name: "RAKBANK", balance: 12400, monthlyRate: 0.0299, minimum: 744, focus: false },
  { name: "FAB", balance: 8200, monthlyRate: 0.035, minimum: 492, focus: false },
];

const EXAMPLE_MONTHLY_ATTACK = 6500;
const EXAMPLE_OPENING = 87645;
const EXAMPLE_CURRENT = 39100;

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="10" fill="#DEEADF" />
      <path d="M6 10.5l2.5 2.5 5.5-6" stroke="#2F6243" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Cross({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="10" fill="#F1E9DF" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="#7A6248" strokeWidth="2" strokeLinecap="round" />
    </svg>
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
              <p className="n text-[15px] text-ink-900">{formatMoney(card.balance, currency)}</p>
            </div>
            <p className="mt-1 text-[12px] text-ink-400">
              {formatRate(card.monthlyRate)} · min{" "}
              <span className="n">{formatMoney(card.minimum, currency)}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-sm bg-cream p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[12px] font-bold text-ink-500">Monthly debt attack</p>
            <p className="n text-[22px] font-extrabold text-stem-700">
              {formatMoney(EXAMPLE_MONTHLY_ATTACK, currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[12px] font-bold text-ink-500">Strategy</p>
            <p className="text-[15px] font-bold text-ink-900">Avalanche</p>
          </div>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
          Pay Emirates NBD first. Debt-free in <span className="n">14</span> months.
        </p>
      </div>
      <div className="mt-5 flex items-center gap-4 rounded-sm bg-cream-2 p-4">
        <Plant
          state={{ stemPct: 0.55, leafPairs: 3, rootDepth: 4, sparks: false, cleared: false }}
          className="h-20 w-20"
        />
        <div>
          <p className="text-[12px] font-bold text-ink-500">Principal cleared</p>
          <p className="n text-[17px] text-ink-900">
            {formatMoney(EXAMPLE_OPENING - EXAMPLE_CURRENT, currency)}
          </p>
          <p className="text-[12px] text-ink-400">
            of <span className="n">{formatMoney(EXAMPLE_OPENING, currency)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-20 border-b border-rule bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <Logo />
          <div className="flex items-center gap-4">
            <Link
              href="/case-study"
              className="hidden text-[13px] font-bold text-ink-500 transition hover:text-ink-800 sm:inline"
            >
              Case study
            </Link>
            <Link
              href="/onboarding"
              className="rounded-full bg-ink-800 px-4 py-2.5 text-[13px] font-bold text-cream transition hover:bg-ink-700"
            >
              Build my payoff plan
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-5 pb-16 pt-12 sm:pb-24 sm:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="max-w-2xl">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink-500">
                Credit-card debt payoff for the UAE
              </span>
              <h1 className="mt-4 text-[34px] font-extrabold leading-[1.1] tracking-[-0.02em] text-ink-900 sm:text-[46px]">
                Know what to pay first. Keep the plan when life changes.
              </h1>
              <p className="mt-5 text-[17px] leading-relaxed text-ink-500 sm:text-[19px]">
                Add your balances, rates and minimums. Sproutjar turns them into a realistic payoff
                plan, shows your progress, and helps you adjust when the month doesn&rsquo;t go to
                plan.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-stem-700 px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-stem-600"
                >
                  Build my payoff plan
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-1 text-[15px] font-bold text-ink-700 underline decoration-ink-300 underline-offset-4 transition hover:text-stem-700"
                >
                  See an example first <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-4 text-[13px] text-ink-400">
                You&rsquo;ll need your card balances, rates and minimum payments.
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-md lg:mx-0">
              <span className="absolute -right-2 -top-3 z-10 chip c-neutral">Example</span>
              <ExamplePlanCard />
            </div>
          </div>
        </section>

        {/* Value proposition strip */}
        <section className="border-y border-rule bg-card">
          <div className="mx-auto max-w-5xl px-5 py-8">
            <div className="grid gap-6 sm:grid-cols-3 sm:gap-4">
              <p className="text-[15px] font-bold leading-snug text-ink-900">
                <span className="mr-2 text-stem-600">—</span>Built around your actual cards
              </p>
              <p className="text-[15px] font-bold leading-snug text-ink-900">
                <span className="mr-2 text-stem-600">—</span>Made to change with the month
              </p>
              <p className="text-[15px] font-bold leading-snug text-ink-900">
                <span className="mr-2 text-stem-600">—</span>Accountability that keeps the context
              </p>
            </div>
          </div>
        </section>

        {/* Problem recognition */}
        <section className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
          <h2 className="max-w-2xl text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink-900 sm:text-[34px]">
            The plan is never the hard part.
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-500 sm:text-[17px]">
            Everyone carrying card debt already knows what to do: pay the expensive balance first,
            stop adding to it, never miss a minimum. What breaks people is the third month.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "The month goes wrong",
                body: "A school fee or car repair lands. The spreadsheet can&rsquo;t absorb it, so the person quietly stops opening the app and the plan fails.",
              },
              {
                title: "The real cost is hidden",
                body: "A card quoted at 3.25% a month costs 39% a year. That number is rarely shown, so the urgency stays abstract.",
              },
              {
                title: "No one notices the gap",
                body: "A calculator gives a figure and leaves. There is no one to ask on payday what happened, so the same decision keeps unmaking itself.",
              },
            ].map((item, i) => (
              <div key={item.title} className="border-t-2 border-stem/30 pt-5">
                <p className="n text-[13px] text-stem-700">0{i + 1}</p>
                <h3 className="mt-2 text-[17px] font-bold text-ink-900">{item.title}</h3>
                <p
                  className="mt-2 text-[14px] leading-relaxed text-ink-500"
                  dangerouslySetInnerHTML={{ __html: item.body }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Plan mechanism */}
        <section className="bg-card">
          <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
            <h2 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink-900 sm:text-[34px]">
              Cards → plan → next action
            </h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-500 sm:text-[17px]">
              You enter what you owe once. Sproutjar builds the month-by-month path at each
              card&rsquo;s real rate, then tells you the single move to make this month.
            </p>
            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
              <div className="rounded-card border border-rule bg-cream p-5">
                <p className="label">Step 1</p>
                <p className="mt-3 text-[17px] font-bold text-ink-900">Add your cards</p>
                <div className="mt-4 space-y-3">
                  {EXAMPLE_CARDS.slice(0, 2).map((card) => (
                    <div
                      key={card.name}
                      className="flex items-center justify-between gap-2 rounded-sm bg-card px-3 py-2"
                    >
                      <span className="text-[13px] font-bold text-ink-900">{card.name}</span>
                      <span className="n text-[13px] text-ink-900">
                        {formatMoney(card.balance, currency)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[12px] text-ink-400">
                  Balance, rate, minimum and due date. A guess is fine to start.
                </p>
              </div>

              <div className="hidden items-center justify-center lg:flex">
                <ArrowRight className="h-6 w-6 text-ink-300" />
              </div>

              <div className="rounded-card border border-rule bg-cream p-5">
                <p className="label">Step 2</p>
                <p className="mt-3 text-[17px] font-bold text-ink-900">Pick your strategy</p>
                <div className="mt-4 flex rounded-full border border-rule bg-card p-1">
                  <span className="rounded-full bg-ink-800 px-3 py-1.5 text-[12px] font-bold text-cream">
                    Avalanche
                  </span>
                  <span className="px-3 py-1.5 text-[12px] font-bold text-ink-500">Snowball</span>
                </div>
                <p className="mt-3 text-[12px] text-ink-400">
                  Avalanche targets the highest rate first. Snowball clears the smallest balance
                  first.
                </p>
              </div>

              <div className="hidden items-center justify-center lg:flex">
                <ArrowRight className="h-6 w-6 text-ink-300" />
              </div>

              <div className="rounded-card border border-rule bg-cream p-5">
                <p className="label">Step 3</p>
                <p className="mt-3 text-[17px] font-bold text-ink-900">Get this month&rsquo;s move</p>
                <p className="mt-4 rounded-sm bg-leaf-50 px-3 py-3 text-[14px] leading-snug text-stem-700">
                  Pay <span className="n">{formatMoney(4200, currency)}</span> on Emirates NBD this
                  month.
                </p>
                <p className="mt-3 text-[12px] text-ink-400">
                  The other cards stay current on their minimums. The date recomputes after every
                  review.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Adaptation */}
        <section className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
          <h2 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink-900 sm:text-[34px]">
            A bad month should change the plan — not end it.
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-500 sm:text-[17px]">
            When the month goes wrong, Ren asks what amount still works. You choose, the plan
            recomputes, and the date moves. No red, no shame, no restart.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-card border border-rule bg-cream-2 p-6">
              <p className="label">Planned month</p>
              <p className="mt-3 text-[17px] font-bold text-ink-900">AED 6,500 to the cards</p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-500">
                The full debt attack goes to Emirates NBD. The other cards get their minimums.
              </p>
              <p className="mt-4 text-[13px] text-ink-400">Debt-free date stays on track.</p>
            </div>
            <div className="rounded-card border border-rule bg-leaf-50 p-6">
              <p className="label">After a car repair</p>
              <p className="mt-3 text-[17px] font-bold text-stem-700">AED 4,100 to the cards</p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-500">
                Ren asks what still works. You choose AED 4,100. Minimums are still covered, and the
                plan absorbs the repair.
              </p>
              <p className="mt-4 text-[13px] text-stem-700">Debt-free date moves two months.</p>
            </div>
          </div>
        </section>

        {/* Ren / accountability */}
        <section className="bg-ink-800 text-cream">
          <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] text-cream sm:text-[34px]">
                  The plan does the maths. Ren helps you keep moving.
                </h2>
                <p className="mt-4 text-[16px] leading-relaxed text-cream/75 sm:text-[17px]">
                  Ren is the coach inside Sproutjar. It already knows your balances, your last
                  commitment and what happened in between, so you never start a call from zero.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Asks what you want from the call before it advises",
                    "Reflects your own words back when you set a commitment",
                    "Opens the next call on what you intended, did and learned",
                    "Raises balance transfers as proposals, never silent changes",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[15px] leading-snug text-cream/90">
                      <Check className="mt-0.5 h-5 w-5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-[14px] font-bold text-cream/70">
                  Talk when talking is easier. Type when it isn&rsquo;t.
                </p>
              </div>
              <div className="rounded-card bg-cream p-6 text-ink-800 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="ren-orb h-14 w-14 shrink-0 rounded-full" />
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-stem-700">
                      Ren
                    </p>
                    <p className="mt-2 text-[17px] font-bold leading-snug sm:text-[20px]">
                      &ldquo;What amount still works for the cards this month? We can replan around
                      whatever is real.&rdquo;
                    </p>
                    <p className="mt-3 text-[14px] leading-relaxed text-ink-500">
                      It does not lecture, pretend a bad month did not happen, or move any money.
                      It just holds the plan with you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
          <h2 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink-900 sm:text-[34px]">
            Why not just ChatGPT and a spreadsheet?
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-500 sm:text-[17px]">
            A general chatbot starts every conversation from zero. A spreadsheet does not ask you on
            payday what happened.
          </p>
          <div className="mt-10 overflow-hidden rounded-card border border-rule bg-card">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-rule bg-cream">
                  <th className="px-5 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.06em] text-ink-500">
                    What you need
                  </th>
                  <th className="px-5 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.06em] text-stem-700">
                    Sproutjar
                  </th>
                  <th className="px-5 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.06em] text-ink-500">
                    ChatGPT + Excel
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {[
                  {
                    need: "Remembers your balances and what you said last time",
                    sproutjar: true,
                    other: "Starts from zero each chat",
                  },
                  {
                    need: "Builds a payoff plan from your real cards and rates",
                    sproutjar: true,
                    other: "Only if you paste everything in",
                  },
                  {
                    need: "Recomputes when a month goes wrong",
                    sproutjar: true,
                    other: "You rebuild the sheet",
                  },
                  {
                    need: "Raises balance transfers with the bank&rsquo;s own terms",
                    sproutjar: true,
                    other: "May invent or miss terms",
                  },
                  {
                    need: "Ends every call with one commitment, then follows up",
                    sproutjar: true,
                    other: "No memory of what you promised",
                  },
                  {
                    need: "Voice or text, same coach",
                    sproutjar: true,
                    other: "Typed chat only",
                  },
                ].map((row) => (
                  <tr key={row.need}>
                    <td
                      className="px-5 py-4 font-bold text-ink-900"
                      dangerouslySetInnerHTML={{ __html: row.need }}
                    />
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-stem-700">
                        <Check className="h-5 w-5 shrink-0" /> Yes
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-ink-500">{row.other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Trust / data */}
        <section className="bg-cream-2">
          <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
            <h2 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink-900 sm:text-[34px]">
              What happens to your financial data
            </h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-500 sm:text-[17px]">
              We only ask for private information after the value is clear, and only to build the
              plan. Nothing is sold, scored or shared.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "What you enter",
                  body: "Card balances, rates, minimums, your salary, payday, essentials and obligations. No bank passwords.",
                },
                {
                  title: "How it is stored",
                  body: "Encrypted at rest in your Convex project. Sproutjar never holds your bank credentials.",
                },
                {
                  title: "How to delete it",
                  body: "Request deletion from your account settings. Your data is wiped within 30 days.",
                },
                {
                  title: "What it is not",
                  body: "Coaching, not financial advice. Ren will not move money or give legal, investment or religious rulings.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-card border border-rule bg-card p-5">
                  <h3 className="text-[15px] font-bold text-ink-900">{item.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-500">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Evidence / method */}
        <section className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
          <h2 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink-900 sm:text-[34px]">
            Built from research, not miracle claims
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-500 sm:text-[17px]">
            There are no testimonials, revenue figures or outcome metrics here. What we can prove is
            the method, the mechanics and the sources.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <div className="border-t-2 border-stem/30 pt-5">
              <p className="text-[17px] font-bold text-ink-900">Local mechanics</p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-500">
                Rates and rules are read from UAE, Saudi and Qatar bank tariffs and central-bank
                guidance, with the source and date attached.
              </p>
            </div>
            <div className="border-t-2 border-stem/30 pt-5">
              <p className="text-[17px] font-bold text-ink-900">Behaviour research</p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-500">
                The coaching flow is grounded in 25 first-person UAE debt accounts and the
                literature on goal-setting, accountability and positive psychology.
              </p>
            </div>
            <div className="border-t-2 border-stem/30 pt-5">
              <p className="text-[17px] font-bold text-ink-900">Product transparency</p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-500">
                The case study marks which numbers come from research and which are the seeded demo
                profile. No invented users or results.
              </p>
              <Link
                href="/case-study"
                className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-stem-700 underline decoration-stem/40 underline-offset-4"
              >
                Read the case study <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-card">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
            <h2 className="text-center text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink-900 sm:text-[34px]">
              Questions
            </h2>
            <div className="mt-10 space-y-4">
              {[
                {
                  q: "Is Sproutjar financial advice?",
                  a: "No. Sproutjar is coaching, not financial, legal or religious advice. Ren can explain how a credit-card contract works and point to your bank, central bank or a qualified professional for anything that needs a ruling.",
                },
                {
                  q: "How is the payoff plan calculated?",
                  a: "It uses avalanche or snowball on your real balances and rates, with month-by-month amortisation. The annual rate is simply the monthly rate times twelve, matching how banks in the region quote it. The debt-free date recomputes after every payday review.",
                },
                {
                  q: "Does Sproutjar need access to my bank account?",
                  a: "No. Bank linking is not live yet. You enter your balances manually or paste a statement. Sproutjar never handles your bank credentials or moves money.",
                },
                {
                  q: "What information do I need to start?",
                  a: "Your card balances, interest rates, minimum payments and due dates, plus your salary, payday, essential expenses and any priority obligations or remittances. A few guesses are fine to start; the plan gets sharper as you update the numbers.",
                },
                {
                  q: "What happens when I can't afford the planned payment?",
                  a: "On payday, Ren asks whether the planned amount still works this month. You can choose a smaller amount, cover your minimums first, and the plan recomputes. A bad month gets a re-plan, not a restart.",
                },
                {
                  q: "Do I have to talk to Ren?",
                  a: "No. You can type to Ren whenever you prefer. Voice is a mode, not the product. Quiet mode is also there for public spaces.",
                },
                {
                  q: "How is this different from a debt calculator?",
                  a: "A calculator gives you a figure and leaves. Sproutjar holds the plan with you: it remembers your numbers, follows up on your commitments, and recomputes when real months deviate from the plan.",
                },
                {
                  q: "How is this different from ChatGPT?",
                  a: "Ren reads your live balances before it speaks, remembers what you said last time, asks permission before it challenges you, and ends every call with one commitment. It never starts from zero, never moves money, and never marks a proposal as done.",
                },
                {
                  q: "Does this work with UAE credit cards?",
                  a: "Yes. The payoff engine handles the monthly rates common in the UAE and converts them to the annual figure that actually matters. It also supports Qatar, Saudi Arabia and other Gulf markets.",
                },
                {
                  q: "What does Sproutjar cost?",
                  a: "Sproutjar is currently free during early access. A paid plan will be introduced later, with a free tier that still lets you build and update your payoff plan.",
                },
                {
                  q: "Can I delete my information?",
                  a: "Yes. You can request deletion from your account settings. Your data is removed within 30 days.",
                },
              ].map((item, i) => (
                <details
                  key={i}
                  className="rounded-card border border-rule bg-cream p-5 marker:text-stem-700"
                >
                  <summary className="cursor-pointer text-[15px] font-bold text-ink-900 marker:text-stem-700">
                    {item.q}
                  </summary>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink-500">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:py-28">
          <h2 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink-900 sm:text-[38px]">
            Know what to pay first. Keep the plan when life changes.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-ink-500">
            Add your cards, see the payoff plan, and talk it through with Ren when you need someone
            to hold it with you.
          </p>
          <div className="mt-8">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-stem-700 px-7 py-4 text-[16px] font-bold text-white transition hover:bg-stem-600"
            >
              Build my payoff plan
            </Link>
          </div>
          <p className="mt-4 text-[13px] text-ink-400">
            You&rsquo;ll need your card balances, rates and minimum payments.
          </p>
        </section>
      </main>

      <footer className="border-t border-rule py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 px-5 sm:flex-row sm:items-center">
          <Logo />
          <div className="flex items-center gap-6 text-[13px] font-bold text-ink-500">
            <Link href="/case-study" className="transition hover:text-ink-800">
              Case study
            </Link>
            <Link href="/dashboard" className="transition hover:text-ink-800">
              Demo
            </Link>
            <Link href="/onboarding" className="transition hover:text-ink-800">
              Build my plan
            </Link>
          </div>
          <p className="text-[12px] text-ink-400">Coaching, not advice.</p>
        </div>
      </footer>
    </div>
  );
}
