import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { DebtLine } from "@/components/case/DebtLine";
import { GrowthAnimation } from "@/components/case/GrowthAnimation";
import { Reveal } from "@/components/case/Reveal";
import { Walkthrough } from "@/components/case/Walkthrough";
import {
  ALTERNATIVES,
  AUDIT,
  BANNED_COPY,
  CHAPTERS,
  DECISIONS,
  DESIGN_RULES,
  DESIGN_TOKENS,
  GITHUB_SHOTS,
  HISTORY,
  HYPOTHESES,
  LADDER,
  LOOP,
  NEXT,
  NOT_PROVEN,
  NUMBER_RULES,
  PERSONAS,
  RATE_FACTS,
  STACK,
  TALK_DATES,
  TESTING,
} from "./content";

export const metadata: Metadata = {
  title: "Sproutjar: how it was researched, designed and built",
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
        <section className="mx-auto grid max-w-5xl items-center gap-10 px-5 pt-12 pb-14 sm:pt-16 md:grid-cols-[1.2fr_0.8fr] md:gap-12">
          <div>
            <h1 className="max-w-[19ch] text-[31px] font-bold leading-[1.1] tracking-[-0.03em] text-ink-900 sm:text-[40px]">
              Sproutjar is a financial wellness app that helps you clear credit card debt, with
              an AI voice coach trained on positive psychology and life coaching.
            </h1>
            <p className="mt-5 max-w-[54ch] text-[17px] leading-relaxed text-ink-500">
              You tell it what you owe. It builds the payoff plan, then Ren, a voice coach that
              can see your actual balances, calls it through with you: what to pay first, what
              you committed to last month, what happened when it went wrong. Built for salaried
              professionals in the UAE carrying balances across two to four cards.
            </p>
            <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-ink-500">
              I did the research, the positioning, the brand, the interface and the code.
            </p>
            <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-ink-400">
              It runs. Live database, live voice calls, a payoff engine doing real amortisation.
              What it does not have is users. Every figure on this page comes from research or
              from the seeded demo profile, and I have said which is which throughout.
            </p>
          </div>
          <Reveal>
            <GrowthAnimation />
          </Reveal>
        </section>

        {/* The walkthrough sits directly under the hero: seeing it beats reading about it. */}
        <section className="bg-ink-900 py-14 sm:py-16">
          <div className="mx-auto grid max-w-5xl items-center gap-9 px-5 md:grid-cols-[0.85fr_1fr] md:gap-12">
            <div>
              <h2 className="text-[26px] font-bold tracking-[-0.02em] text-cream sm:text-[31px]">
                Four minutes inside it
              </h2>
              <p className="mt-3 max-w-[44ch] text-[16px] leading-relaxed text-lid">
                A call with Ren, the plant and the payoff date, the debt board, and what the
                product does with what you said after you hang up.
              </p>
            </div>
            <div className="mx-auto w-full max-w-[420px] md:mx-0 md:justify-self-end">
              <Walkthrough
                src="/case/ren-walkthrough.mp4"
                poster="/case/ren-walkthrough-poster.jpg"
                minutes="4 min"
              />
            </div>
          </div>
        </section>

        {/* What it is built on, and what each piece is actually responsible for. */}
        <section className="border-y border-rule bg-card/60">
          <div className="mx-auto max-w-5xl px-5 py-12 sm:py-14">
            <Reveal>
              <h2 className="text-[20px] font-bold tracking-[-0.02em] text-ink-900 sm:text-[23px]">
                Built with
              </h2>
              <dl className="mt-7 divide-y divide-rule border-t border-rule">
                {STACK.map((tool) => (
                  <div
                    key={tool.name}
                    className="grid gap-1.5 py-4 sm:grid-cols-[170px_1fr] sm:gap-8"
                  >
                    <dt className="flex items-center gap-2.5 text-[15px] font-bold text-ink-900">
                      <Image
                        src={tool.logo}
                        alt=""
                        width={22}
                        height={22}
                        className="h-[22px] w-[22px] shrink-0 object-contain"
                      />
                      {tool.name}
                    </dt>
                    <dd className="max-w-[62ch] text-[15px] leading-relaxed text-ink-500">
                      {tool.role}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* The chart, with the reading of it written out so nobody has to decode it. */}
        <section className="mx-auto grid max-w-5xl items-center gap-9 px-5 pt-16 pb-16 md:grid-cols-[1fr_0.85fr] md:gap-12">
          <Reveal>
            <DebtLine history={HISTORY} talkDates={TALK_DATES} />
          </Reveal>
          <Reveal delay={80}>
            <div>
              <h2 className="text-[23px] font-bold leading-[1.2] tracking-[-0.02em] text-ink-900 sm:text-[27px]">
                Why the line goes down
              </h2>
              <p className="mt-3 text-[16px] leading-relaxed text-ink-500">
                The green line is everything the person owes, week by week. Each ring is a coaching
                session, and none of them is a chat. The app proposes the agenda before the call,
                built from what changed since the last one, so the session has a job: pick the
                payoff order, survive a broken month, deal with the card that keeps refilling.
              </p>
              <p className="mt-3 text-[16px] leading-relaxed text-ink-500">
                Each session ends with one commitment the person believes they can keep, in their
                own words, and the next session opens on it, kept or not. Over eleven weeks that is
                six agendas, six commitments and a set of small habit changes: pay on the day the
                salary lands, stop spending on the card being cleared, move the surplus before it
                gets spent. The principal falls because those held, not because the balance was
                looked at. AED 48,545 cleared and a payoff date of June 2027.
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-400">
                One honest caveat: this is the seeded demo profile the app ships with, not a real
                customer. The person paid the debt down, and the product says cleared while coaching
                with Ren rather than claiming the app did it.
              </p>
            </div>
          </Reveal>
        </section>

        {/* The six numbers that make this a Gulf problem rather than a generic one. */}
        <section className="border-y border-rule bg-ink-900 py-14 sm:py-16">
          <div className="mx-auto max-w-5xl px-5">
            <Reveal>
              <h2 className="max-w-[34ch] text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-cream sm:text-[31px]">
                Six numbers that make a Dubai card different from the one your payoff calculator
                assumes
              </h2>
            </Reveal>
            <dl className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {RATE_FACTS.map((fact) => (
                <Reveal key={fact.label}>
                  <div className="border-t border-cream/25 pt-4">
                    <dt className="n text-[25px] font-bold leading-none tracking-[-0.03em] text-leaf-300">
                      {fact.figure}
                    </dt>
                    <p className="mt-2 text-[15px] font-bold leading-snug text-cream">{fact.label}</p>
                    <dd className="mt-2 text-[14px] leading-relaxed text-lid/75">{fact.note}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>
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

                  {chapter.id === "alternatives" ? (
                    <>
                    <ul className="mt-8 space-y-3 sm:hidden">
                      {ALTERNATIVES.map((tool) => (
                        <li key={tool.name} className="rounded-card border border-rule bg-card p-4">
                          <p className="text-[15px] font-bold text-ink-900">{tool.name}</p>
                          <p className="n text-[12px] text-ink-300">{tool.price}</p>
                          <p className="mt-2 text-[14px] leading-snug text-ink-500">{tool.serves}</p>
                          <p className="mt-1.5 text-[14px] leading-snug text-root">{tool.leaves}</p>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 hidden overflow-hidden rounded-card border border-rule bg-card sm:block">
                      <table className="w-full border-collapse text-left">
                        <caption className="sr-only">
                          What each existing alternative serves, what it costs, and what it leaves
                          unsolved
                        </caption>
                        <thead>
                          <tr className="bg-root-50">
                            <th scope="col" className="px-4 py-3 text-[12px] font-bold uppercase tracking-wide text-ink-500">
                              Tool
                            </th>
                            <th scope="col" className="px-4 py-3 text-[12px] font-bold uppercase tracking-wide text-ink-500">
                              Serves
                            </th>
                            <th scope="col" className="px-4 py-3 text-[12px] font-bold uppercase tracking-wide text-ink-500">
                              Leaves unsolved
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {ALTERNATIVES.map((tool) => (
                            <tr key={tool.name} className="border-t border-rule align-top">
                              <th scope="row" className="px-4 py-4 text-[14px] font-bold text-ink-900">
                                {tool.name}
                                <span className="n mt-1 block text-[12px] font-normal text-ink-300">
                                  {tool.price}
                                </span>
                              </th>
                              <td className="px-4 py-4 text-[14px] leading-snug text-ink-500">
                                {tool.serves}
                              </td>
                              <td className="px-4 py-4 text-[14px] leading-snug text-root">
                                {tool.leaves}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    </>
                  ) : null}

                  {chapter.id === "panel" ? (
                    <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                      {PERSONAS.map((persona) => (
                        <li key={persona.who} className="rounded-card border border-rule bg-card p-4">
                          <p className="text-[15px] font-bold text-ink-900">{persona.who}</p>
                          <p className="mt-1.5 text-[14px] leading-snug text-ink-500">
                            {persona.situation}
                          </p>
                          <p className="mt-1.5 text-[14px] leading-snug text-ink-400">
                            {persona.behaviour}
                          </p>
                          <p className="mt-2.5 text-[13px] leading-snug text-soil">{persona.doubt}</p>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {chapter.id === "coaching" ? (
                    <ol className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {LOOP.map((item, index) => (
                        <li
                          key={item.step}
                          className="rounded-card bg-leaf-50 p-4"
                        >
                          <span className="n text-[12px] font-bold text-stem">0{index + 1}</span>
                          <p className="mt-1 text-[15px] font-bold text-stem-700">{item.step}</p>
                          <p className="mt-1 text-[13px] leading-snug text-ink-500">{item.note}</p>
                        </li>
                      ))}
                    </ol>
                  ) : null}

                  {chapter.id === "strategy" ? (
                    <ol className="mt-8 space-y-0 border-l-2 border-soil/40 pl-5">
                      {LADDER.map((rung, index) => (
                        <li key={rung} className="relative py-2.5">
                          <span
                            className="absolute -left-[26px] top-4 h-2 w-2 rounded-full bg-soil"
                            aria-hidden
                          />
                          <span className="n mr-3 text-[12px] font-bold text-soil">0{index + 1}</span>
                          <span className="text-[15px] leading-snug text-ink-700">{rung}</span>
                        </li>
                      ))}
                    </ol>
                  ) : null}

                  {chapter.pull ? (
                    <p className="mt-8 border-l-2 border-stem pl-5 text-[19px] font-bold leading-snug tracking-[-0.015em] text-ink-900 sm:text-[22px]">
                      {chapter.pull}
                    </p>
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
                on paper. What came back was about the seams: where momentum died, what two screens
                were both trying to be, what the product implied when a call produced nothing, and
                which numbers claimed more than they had earned. The decisions below are what I did
                about it, including the ones where I disagreed and kept my version.
              </p>
            </Reveal>
            <Reveal>
              <figure className="mt-10 border-t border-cream/20 pt-8">
                <blockquote className="text-[21px] font-bold leading-snug tracking-[-0.02em] text-cream sm:text-[25px]">
                  “{AUDIT.verdict}”
                </blockquote>
                <figcaption className="mt-3 text-[14px] text-lid/70">
                  Its one line verdict. {AUDIT.score}.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>

        {/* The audit's own artefacts, so the reader sees the critique rather than my account of it. */}
        <section className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
          <Reveal>
            <h2 className="text-[27px] font-bold leading-[1.15] tracking-[-0.025em] text-ink-900 sm:text-[34px]">
              What it said, in its own pages
            </h2>
            <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-ink-500">
              {AUDIT.scoreLine}
            </p>
            <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ink-400">
              These are pages from the audit report itself, not user testing. One expert model
              reviewing one recorded journey, and its redesigns are proposals, not measured
              outcomes.
            </p>
          </Reveal>

          <div className="mt-10 space-y-10">
            {AUDIT.images.map((shot) => (
              <Reveal key={shot.src}>
                <figure>
                  <div className="overflow-hidden rounded-xl border border-rule bg-card">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      width={1600}
                      height={900}
                      sizes="(min-width: 1024px) 960px, 100vw"
                      className="h-auto w-full"
                    />
                  </div>
                  <figcaption className="mt-3 max-w-[68ch] text-[14px] leading-relaxed text-ink-400">
                    {shot.label}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 border-t border-rule pt-10">
            <Reveal>
              <h3 className="text-[21px] font-bold tracking-[-0.02em] text-ink-900 sm:text-[24px]">
                Five findings, and what happened to each
              </h3>
            </Reveal>
            <ol className="mt-8 space-y-9">
              {AUDIT.findings.map((finding) => (
                <Reveal key={finding.found}>
                  <li>
                    <h4 className="max-w-[62ch] text-[17px] font-bold leading-snug text-ink-900">
                      {finding.found}
                    </h4>
                    <p className="mt-2.5 max-w-[66ch] text-[16px] leading-relaxed text-root">
                      <span className="font-bold">The audit.</span> {finding.verdict}
                    </p>
                    <p className="mt-2 max-w-[66ch] text-[16px] leading-relaxed text-stem-700">
                      <span className="font-bold">What I did.</span> {finding.did}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ol>
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
              A browser agent walked the whole journey (onboarding, a real call, a commitment,
              settling a card) while I watched what it did rather than what I expected it to do.
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

        {/* GitHub as process evidence: screenshots, deliberately no link. */}
        <section className="border-y border-rule bg-card/60 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-5">
            <Reveal>
              <h2 className="max-w-[30ch] text-[27px] font-bold leading-[1.15] tracking-[-0.025em] text-ink-900 sm:text-[34px]">
                The build history, as a record of decisions
              </h2>
              <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-ink-500">
                Nothing landed on the main branch without a pull request explaining why it was the
                right call. I am not linking the source here, since the interesting part is the
                reasoning rather than the code, so this is the process as it happened.
              </p>
            </Reveal>
            <ul className="mt-10 grid gap-8 md:grid-cols-3">
              {GITHUB_SHOTS.map((shot) => (
                <Reveal key={shot.src}>
                  <li>
                    <div className="h-[240px] overflow-hidden rounded-xl border border-rule bg-card">
                      <Image
                        src={shot.src}
                        alt={shot.alt}
                        width={1600}
                        height={1000}
                        sizes="(min-width: 768px) 300px, 100vw"
                        className="h-auto w-full"
                      />
                    </div>
                    <p className="mt-3 text-[14px] leading-relaxed text-ink-400">{shot.label}</p>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
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
                permitted anywhere. And the plant never wilts, a design rule that is really a
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

        {/* The design system itself: palette, rules, and the number formats. */}
        <section className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
          <Reveal>
            <h2 className="max-w-[32ch] text-[27px] font-bold leading-[1.15] tracking-[-0.025em] text-ink-900 sm:text-[34px]">
              The design system, and the ten rules it enforces
            </h2>
            <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-ink-500">
              Ten tokens, one typeface for reading and one for the wordmark, and a set of rules
              written so that a colour cannot be used to make somebody feel worse about their own
              money.
            </p>
          </Reveal>

          <Reveal>
            <ul className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-5">
              {DESIGN_TOKENS.map((token) => (
                <li key={token.hex} className="overflow-hidden rounded-xl border border-rule bg-card">
                  <div className="h-16 w-full" style={{ backgroundColor: token.hex }} aria-hidden />
                  <div className="px-3 py-2.5">
                    <p className="text-[13px] font-bold text-ink-900">{token.name}</p>
                    <p className="n text-[11px] uppercase tracking-wide text-ink-300">{token.hex}</p>
                    <p className="mt-1 text-[12px] leading-snug text-ink-400">{token.use}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1fr] md:gap-14">
            <Reveal>
              <div>
                <h3 className="text-[19px] font-bold tracking-[-0.02em] text-ink-900">
                  Type, and the two jobs it does
                </h3>
                <div className="mt-5 rounded-card border border-rule bg-card p-6">
                  <p className="font-logo text-[30px] font-bold leading-none tracking-[-0.02em] text-ink-900">
                    Sproutjar
                  </p>
                  <p className="mt-1.5 text-[13px] text-ink-300">
                    Space Grotesk. The wordmark, and nothing else in the product.
                  </p>
                  <p className="mt-6 text-[22px] font-bold leading-snug tracking-[-0.02em] text-ink-900">
                    You are eleven weeks in, and June 2027 just moved closer.
                  </p>
                  <p className="mt-2 text-[16px] leading-relaxed text-ink-500">
                    Nunito, for everything a person reads. Rounder, warmer, and legible at the size
                    a heading actually appears on a phone.
                  </p>
                  <p className="n mt-6 text-[24px] font-bold tracking-[-0.02em] text-stem-700">
                    AED 39,100.00
                  </p>
                  <p className="mt-1.5 text-[13px] text-ink-300">
                    Tabular numerals everywhere money appears, so columns do not dance while a
                    balance updates.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div>
                <h3 className="text-[19px] font-bold tracking-[-0.02em] text-ink-900">
                  How a number is allowed to be written
                </h3>
                <ul className="mt-5 space-y-4">
                  {NUMBER_RULES.map((rule) => (
                    <li key={rule.right} className="rounded-card border border-rule bg-card p-4">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="n text-[15px] text-ink-300 line-through decoration-danger/60">
                          {rule.wrong}
                        </span>
                        <span className="n text-[16px] font-bold text-stem-700">{rule.right}</span>
                      </div>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-ink-400">{rule.why}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-14">
            <Reveal>
              <div>
                <h3 className="text-[19px] font-bold tracking-[-0.02em] text-ink-900">
                  The ten rules
                </h3>
                <ol className="mt-5 space-y-3">
                  {DESIGN_RULES.map((rule, index) => (
                    <li key={rule} className="flex gap-3.5 text-[15px] leading-snug text-ink-500">
                      <span className="n mt-0.5 w-5 shrink-0 text-[13px] font-bold text-stem">
                        {index + 1}
                      </span>
                      {rule}
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="rounded-card bg-root-50 p-6">
                <h3 className="text-[17px] font-bold tracking-[-0.02em] text-ink-900">
                  Copy that is banned, not discouraged
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {BANNED_COPY.map((line) => (
                    <li key={line} className="text-[15px] leading-snug text-root line-through">
                      {line}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[14px] leading-relaxed text-ink-500">
                  Two reasons. UAE advertising rules do not allow a financial product to promise an
                  outcome, and the coaching literature is clear that a promise you cannot keep costs
                  you the relationship the method depends on.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* The five things a real interview would have to kill. */}
        <section className="border-y border-rule bg-cream-2/50 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-5">
            <Reveal>
              <h2 className="max-w-[32ch] text-[27px] font-bold leading-[1.15] tracking-[-0.025em] text-ink-900 sm:text-[34px]">
                Five hypotheses, written so a real interview could kill them
              </h2>
              <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-ink-500">
                This is what the synthetic panel is actually for. Not evidence, but claims specific
                enough to be wrong, each with the question I would ask before showing anybody the
                product.
              </p>
            </Reveal>
            <ol className="mt-10 divide-y divide-rule border-t border-rule">
              {HYPOTHESES.map((item) => (
                <Reveal key={item.id}>
                  <li className="grid gap-2 py-5 sm:grid-cols-[52px_1fr_1fr] sm:gap-8">
                    <span className="n text-[15px] font-bold text-stem">{item.id}</span>
                    <p className="text-[16px] leading-snug text-ink-900">{item.claim}</p>
                    <p className="text-[15px] leading-snug text-ink-400">{item.test}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
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
              in Dubai, testing the two claims the whole product rests on: that seeing a date move
              changes behaviour, and that being asked what happened is worth paying for.
            </p>
          </Reveal>
        </section>

        {/* Where it actually stands, and what happens next. */}
        <section className="bg-ink-900 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-5">
            <Reveal>
              <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-leaf-300">
                Where it stands
              </p>
              <h2 className="mt-4 max-w-[30ch] text-[27px] font-bold leading-[1.15] tracking-[-0.025em] text-cream sm:text-[34px]">
                This is a work in progress, and the next step is the craft
              </h2>
              <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-lid">
                Everything on this page runs, on a real database, with real calls. It was also built
                to a hackathon deadline, and it shows in the places a deadline always shows. So the
                next step is not a new feature.
              </p>
            </Reveal>
            <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
              {NEXT.map((step, index) => (
                <Reveal key={step.title}>
                  <li className="border-t border-cream/25 pt-4">
                    <span className="n text-[13px] font-bold text-leaf-300">0{index + 1}</span>
                    <h3 className="mt-2 text-[18px] font-bold leading-snug text-cream">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-lid/80">{step.body}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
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
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
