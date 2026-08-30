import { Collapse } from "@/components/Collapse";
import { DebtBoard } from "@/components/DebtBoard";
import { GrowthTabs } from "@/components/GrowthTabs";
import { JarBoard } from "@/components/JarBoard";
import { StrategyPicker } from "@/components/StrategyPicker";
import { formatMoney, formatMoneyShort } from "@/lib/money";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function GrowthPage() {
  const snap = await buildSnapshot();
  const currency = snap.country.currency;
  const plan = snap.plan;

  const strategyLabel =
    snap.strategy === "snowball" ? "Smallest card first" : "Most expensive card first";

  const clearing = (
    <div className="space-y-4">
      <section className="rounded-card border border-rule bg-card p-5">
        <dl className="grid grid-cols-3 gap-3">
          <div>
            <dt className="label">Left to pay</dt>
            <dd className="n mt-1 text-[18px] text-ink-900">
              {formatMoneyShort(snap.totals.debt, currency)}
            </dd>
          </div>
          <div>
            <dt className="label">Clear by</dt>
            <dd className="n mt-1 text-[18px] text-ink-900">
              {plan.feasible && plan.months > 0 ? plan.debtFreeOn : "Not yet"}
            </dd>
          </div>
          <div>
            <dt className="label">Start here</dt>
            <dd className="mt-1 text-[15px] font-bold leading-snug text-stem-700">
              {plan.order[0] ?? "Nothing yet"}
            </dd>
          </div>
        </dl>
      </section>

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

      <Collapse title="Which card to pay off first" hint={strategyLabel}>
      <StrategyPicker
        current={snap.strategy}
        currency={currency}
        options={[
          {
            key: "snowball",
            title: "Smallest one first",
            months: snap.comparison.snowball.months,
            interest: snap.comparison.snowball.totalInterest,
            blurb:
              "A card goes away sooner, which is a good feeling. Costs a bit more.",
          },
          {
            key: "avalanche",
            title: "Most expensive first",
            months: snap.comparison.avalanche.months,
            interest: snap.comparison.avalanche.totalInterest,
            blurb: `Keeps about ${formatMoneyShort(
              Math.max(0, snap.comparison.interestSavedByAvalanche),
              currency,
            )} in your pocket. Takes longer to see.`,
          },
        ]}
      />
      </Collapse>

      {plan.feasible && plan.milestones.length > 0 ? (
        <Collapse
          title="How this plays out"
          hint={`${plan.milestones.length} cards, then done`}
        >
          <ol className="space-y-4 border-l border-rule pl-5">
            {plan.milestones.map((milestone) => (
              <li key={milestone.debtId} className="relative">
                <span className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full bg-stem" />
                <p className="text-[15px] font-bold text-ink-900">
                  {milestone.name} is paid off
                </p>
                <p className="text-[13px] text-ink-400">
                  {milestone.clearedOn} ·{" "}
                  <span className="n">
                    {formatMoney(milestone.interestPaid, currency)}
                  </span>{" "}
                  of interest along the way
                </p>
              </li>
            ))}
            <li className="relative">
              <span className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full bg-amber" />
              <p className="text-[15px] font-bold text-ink-900">
                All clear — {plan.debtFreeOn}
              </p>
              <p className="text-[13px] text-ink-400">
                Paying only the minimums would take{" "}
                {snap.minimumsOnly.feasible ? (
                  <>
                    <span className="n">{snap.minimumsOnly.months}</span> months
                    and cost{" "}
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
        </Collapse>
      ) : null}
    </div>
  );

  return (
    <GrowthTabs
      clearing={clearing}
      building={<JarBoard jars={snap.jars} currency={currency} />}
    />
  );
}
