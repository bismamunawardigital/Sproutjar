import type { Metadata } from "next";
import Link from "next/link";
import { HeroPlant } from "@/components/HeroPlant";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Sproutjar: credit-card debt coaching with Ren",
  description:
    "A positive-psychology financial wellness coach you talk to, starting with a realistic payoff plan for credit-card debt in the Gulf.",
};

const STEPS = [
  {
    title: "Plant",
    body: "Discover what you actually want to change.",
    color: "bg-stem",
  },
  {
    title: "Root",
    body: "Turn it into a goal that belongs to you.",
    color: "bg-root",
  },
  {
    title: "Water",
    body: "Build small habits and keep showing up.",
    color: "bg-soil",
  },
  {
    title: "Grow",
    body: "Reflect on what worked, adjust what did not, and keep moving forward.",
    color: "bg-amber",
  },
];

const STARTER_QUESTIONS = [
  "Why can I not stick to my budget?",
  "What keeps throwing me off?",
  "What do I actually want my money to help me achieve?",
  "What small habit should I work on first?",
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
    a: "No. You can enter balances, rates and minimums by hand. A bank link is not live yet, and nothing moves without your tap.",
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

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PrimaryCta({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full bg-stem-600 px-6 py-3 text-[16px] font-bold text-white shadow-sh-2 transition hover:bg-stem-700 hover:shadow-sh-3"
    >
      Plant the first seed
      <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
        <path d="M5 12h14M13 5l7 7-7 7" />
      </svg>
    </Link>
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
          <Link
            href="/dashboard"
            className="rounded-full border border-ink-800 px-4 py-2 text-[13px] font-bold text-ink-800 transition hover:bg-ink-800 hover:text-cream"
          >
            Try the live app
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-20">
        {/* Hero */}
        <section className="grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="order-1 lg:order-2">
            <h1 className="text-[34px] font-extrabold leading-[1.1] tracking-[-0.02em] text-ink-900 sm:text-[44px] lg:text-[50px]">
              Grow your way out of credit card debt habits?
            </h1>
            <p className="mt-5 text-[17px] leading-relaxed text-ink-500 sm:text-[18px]">
              Sproutjar is a positive-psychology financial wellness coach you talk to. It starts with a realistic
              payoff plan from your balances, rates and minimums, then Ren helps you keep going when life gets messy.
            </p>
            <p className="mt-3 text-[17px] leading-relaxed text-ink-500">
              No lectures. No perfect plan. Just support, reflection and accountability around the goals that matter to
              you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PrimaryCta href="/onboarding" />
              <a
                href="#how-it-works"
                className="inline-flex items-center rounded-full bg-cream-2 px-5 py-3 text-[15px] font-bold text-ink-800 transition hover:bg-cream-2/80"
              >
                See how it works
              </a>
            </div>
            <p className="mt-4 text-[13px] text-ink-300">A few quick questions. Your first coaching agenda. No credit card needed.</p>
          </div>
          <div className="order-2 flex justify-center lg:order-1">
            <HeroPlant className="w-full max-w-xs max-h-[360px] sm:max-w-sm sm:max-h-[420px] lg:max-w-md lg:max-h-[460px]" />
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="pt-6">
          <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink-900 sm:text-[34px]">
            Plant it. Water it. Grow it.
          </h2>
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-500">
            You are still the one growing the plant. Ren just makes sure you do not have to grow it alone.
          </p>

          <ol className="relative mt-10 space-y-8 border-l-2 border-rule pl-7 lg:pl-9">
            {STEPS.map((step) => (
              <li key={step.title} className="relative">
                <span
                  className={`absolute -left-[2.2rem] top-2 h-3 w-3 rounded-full ${step.color} ring-4 ring-cream lg:-left-[2.6rem]`}
                  aria-hidden
                />
                <h3 className="text-[19px] font-bold text-ink-900">{step.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-ink-500">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Not sure where to start? */}
        <section className="mt-16 rounded-card bg-leaf-50 p-6 sm:p-8 lg:p-10">
          <h2 className="text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-ink-900 sm:text-[28px]">
            Not sure where to start?
          </h2>
          <p className="mt-2 text-[16px] leading-relaxed text-ink-500">
            That is okay. Answer a few quick questions and Ren will suggest a few things you could explore first.
          </p>
          <ul className="mt-5 list-disc space-y-2 pl-5 marker:text-stem-600">
            {STARTER_QUESTIONS.map((question) => (
              <li key={question} className="text-[16px] leading-snug text-ink-700">
                {question}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <PrimaryCta href="/onboarding" />
            <p className="mt-2 text-[13px] text-ink-400">Find your starting point with Ren.</p>
          </div>
        </section>

        {/* Problem */}
        <section className="mt-16">
          <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink-900 sm:text-[34px]">
            The plan usually fails on a bad month.
          </h2>
          <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-ink-500">
            Most people already know the advice: pay the highest interest first, stop using the cards, build a buffer. The
            hard part is doing it when a surprise bill arrives, when Ramadan spending shifts, when the remittance is higher
            than expected, or when you simply feel behind. Sproutjar is built around that reality.
          </p>
        </section>

        {/* Adaptation */}
        <section className="mt-16">
          <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink-900 sm:text-[34px]">
            A bad month gets a re-plan, not a restart.
          </h2>
          <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-ink-500">
            Tell Sproutjar what changed and it recalculates what is realistic from the same balances, rates and minimums.
            The plant does not wilt. The date may move, but the habit stays.
          </p>
        </section>

        {/* Meet Ren */}
        <section className="mt-16 rounded-card bg-ink-800 p-6 text-cream sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <span className="ren-orb h-16 w-16 shrink-0 rounded-full" aria-hidden />
            <div>
              <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[34px]">Meet Ren</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-cream/85">
                Ren is a voice coach, not a chatbot. Before each call it already knows your balances, what you said last
                time and what you are trying next. It suggests an agenda if you are unsure, asks before it challenges you,
                and ends every call with one goal and one commitment, written to the screen.
              </p>
              <p className="mt-3 text-[17px] leading-relaxed text-cream/85">
                It is not a substitute for a human coach. It brings the most useful parts of coaching into your everyday
                financial life: discovering what matters, turning it into action, noticing what gets in the way, and staying
                accountable while you learn. You own the goal. Ren helps you keep it alive.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="mt-16">
          <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink-900 sm:text-[34px]">
            Why not just a spreadsheet, ChatGPT or a budgeting app?
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-[15px]">
              <thead>
                <tr className="border-b-2 border-rule">
                  <th className="py-3 pr-4 font-normal text-ink-300">What you might try</th>
                  <th className="py-3 px-4 font-normal text-ink-300">What it gives you</th>
                  <th className="py-3 px-4 font-bold text-ink-900">Sproutjar</th>
                </tr>
              </thead>
              <tbody className="text-ink-700">
                <tr className="border-b border-rule">
                  <td className="py-4 pr-4 font-bold text-ink-900">A spreadsheet</td>
                  <td className="py-4 px-4">The math, but no memory of what got in the way and no re-plan when life changes.</td>
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-2 font-bold text-stem-700">
                      <Check className="h-4 w-4" /> Math plus adaptation
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-rule">
                  <td className="py-4 pr-4 font-bold text-ink-900">ChatGPT</td>
                  <td className="py-4 px-4">A conversation, but it forgets your real balances and cannot update a plan.</td>
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-2 font-bold text-stem-700">
                      <Check className="h-4 w-4" /> Conversation plus state
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-rule">
                  <td className="py-4 pr-4 font-bold text-ink-900">A budgeting app</td>
                  <td className="py-4 px-4">Tracking, but a missed month often feels like failure and there is no coach.</td>
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-2 font-bold text-stem-700">
                      <Check className="h-4 w-4" /> Tracking plus coaching
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 font-bold text-ink-900">A human coach</td>
                  <td className="py-4 px-4">Real relationship and insight, but weekly sessions cost more than most people in debt can justify.</td>
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-2 font-bold text-stem-700">
                      <Check className="h-4 w-4" /> Coaching structure in daily life
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Trust */}
        <section className="mt-16 rounded-card border border-rule bg-card p-6 sm:p-8">
          <h2 className="text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-ink-900 sm:text-[28px]">
            Your data, explained
          </h2>
          <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-ink-500">
            <li>
              <span className="font-bold text-ink-900">What we ask for:</span> balances, rates, minimums, income and
              regular outgoings. Only what the plan needs.
            </li>
            <li>
              <span className="font-bold text-ink-900">What we do with it:</span> store it so Ren and the dashboard read
              the same numbers. Nothing is sold or shared.
            </li>
            <li>
              <span className="font-bold text-ink-900">What moves money:</span> nothing. Voice can propose a change; only
              your tap can confirm it.
            </li>
            <li>
              <span className="font-bold text-ink-900">What this is:</span> coaching, not financial, legal or religious
              advice. Ren says so when a question needs a ruling.
            </li>
          </ul>
        </section>

        {/* Evidence */}
        <section className="mt-16">
          <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink-900 sm:text-[34px]">
            What this is based on
          </h2>
          <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-ink-500">
            Sproutjar was built from qualitative research with salaried people in the GCC carrying credit-card debt, plus
            the behavioural-science literature on goal progress monitoring, habit formation and coaching practice. No user
            numbers are invented. You can read the full{" "}
            <Link href="/case-study" className="font-bold text-ink-900 underline underline-offset-2">
              case study
            </Link>
            .
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink-900 sm:text-[34px]">
            Questions
          </h2>
          <dl className="mt-6 space-y-5">
            {FAQ.map((item) => (
              <div key={item.q}>
                <dt className="text-[16px] font-bold text-ink-900">{item.q}</dt>
                <dd className="mt-1 text-[15px] leading-relaxed text-ink-500">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Final CTA */}
        <section className="mt-20 rounded-card bg-ink-800 p-8 text-center text-cream sm:p-12">
          <h2 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[32px]">
            You choose what you want to grow.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[16px] leading-relaxed text-cream/80">
            A few questions. Your first coaching agenda. Somewhere meaningful to begin.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryCta href="/onboarding" />
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full border border-cream/30 px-5 py-3 text-[15px] font-bold text-cream transition hover:bg-cream/10"
            >
              Try the live app
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-rule py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5">
          <Logo />
          <p className="text-[12px] text-ink-300">Coaching, not advice.</p>
        </div>
      </footer>
    </div>
  );
}
