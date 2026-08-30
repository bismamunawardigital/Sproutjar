import Link from "next/link";
import { CommitmentBoard } from "@/components/CommitmentBoard";
import { DebtBoard } from "@/components/DebtBoard";
import { JarBoard } from "@/components/JarBoard";
import { Logo } from "@/components/Logo";
import { Plant } from "@/components/Plant";
import { SessionDeck } from "@/components/SessionDeck";
import { StrategyPicker } from "@/components/StrategyPicker";
import { OPEN_AGENDA, generatedAgendas, shuffledStarters } from "@/lib/agendas";
import { formatMoney, formatMoneyShort } from "@/lib/money";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const snap = await buildSnapshot();
  const currency = snap.country.currency;
  const plan = snap.plan;
  const belief = snap.beliefs[0] ?? null;
  const missed = snap.recentCommitments.find((c) => c.status === "missed") ?? null;

  const generated = generatedAgendas({
    name: snap.user.name,
    currency,
    monthlyBleed: plan.monthlyBleed,
    missedCommitment: missed ? { wish: missed.wish, createdAt: missed.createdAt } : null,
    belief: belief ? { text: belief.text, namedOn: belief.namedOn } : null,
    sessionsHeld: snap.sessions.length,
  });

  const agendas = snap.sessions.length > 0 ? generated : shuffledStarters(snap.debts.length + 7);

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-rule bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3.5">
          <Link href="/">
            <Logo />
          </Link>
          <p className="text-[13px] font-bold text-ink-400">
            {snap.user.name} · {snap.country.name}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 px-5 py-6 pb-16">
        {/* 1. The plant and the date. Nothing outranks this. */}
        <section className="rounded-card border border-rule bg-card p-5 sm:p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <Plant state={snap.growth} className="w-40 shrink-0 sm:w-48" />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="label">Debt-free</p>
              <p className="n mt-1 text-[34px] leading-none text-ink-900">
                {plan.feasible && plan.months > 0 ? plan.debtFreeOn : "Not yet"}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-400">
                {plan.feasible && plan.months > 0 ? (
                  <>
                    <span className="n">{plan.months}</span> months at{" "}
                    <span className="n">{formatMoneyShort(snap.surplus, currency)}</span> a month.
                    The date moves every time you tell Ren what happened.
                  </>
                ) : (
                  <>
                    Your surplus doesn&rsquo;t cover the minimums yet — short by{" "}
                    <span className="n">{formatMoney(plan.shortfall, currency)}</span>. No repayment
                    plan fixes that, so Ren works a different problem with you.
                  </>
                )}
              </p>

              <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-rule pt-4 text-left sm:grid-cols-3">
                <div>
                  <dt className="label">Still owed</dt>
                  <dd className="n mt-1 text-[19px] text-ink-900">
                    {formatMoneyShort(snap.totals.debt, currency)}
                  </dd>
                </div>
                <div>
                  <dt className="label">Principal cleared</dt>
                  <dd className="n mt-1 text-[19px] text-stem-700">
                    {formatMoneyShort(snap.cleared, currency)}
                  </dd>
                </div>
                <div>
                  <dt className="label">Rent on the debt</dt>
                  <dd className="n mt-1 text-[19px] text-root">
                    {formatMoneyShort(plan.monthlyBleed, currency)}
                  </dd>
                  <dd className="text-[12px] text-ink-300">every month, before anything comes down</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* 2. Ren, and the agendas that give a session a reason to exist. */}
        <SessionDeck userName={snap.user.name} agendas={agendas} openAgenda={OPEN_AGENDA} />

        {/* 3. What's on the go this week. */}
        <CommitmentBoard
          commitments={snap.commitments.map((c) => ({
            id: c.id,
            wish: c.wish,
            trigger: c.trigger,
            outcome: c.outcome,
            obstacle: c.obstacle,
            ifThenPlan: c.ifThenPlan,
            dueAt: c.dueAt ? c.dueAt.toISOString() : null,
            status: c.status,
          }))}
        />

        {/* 4. Their words, dated. Hidden entirely when there are none. */}
        {snap.beliefs.length > 0 ? (
          <section className="rounded-card border border-rule bg-card p-5 sm:p-6">
            <p className="label">In your words</p>
            <ul className="mt-3 space-y-3">
              {snap.beliefs.map((item) => (
                <li key={item.id}>
                  <p className="text-[17px] italic leading-snug text-ink-900">
                    &ldquo;{item.text}&rdquo;
                  </p>
                  <p className="mt-1 text-[12px] text-ink-300">
                    Named{" "}
                    {item.namedOn.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* 5. The debts. */}
        <DebtBoard
          debts={snap.debts.map((d) => ({
            id: d.id,
            name: d.name,
            issuer: d.issuer,
            balance: d.balance,
            openingBalance: d.openingBalance,
            monthlyRate: d.monthlyRate,
            minimumPayment: d.minimumPayment,
            isIslamic: d.isIslamic,
            isEstimated: d.isEstimated,
          }))}
          currency={currency}
          focusName={plan.order[0] ?? null}
        />

        <StrategyPicker
          current={snap.strategy}
          currency={currency}
          options={[
            {
              key: "snowball",
              title: "Smallest balance first",
              months: snap.comparison.snowball.months,
              interest: snap.comparison.snowball.totalInterest,
              blurb: "Costs a little more. A card disappears sooner, which is worth more than it looks.",
            },
            {
              key: "avalanche",
              title: "Highest rate first",
              months: snap.comparison.avalanche.months,
              interest: snap.comparison.avalanche.totalInterest,
              blurb: `Keeps ${formatMoneyShort(
                Math.max(0, snap.comparison.interestSavedByAvalanche),
                currency,
              )} out of the bank's hands. Slower to feel like anything.`,
            },
          ]}
        />

        <JarBoard jars={snap.jars} currency={currency} />

        {/* 6. What changed, and the order it happens in. */}
        {plan.feasible && plan.milestones.length > 0 ? (
          <section className="rounded-card border border-rule bg-card p-5 sm:p-6">
            <p className="label">What happens next</p>
            <ol className="mt-4 space-y-4 border-l border-rule pl-5">
              {plan.milestones.map((milestone) => (
                <li key={milestone.debtId} className="relative">
                  <span className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full bg-stem" />
                  <p className="text-[15px] font-bold text-ink-900">{milestone.name} gone</p>
                  <p className="text-[13px] text-ink-400">
                    {milestone.clearedOn} · month <span className="n">{milestone.monthCleared}</span> ·{" "}
                    <span className="n">{formatMoney(milestone.interestPaid, currency)}</span> of
                    interest on the way there
                  </p>
                </li>
              ))}
              <li className="relative">
                <span className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full bg-amber" />
                <p className="text-[15px] font-bold text-ink-900">Clear — {plan.debtFreeOn}</p>
                <p className="text-[13px] text-ink-400">
                  Minimums only would take{" "}
                  {snap.minimumsOnly.feasible ? (
                    <>
                      <span className="n">{snap.minimumsOnly.months}</span> months and{" "}
                      <span className="n">
                        {formatMoney(snap.minimumsOnly.totalInterest, currency)}
                      </span>
                    </>
                  ) : (
                    "far longer and much more"
                  )}
                  .
                </p>
              </li>
            </ol>
          </section>
        ) : null}

        {/* 7. The timeline. */}
        {snap.sessions.length > 0 ? (
          <section className="rounded-card border border-rule bg-card p-5 sm:p-6">
            <p className="label">What you&rsquo;ve worked on</p>
            <ul className="mt-3 divide-y divide-rule">
              {snap.sessions.map((session) => {
                const produced = session.commitments[0];
                return (
                  <li key={session.id} className="py-3.5 first:pt-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[15px] font-bold text-ink-900">{session.agenda}</p>
                      <p className="text-[12px] text-ink-300">
                        {session.startedAt.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        · <span className="n">{session.plannedMinutes}</span> min
                      </p>
                    </div>
                    {produced ? (
                      <p className="mt-1 text-[13px] text-ink-400">
                        {produced.wish}
                        {produced.status === "kept" ? (
                          <span className="chip c-grow ml-2">Done</span>
                        ) : produced.status === "missed" ? (
                          <span className="chip c-neutral ml-2">Not this time</span>
                        ) : null}
                      </p>
                    ) : (
                      <p className="mt-1 text-[13px] text-ink-300">
                        You asked for space. No commitment came out of it, which was the point.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <p className="px-1 text-[12px] leading-relaxed text-ink-300">
          Sproutjar is coaching, not regulated financial, legal or religious advice. Ren describes
          how products work and routes you to your bank, the {snap.country.regulator} or a
          professional for anything that needs a ruling.
        </p>
      </main>
    </div>
  );
}
