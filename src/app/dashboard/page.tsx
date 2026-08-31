import { CommitmentBoard } from "@/components/CommitmentBoard";
import { HomeAgendas } from "@/components/HomeAgendas";
import { Plant } from "@/components/Plant";
import { formatMoneyShort } from "@/lib/money";
import { agendasFor } from "@/lib/session-agendas";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function Home() {
  const snap = await buildSnapshot();
  const currency = snap.country.currency;
  const plan = snap.plan;
  const next = plan.milestones[0] ?? null;
  const agendas = agendasFor(snap);
  // When nothing is open, Home carries forward the last thing said on a call
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
        {snap.sessions.length > 0 ? (
          <p className="mt-2 text-[12px] text-root">
            <span className="n">{snap.sessions.length}</span>{" "}
            {snap.sessions.length === 1 ? "talk" : "talks"}, one root each
          </p>
        ) : null}
        <p className="label mt-3">You&rsquo;re debt-free in</p>
        <p className="n mt-1 text-[32px] leading-none text-ink-900">
          {plan.feasible && plan.months > 0 ? plan.debtFreeOn : "Not yet"}
        </p>
        <p className="mt-2 text-[13px] text-ink-400">
          {plan.feasible && plan.months > 0
            ? `${plan.months} months at ${formatMoneyShort(snap.surplus, currency)} a month`
            : "The minimums need more than there is right now. Ren can help you work the other side of it."}
        </p>

        <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-rule pt-4 text-left">
          <div>
            <dt className="label">Left to pay</dt>
            <dd className="n mt-1 text-[16px] text-ink-900">
              {formatMoneyShort(snap.totals.debt, currency)}
            </dd>
          </div>
          <div>
            <dt className="label">Paid off</dt>
            <dd className="n mt-1 text-[16px] text-stem-700">
              {formatMoneyShort(snap.cleared, currency)}
            </dd>
          </div>
          <div>
            <dt className="label">Rent on the debt</dt>
            <dd className="n mt-1 text-[16px] text-root">
              {formatMoneyShort(plan.monthlyBleed, currency)}
            </dd>
            <dd className="mt-0.5 text-[11px] leading-snug text-ink-300">
              the interest, every month
            </dd>
          </div>
        </dl>
      </section>

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
