import { CommitmentBoard } from "@/components/CommitmentBoard";
import { HomeAgendas } from "@/components/HomeAgendas";
import { PaydayInvitation } from "@/components/PaydayInvitation";
import { Plant } from "@/components/Plant";
import { formatMoneyShort } from "@/lib/money";
import { agendasFor } from "@/lib/session-agendas";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function Today() {
  const snap = await buildSnapshot();
  const currency = snap.country.currency;
  const plan = snap.plan;
  const next = plan.milestones[0] ?? null;
  const agendas = agendasFor(snap);
  const building = snap.horizon === "building";
  // When nothing is open, Today carries forward the last thing said on a call
  // rather than showing an empty card.
  const byRecency = snap.recentCommitments
    .filter((c) => c.status !== "open")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  // Something left for another time comes back first; a finished one is only
  // offered again when there is nothing unfinished behind it.
  const closed = byRecency.find((c) => c.status !== "kept") ?? byRecency[0];
  const lastSession = closed
    ? snap.sessions.find((s) => s.id === closed.sessionId) ?? null
    : null;
  const last = closed
    ? {
        wish: closed.wish,
        trigger: closed.trigger,
        ifThenPlan: closed.ifThenPlan,
        status: closed.status,
        agenda: lastSession?.agenda ?? null,
        on: closed.createdAt.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        }),
      }
    : null;

  return (
    <>
      <section className="rounded-card border border-rule bg-card p-5 text-center">
        <Plant state={snap.growth} className="mx-auto w-28" />
        {building ? (
          <>
            <p className="label mt-3">Months you could cover</p>
            <p className="n mt-1 text-[32px] leading-none text-ink-900">
              {snap.runwayMonths.toFixed(1)}
            </p>
            <p className="mt-2 text-[13px] text-ink-400">
              The cards are gone. This is how long the jars would hold if the income stopped.
            </p>
          </>
        ) : (
          <>
            <p className="label mt-3">You&rsquo;re debt-free in</p>
            <p className="n mt-1 text-[32px] leading-none text-ink-900">
              {plan.feasible && plan.months > 0 ? plan.debtFreeOn : "Not yet"}
            </p>
            <p className="mt-2 text-[13px] text-ink-400">
              {plan.feasible && plan.months > 0
                ? `${plan.months} months at ${formatMoneyShort(snap.attack.amount, currency)} a month`
                : "The minimums need more than there is right now. Ren can help you work the other side of it."}
            </p>
          </>
        )}

        <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-rule pt-4 text-left">
          <div>
            <dt className="label">{building ? "Set aside" : "Left to pay"}</dt>
            <dd className="n mt-1 text-[16px] text-ink-900">
              {formatMoneyShort(building ? snap.totals.saved : snap.totals.debt, currency)}
            </dd>
          </div>
          <div>
            <dt className="label">Paid off</dt>
            <dd className="n mt-1 text-[16px] text-stem-700">
              {formatMoneyShort(snap.cleared, currency)}
            </dd>
          </div>
          <div>
            <dt className="label">{building ? "Free each month" : "Rent on the debt"}</dt>
            <dd className={`n mt-1 text-[16px] ${building ? "text-stem-700" : "text-root"}`}>
              {formatMoneyShort(building ? snap.attack.amount : plan.monthlyBleed, currency)}
            </dd>
            <dd className="mt-0.5 text-[11px] leading-snug text-ink-300">
              {building ? "no longer going to a bank" : "the interest, every month"}
            </dd>
          </div>
        </dl>
      </section>

      {!building && snap.payday.isWindow && snap.payday.day ? (
        <PaydayInvitation
          amount={snap.attack.amount}
          source={snap.attack.source}
          derived={snap.attack.derived}
          currency={currency}
          paydayDay={snap.payday.day}
          daysUntil={snap.payday.daysUntil}
        />
      ) : null}

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
        last={last}
      />

      <HomeAgendas agendas={agendas} hasHistory={snap.sessions.length > 0} />

      {next ? (
        <section className="rounded-card border border-rule bg-card p-5">
          <p className="label">The next card you finish with</p>
          <p className="mt-1 text-[15px] font-bold text-ink-900">{next.name}</p>
          <p className="text-[13px] text-ink-400">Paid off by {next.clearedOn}</p>
        </section>
      ) : null}
    </>
  );
}
