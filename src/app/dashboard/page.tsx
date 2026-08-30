import Link from "next/link";
import { CommitmentBoard } from "@/components/CommitmentBoard";
import { Plant } from "@/components/Plant";
import { formatMoneyShort } from "@/lib/money";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function Home() {
  const snap = await buildSnapshot();
  const currency = snap.country.currency;
  const plan = snap.plan;
  const next = plan.milestones[0] ?? null;

  return (
    <>
      <section className="rounded-card border border-rule bg-card p-5 text-center">
        <Plant state={snap.growth} className="mx-auto w-36" />
        <p className="label mt-4">You&rsquo;re debt-free in</p>
        <p className="n mt-1 text-[32px] leading-none text-ink-900">
          {plan.feasible && plan.months > 0 ? plan.debtFreeOn : "Not yet"}
        </p>
        <p className="mt-2 text-[13px] text-ink-400">
          {plan.feasible && plan.months > 0
            ? `${plan.months} months, if you keep putting ${formatMoneyShort(
                snap.surplus,
                currency,
              )} towards it`
            : "There isn't enough left over to cover the minimums yet. Worth talking through with Ren."}
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

      <Link
        href="/dashboard/ren"
        className="flex items-center justify-between rounded-card bg-ink-800 px-5 py-4 text-cream transition hover:bg-ink-700"
      >
        <span>
          <span className="block text-[15px] font-bold">Talk to Ren</span>
          <span className="block text-[13px] text-leaf-300">
            {snap.sessions.length > 0
              ? "Carry on from last time"
              : "Have your first conversation"}
          </span>
        </span>
        <span className="h-9 w-9 rounded-full bg-stem" aria-hidden />
      </Link>

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
