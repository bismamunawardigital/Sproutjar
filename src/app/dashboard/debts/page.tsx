import { DebtBoard } from "@/components/DebtBoard";
import { StrategyPicker } from "@/components/StrategyPicker";
import { formatMoney, formatMoneyShort } from "@/lib/money";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function DebtsPage() {
  const snap = await buildSnapshot();
  const currency = snap.country.currency;
  const plan = snap.plan;

  return (
    <>
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
            title: "Smallest one first",
            months: snap.comparison.snowball.months,
            interest: snap.comparison.snowball.totalInterest,
            blurb: "A card goes away sooner, which feels like something. Costs a bit more.",
          },
          {
            key: "avalanche",
            title: "Most expensive first",
            months: snap.comparison.avalanche.months,
            interest: snap.comparison.avalanche.totalInterest,
            blurb: `Saves you about ${formatMoneyShort(
              Math.max(0, snap.comparison.interestSavedByAvalanche),
              currency,
            )}. Slower to feel like progress.`,
          },
        ]}
      />

      {plan.feasible && plan.milestones.length > 0 ? (
        <section className="rounded-card border border-rule bg-card p-5">
          <p className="label">How this plays out</p>
          <ol className="mt-4 space-y-4 border-l border-rule pl-5">
            {plan.milestones.map((milestone) => (
              <li key={milestone.debtId} className="relative">
                <span className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full bg-stem" />
                <p className="text-[15px] font-bold text-ink-900">
                  {milestone.name} is paid off
                </p>
                <p className="text-[13px] text-ink-400">
                  {milestone.clearedOn} · costs you{" "}
                  <span className="n">{formatMoney(milestone.interestPaid, currency)}</span> in
                  interest getting there
                </p>
              </li>
            ))}
            <li className="relative">
              <span className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full bg-amber" />
              <p className="text-[15px] font-bold text-ink-900">
                You&rsquo;re done — {plan.debtFreeOn}
              </p>
              <p className="text-[13px] text-ink-400">
                Paying only the minimums would take{" "}
                {snap.minimumsOnly.feasible ? (
                  <>
                    <span className="n">{snap.minimumsOnly.months}</span> months and cost{" "}
                    <span className="n">
                      {formatMoney(snap.minimumsOnly.totalInterest, currency)}
                    </span>
                  </>
                ) : (
                  "far longer and cost a lot more"
                )}
                .
              </p>
            </li>
          </ol>
        </section>
      ) : null}
    </>
  );
}
