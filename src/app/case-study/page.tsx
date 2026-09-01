import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { DebtLine } from "@/components/case/DebtLine";
import { GrowthAnimation } from "@/components/case/GrowthAnimation";
import { Reveal } from "@/components/case/Reveal";
import { Walkthrough } from "@/components/case/Walkthrough";
import { CHAPTERS, DECISIONS, HISTORY, NOT_PROVEN, TALK_DATES, TESTING } from "./content";

export const metadata: Metadata = {
  title: "Sproutjar — how it was researched, designed and built",
  description:
    "The case study behind Sproutjar: a voice coach for people clearing credit card debt in the Gulf. Research, the findings that argued against my own idea, the decisions taken, and what remains unproven.",
};

export default function CaseStudy() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-20 border-b border-rule bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <Logo />
          <Link
            href="/dashboard"
            className="rounded-full bg-ink-800 px-4 py-2 text-[13px] font-bold text-cream transition hover:bg-ink-700"
          >
            Open the product
          </Link>
        </div>
      </header>

      <main>
        {/* Result first: the thing itself, moving, before a word of process. */}
        <section className="mx-auto grid max-w-5xl items-center gap-10 px-5 pt-12 pb-14 sm:pt-16 md:grid-cols-[1.05fr_0.95fr] md:gap-14">
          <div>
            <h1 className="text-[34px] font-bold leading-[1.08] tracking-[-0.03em] text-ink-900 sm:text-[46px]">
              Sproutjar is an app that talks you out of credit card debt.
            </h1>
            <p className="mt-5 max-w-[54ch] text-[17px] leading-relaxed text-ink-500">
              You tell it what you owe. It builds the payoff plan, then Ren — a voice coach that
              can see your actual balances — calls it through with you: what to pay first, what
              you committed to last month, what happened when it went wrong. Built for salaried
              professionals in the UAE carrying balances across two to four cards.
            </p>
            <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-ink-500">
              I did the research, the positioning, the brand, the interface and the code.
            </p>
            <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-ink-400">
              It runs. Live database, live voice calls, a payoff engine doing real amortisation.
              What it does not have is users — every figure on this page comes from research or
              from the seeded demo profile, and I have said which is which throughout.
            </p>
          </div>
          <Reveal>
            <GrowthAnimation />
          </Reveal>
        </section>

        <section className="mx-auto max-w-5xl px-5 pb-16">
          <Reveal>
            <DebtLine history={HISTORY} talkDates={TALK_DATES} />
          </Reveal>
        </section>

        {/* The five minutes that answer "what is it", before any argument about why. */}
        <section className="bg-ink-900 py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-5">
            <h2 className="text-[26px] font-bold tracking-[-0.02em] text-cream sm:text-[32px]">
              Five minutes inside it
            </h2>
            <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-lid">
              A call with Ren, the plant and the payoff date, the debt board, and what the product
              does with what you said after you hang up.
            </p>
            <div className="mt-7">
              <Walkthrough
                src="/case/ren-walkthrough.mp4"
                poster="/case/ren-walkthrough-poster.jpg"
                minutes="5 min"
              />
            </div>
          </div>
        </section>

        {/* Process. Context, struggle, transformation, one chapter at a time. */}
        <div className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
          <div className="border-l border-rule pl-6 sm:pl-10">
            {CHAPTERS.map((chapter) => (
              <Reveal key={chapter.id}>
                <section id={chapter.id} className="relative pb-16 sm:pb-24">
                  <span
                    className="absolute -left-[27px] top-2 h-2.5 w-2.5 rounded-full bg-stem sm:-left-[43px]"
                    aria-hidden
                  />
                  <h2 className="text-[27px] font-bold leading-[1.15] tracking-[-0.025em] text-ink-900 sm:text-[34px]">
                    {chapter.title}
                  </h2>
                  <p className="mt-4 text-[18px] leading-relaxed text-ink-700">{chapter.lead}</p>
                  {chapter.body.map((paragraph) => (
                    <p key={paragraph.slice(0, 24)} className="mt-4 text-[16px] leading-relaxed text-ink-500">
                      {paragraph}
                    </p>
                  ))}

                  {chapter.quotes?.length ? (
                    <ul className="mt-7 space-y-5">
                      {chapter.quotes.map((quote) => (
                        <li key={quote.text.slice(0, 24)}>
                          <p className="text-[18px] font-bold leading-snug text-stem-700">
                            “{quote.text}”
                          </p>
                          <p className="mt-1.5 text-[13px] text-ink-300">{quote.who}</p>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {chapter.shots?.length ? (
                    <ul
                      className={`mt-8 grid gap-6 ${
                        chapter.shots.length > 1 ? "sm:grid-cols-3 sm:gap-4" : "max-w-[300px]"
                      }`}
                    >
                      {chapter.shots.map((shot) => (
                        <li key={shot.src}>
                          <Image
                            src={shot.src}
                            alt={shot.alt}
                            width={860}
                            height={1864}
                            sizes="(min-width: 640px) 220px, 90vw"
                            className="w-full rounded-[18px] border border-rule bg-card shadow-sh-2"
                          />
                          <p className="mt-2.5 text-[13px] leading-snug text-ink-400">{shot.label}</p>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {chapter.aside ? (
                    <div className="mt-7 rounded-card bg-card p-5 shadow-sh-1">
                      <p className="text-[14px] font-bold text-ink-900">{chapter.aside.title}</p>
                      <ul className="mt-3 space-y-2.5">
                        {chapter.aside.lines.map((line) => (
                          <li key={line} className="flex gap-3 text-[15px] leading-snug text-ink-500">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-soil" aria-hidden />
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </section>
              </Reveal>
            ))}
          </div>
        </div>

        {/* The struggle beat: I asked for the beating and then took it. */}
        <section className="bg-ink-900 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-5">
            <Reveal>
              <h2 className="text-[27px] font-bold leading-[1.15] tracking-[-0.025em] text-cream sm:text-[34px]">
                Then I recorded the whole thing and asked to be told it was bad
              </h2>
              <p className="mt-4 text-[18px] leading-relaxed text-lid">
                A screen recording of the full flow went to Gemini 3 Pro under a prompt written to
                remove every escape route: a senior designer with no interest in soft feedback,
                critiquing the journey holistically rather than screen by screen, told to disagree
                with me and to delete any observation that could apply to any SaaS product.
              </p>
              <p className="mt-4 text-[16px] leading-relaxed text-lid/85">
                The audit is the hinge of this project. Everything before it was mine and defensible
                on paper. What came back was about the seams — where momentum died, what two screens
                were both trying to be, what the product implied when a call produced nothing, and
                which numbers claimed more than they had earned. The decisions below are what I did
                about it, including the ones where I disagreed and kept my version.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
          <Reveal>
            <h2 className="text-[27px] font-bold leading-[1.15] tracking-[-0.025em] text-ink-900 sm:text-[34px]">
              Twelve decisions, and what each one cost
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-500">
              Every one of these had a cheaper answer available. The cheaper answer is written down
              next to it.
            </p>
          </Reveal>

          <ol className="mt-10 space-y-10">
            {DECISIONS.map((decision) => (
              <Reveal key={decision.question}>
                <li>
                  <h3 className="text-[19px] font-bold leading-snug text-ink-900">
                    {decision.question}
                  </h3>
                  <p className="mt-3 text-[16px] leading-relaxed text-stem-700">
                    <span className="font-bold">Chose.</span> {decision.chose}
                  </p>
                  <p className="mt-2 text-[16px] leading-relaxed text-root">
                    <span className="font-bold">Instead of.</span> {decision.instead}
                  </p>
                  <p className="mt-2 text-[16px] leading-relaxed text-ink-500">{decision.why}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-3xl px-5 pb-16 sm:pb-24">
          <Reveal>
            <h2 className="text-[27px] font-bold leading-[1.15] tracking-[-0.025em] text-ink-900 sm:text-[34px]">
              Then I sent an agent through it to break it
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-500">
              A browser agent walked the whole journey — onboarding, a real call, a commitment,
              settling a card — while I watched what it did rather than what I expected it to do.
              It found four things. Three are fixed. The fourth I cannot honestly close.
            </p>
            <dl className="mt-8 space-y-6">
              {TESTING.map((item) => (
                <div key={item.found} className="rounded-card bg-card p-5 shadow-sh-1">
                  <dt className="text-[16px] font-bold leading-snug text-ink-900">{item.found}</dt>
                  <dd className="mt-2 text-[15px] leading-relaxed text-ink-500">{item.then}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>

        {/* The craft layer, shown rather than described. */}
        <section className="border-y border-rule bg-cream-2/60 py-16 sm:py-24">
          <div className="mx-auto grid max-w-5xl items-center gap-10 px-5 md:grid-cols-2 md:gap-14">
            <Reveal>
              <h2 className="text-[27px] font-bold leading-[1.15] tracking-[-0.025em] text-ink-900 sm:text-[34px]">
                The animation came first, and everything else was derived from it
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-ink-500">
                Before the palette existed there was a jar with a plant in it, growing in spurts,
                tipping its own lid off. Every colour, easing curve and duration in the product was
                pulled out of that file: the stem green, the root brown that stands for the cost of
                debt, the amber that appears only at a breakthrough, the spring the plant uses when
                it settles.
              </p>
              <p className="mt-4 text-[16px] leading-relaxed text-ink-500">
                The rules that came out of it are the reason the interface holds together. Money is
                always tabular. Estimates always carry a chip. The call orb is the only gradient
                permitted anywhere. And the plant never wilts — a design rule that is really a
                product promise, because a product that visibly punishes you for a bad month is one
                you delete during a bad month.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <Image
                src="/case/plant-states.png"
                alt="Four jars showing the plant at day one, month one, month three and cleared, with a note that roots keep growing on slow months."
                width={1009}
                height={935}
                className="w-full rounded-card border border-rule shadow-sh-2"
              />
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
          <Reveal>
            <h2 className="text-[27px] font-bold leading-[1.15] tracking-[-0.025em] text-ink-900 sm:text-[34px]">
              What this does not prove
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-500">
              The most useful thing I can put in front of a hiring manager is the list of things I
              have not earned the right to claim.
            </p>
            <ul className="mt-8 space-y-4">
              {NOT_PROVEN.map((item) => (
                <li key={item.slice(0, 24)} className="flex gap-3.5 text-[16px] leading-relaxed text-ink-500">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-soil" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[16px] leading-relaxed text-ink-500">
              What I would do with a real week: five interviews with people carrying card balances
              in Dubai, testing the two claims the whole product rests on — that seeing a date move
              changes behaviour, and that being asked what happened is worth paying for.
            </p>
          </Reveal>
        </section>

        <footer className="border-t border-rule">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
            <Logo />
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-full bg-ink-800 px-4 py-2 text-[13px] font-bold text-cream transition hover:bg-ink-700"
              >
                Open the product
              </Link>
              <a
                href="https://github.com/bismamunawardigital/Sproutjar"
                className="rounded-full border border-rule px-4 py-2 text-[13px] font-bold text-ink-500 transition hover:border-stem hover:text-stem-700"
              >
                Read the code
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
