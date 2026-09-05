import Link from "next/link";
import { Collapse } from "@/components/Collapse";
import { DebtBoard } from "@/components/DebtBoard";
import { GrowthTabs } from "@/components/GrowthTabs";
import { JarBoard } from "@/components/JarBoard";
import { PendingTransfers } from "@/components/PendingTransfers";
import { ReviewRitual } from "@/components/ReviewRitual";
import { StrategyPicker } from "@/components/StrategyPicker";
import { formatMoney, formatMoneyShort } from "@/lib/money";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const snap = await buildSnapshot();
  const currency = snap.country.currency;
  const plan = snap.plan;
  const attack = snap.attack;

  const strategyLabel =
    snap.strategy === "snowball" ? "Smallest card first" : "Most expensive card first";

  const { snowball, avalanche, interestSavedByAvalanche, monthsSavedByAvalanche, firstWinMonthsSoonerWithSnowball } =
    snap.comparison;

  const snowballBlurb =
    firstWinMonthsSoonerWithSnowball > 0
      ? `The first card is gone ${firstWinMonthsSoonerWithSnowball} ${
          firstWinMonthsSoonerWithSnowball === 1 ? "month" : "months"
        } sooner. Costs about ${formatMoneyShort(Math.max(0, interestSavedByAvalanche), currency)} more in interest over the whole run.`
      : `A card closes early, which some people need to see. ${
          interestSavedByAvalanche > 0
            ? `Costs about ${formatMoneyShort(interestSavedByAvalanche, currency)} more over the whole run.`
            : "Costs about the same overall."
        }`;

  const avalancheBlurb =
    interestSavedByAvalanche > 0
      ? `Keeps about ${formatMoneyShort(interestSavedByAvalanche, currency)} out of the banks' hands${
          monthsSavedByAvalanche > 0
            ? ` and finishes ${monthsSavedByAvalanche} ${monthsSavedByAvalanche === 1 ? "month" : "months"} sooner`
            : ""
        }. The first card takes longer to close.`
      : "Cheapest on paper. With these cards the difference is small.";

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
        <p className="mt-4 border-t border-rule pt-3 text-[13px] leading-relaxed text-ink-400">
          Running on <span className="n text-ink-700">{formatMoneyShort(attack.amount, currency)}</span> a
          month, {attack.source === "chosen" ? "the figure you chose" : "worked out from what you told Ren"}.
          {attack.source === "chosen" && attack.derived !== attack.amount ? (
            <>
              {" "}
              The sums say <span className="n">{formatMoneyShort(attack.derived, currency)}</span>.
            </>
          ) : null}{" "}
          <Link
            href="/dashboard/you"
            className="font-bold text-stem-700 underline decoration-stem/40 underline-offset-2 hover:decoration-stem"
          >
            Change it in You
          </Link>
          .
        </p>
      </section>

      <PendingTransfers
        currency={currency}
        monthlyAttack={attack.amount}
        transfers={snap.proposals
          .filter((p) => p.kind === "balance_move")
          .map((p) => ({
            id: p.id,
            fromName: p.fromName,
            fromRate: p.fromRate,
            toIssuer: p.toIssuer,
            toName: p.toName,
            amount: p.amount,
            monthlyRate: p.monthlyRate,
            promoMonths: p.promoMonths,
            fee: p.fee,
            revertRate: p.revertRate,
            note: p.note,
            on: p.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
            sourceUrl: p.sourceUrl,
            sourceTitle: p.sourceTitle,
            retrievedAt: p.retrievedAt,
            publishedPromoRate: p.publishedPromoRate,
            publishedPromoPeriod: p.publishedPromoPeriod,
            publishedRevertRate: p.publishedRevertRate,
            publishedFee: p.publishedFee,
            publishedEarlySettlementFee: p.publishedEarlySettlementFee,
          }))}
      />

      <ReviewRitual
        currency={currency}
        cadence={snap.reviewCadence}
        debtFreeOn={plan.debtFreeOn}
        payday={snap.payday}
        cards={snap.debts
          .filter((d) => d.balance > 0)
          .map((d) => ({ id: d.id, name: d.name, balance: d.balance, minimumPayment: d.minimumPayment }))}
        reviews={snap.reviews.map((r) => ({
          id: r.id,
          cadence: r.cadence,
          completedAt: r.completedAt.toISOString(),
          openingDebt: r.openingDebt,
          closingDebt: r.closingDebt,
          paid: r.paid,
          principalRepaid: r.principalRepaid,
          interestCharged: r.interestCharged,
          newBorrowing: r.newBorrowing,
          debtFreeBefore: r.debtFreeBefore,
          debtFreeAfter: r.debtFreeAfter,
          reflection: r.reflection,
        }))}
      />

      <DebtBoard
        debts={snap.debts.map((d) => ({
          id: d.id,
          name: d.name,
          issuer: d.issuer,
          kind: d.kind,
          provider: d.provider,
          balance: d.balance,
          openingBalance: d.openingBalance,
          monthlyRate: d.monthlyRate,
          minimumPayment: d.minimumPayment,
          dueDay: d.dueDay,
          statementDay: d.statementDay,
          isIslamic: d.isIslamic,
          isEstimated: d.isEstimated,
          estimatedFields: d.estimatedFields,
          lastReviewed: d.lastReviewed
            ? { ...d.lastReviewed, at: d.lastReviewed.at.toISOString() }
            : null,
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
              months: snowball.months,
              interest: snowball.totalInterest,
              blurb: snowballBlurb,
            },
            {
              key: "avalanche",
              title: "Most expensive first",
              months: avalanche.months,
              interest: avalanche.totalInterest,
              blurb: avalancheBlurb,
            },
          ]}
        />
        <p className="mt-3 text-[12px] leading-relaxed text-ink-400">
          Neither is wrong. One is cheaper, the other is easier to keep going with. Ren will ask
          which matters more to you, not tell you.
        </p>
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
                All clear, {plan.debtFreeOn}
              </p>
              <p className="text-[13px] text-ink-400">
                <span className="n">{formatMoney(plan.totalPaid, currency)}</span> paid in all,{" "}
                <span className="n">{formatMoney(plan.totalInterest, currency)}</span> of it interest.
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
            {snap.afterDebt.map((step) => (
              <li key={step.name} className="relative">
                <span className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-stem bg-card" />
                <p className="text-[15px] font-bold text-ink-900">{step.name} is full</p>
                <p className="text-[13px] text-ink-400">
                  {step.fillsOn} · the same{" "}
                  <span className="n">{formatMoneyShort(attack.amount, currency)}</span> a month, now
                  yours to keep
                </p>
              </li>
            ))}
          </ol>
          {snap.afterDebt.length > 0 ? (
            <p className="mt-4 text-[12px] leading-relaxed text-ink-400">
              After the last card the payment doesn&rsquo;t stop, it changes direction: reserve first,
              then the jars. Where it goes after that is a conversation with Ren, not a default.
            </p>
          ) : null}
        </Collapse>
      ) : null}
    </div>
  );

  return (
    <GrowthTabs
      clearing={clearing}
      building={
        <div className="space-y-4">
          {snap.horizon === "clearing" && snap.afterDebt.length > 0 ? (
            <section className="rounded-card border border-rule bg-card p-5">
              <p className="label">Once the cards are gone</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-700">
                From {plan.debtFreeOn} the{" "}
                <span className="n">{formatMoneyShort(attack.amount, currency)}</span> a month keeps
                leaving your account, but it stays yours.
              </p>
              <ol className="mt-3 space-y-2">
                {snap.afterDebt.map((step) => (
                  <li key={step.name} className="flex items-baseline justify-between gap-3 text-[14px]">
                    <span className="text-ink-700">
                      {step.name}
                      <span className="text-ink-400">
                        {" "}
                        · <span className="n">{formatMoneyShort(step.remaining, currency)}</span> to go
                      </span>
                    </span>
                    <span className="n shrink-0 text-ink-900">{step.fillsOn}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
          <JarBoard jars={snap.jars} currency={currency} />
        </div>
      }
    />
  );
}
