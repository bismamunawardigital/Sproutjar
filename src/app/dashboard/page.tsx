import Link from "next/link";
import { CommitmentBoard } from "@/components/CommitmentBoard";
import { DebtBoard } from "@/components/DebtBoard";
import { JarBoard } from "@/components/JarBoard";
import { Logo } from "@/components/Logo";
import { RenSession } from "@/components/RenSession";
import { StatCard } from "@/components/StatCard";
import { StrategyPicker } from "@/components/StrategyPicker";
import { formatMoney } from "@/lib/money";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const snap = await buildSnapshot();
  const currency = snap.country.currency;
  const plan = snap.plan;
  const firstWin = plan.milestones[0];

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-sand bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/">
            <Logo />
          </Link>
          <p className="text-sm text-ink-soft">
            {snap.user.name} · {snap.country.name}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <RenSession userName={snap.user.name} />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total owed"
            value={formatMoney(snap.totals.debt, currency)}
            hint={`${snap.debts.length} card${snap.debts.length === 1 ? "" : "s"}, minimums ${formatMoney(snap.totals.minimums, currency)} a month`}
          />
          <StatCard
            label="Debt-free"
            value={plan.feasible && plan.months > 0 ? plan.debtFreeOn : "Not yet"}
            tone={plan.feasible ? "good" : "warn"}
            hint={
              plan.feasible && plan.months > 0
                ? `${plan.months} months at ${formatMoney(snap.surplus, currency)} a month`
                : `Your surplus does not cover the minimums yet — short by ${formatMoney(plan.shortfall, currency)}.`
            }
          />
          <StatCard
            label="Monthly bleed"
            value={formatMoney(plan.monthlyBleed, currency)}
            tone="warn"
            hint="What the balances cost every month just to exist."
          />
          <StatCard
            label="First card cleared"
            value={firstWin ? firstWin.clearedOn : "—"}
            tone="good"
            hint={firstWin ? `${firstWin.name}, in ${firstWin.monthCleared} months.` : "Add a card to see your first win."}
          />
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <DebtBoard
              debts={snap.debts.map((d) => ({
                id: d.id,
                name: d.name,
                issuer: d.issuer,
                balance: d.balance,
                monthlyRate: d.monthlyRate,
                minimumPayment: d.minimumPayment,
                isIslamic: d.isIslamic,
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
                  title: "Snowball — smallest first",
                  months: snap.comparison.snowball.months,
                  interest: snap.comparison.snowball.totalInterest,
                  blurb: "Costs a little more, but the first card disappears sooner. Best when motivation is fragile.",
                },
                {
                  key: "avalanche",
                  title: "Avalanche — highest rate first",
                  months: snap.comparison.avalanche.months,
                  interest: snap.comparison.avalanche.totalInterest,
                  blurb: `Saves ${formatMoney(Math.max(0, snap.comparison.interestSavedByAvalanche), currency)} in interest. Best if you can run on discipline.`,
                },
              ]}
            />

            {plan.feasible && plan.milestones.length > 0 ? (
              <div className="rounded-2xl border border-sand bg-cream p-6">
                <h3 className="font-display text-xl font-semibold">The order, month by month</h3>
                <ol className="mt-5 space-y-4 border-l border-sand pl-6">
                  {plan.milestones.map((milestone) => (
                    <li key={milestone.debtId} className="relative">
                      <span className="absolute -left-[1.85rem] top-1.5 h-3 w-3 rounded-full bg-moss" />
                      <p className="font-medium">{milestone.name}</p>
                      <p className="text-sm text-ink-soft">
                        Cleared {milestone.clearedOn} · month {milestone.monthCleared} ·{" "}
                        {formatMoney(milestone.interestPaid, currency)} interest paid
                      </p>
                    </li>
                  ))}
                  <li className="relative">
                    <span className="absolute -left-[1.85rem] top-1.5 h-3 w-3 rounded-full bg-clay" />
                    <p className="font-medium text-clay">Free — {plan.debtFreeOn}</p>
                    <p className="text-sm text-ink-soft">
                      Paying minimums only would take{" "}
                      {snap.minimumsOnly.feasible ? `${snap.minimumsOnly.months} months` : "far longer"} and{" "}
                      {snap.minimumsOnly.feasible
                        ? formatMoney(snap.minimumsOnly.totalInterest, currency)
                        : "much more"}{" "}
                      in interest.
                    </p>
                  </li>
                </ol>
              </div>
            ) : null}
          </div>

          <div className="space-y-8">
            <JarBoard jars={snap.jars} currency={currency} />
            <CommitmentBoard
              commitments={snap.commitments.map((c) => ({
                id: c.id,
                wish: c.wish,
                outcome: c.outcome,
                obstacle: c.obstacle,
                ifThenPlan: c.ifThenPlan,
                dueAt: c.dueAt ? c.dueAt.toISOString() : null,
                status: c.status,
              }))}
            />
            <div className="rounded-2xl border border-sand bg-cream-deep p-6 text-sm leading-relaxed text-ink-soft">
              <p className="font-medium text-bark">Where your money goes this month</p>
              <p className="mt-2">
                Surplus of {formatMoney(snap.surplus, currency)} splits{" "}
                {formatMoney(snap.split.toJar, currency)} into the buffer jar and{" "}
                {formatMoney(snap.split.toDebt, currency)} at the cards.{" "}
                {snap.split.jarComplete
                  ? "Your buffer is full, so everything goes at the debt."
                  : "The jar fills first — without it the next surprise bill goes back on a card."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
