import { NextResponse } from "next/server";
import { assertToolKey } from "@/lib/tool-auth";
import { buildSnapshot } from "@/lib/user";
import { annualRate, formatMoney, speakableAmount } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = assertToolKey(request);
  if (denied) return denied;

  const snap = await buildSnapshot();
  const currency = snap.country.currency;

  return NextResponse.json({
    name: snap.user.name,
    country: snap.country.name,
    currency,
    currency_spoken: snap.country.currencyWord,
    total_debt: formatMoney(snap.totals.debt, currency),
    total_debt_spoken: speakableAmount(snap.totals.debt, currency),
    monthly_bleed: formatMoney(snap.plan.monthlyBleed, currency),
    monthly_bleed_spoken: speakableAmount(snap.plan.monthlyBleed, currency),
    monthly_surplus: formatMoney(snap.surplus, currency),
    /** The same amount, with where it came from: the formula, or the person's own figure. */
    monthly_attack: formatMoney(snap.attack.amount, currency),
    monthly_attack_source: snap.attack.source,
    monthly_attack_derived: formatMoney(snap.attack.derived, currency),
    payday_day: snap.payday.day ?? null,
    days_until_payday: snap.payday.daysUntil,
    windfall_rule: snap.user.windfallRule ?? null,
    total_minimums: formatMoney(snap.totals.minimums, currency),
    cards: snap.debts.map((d) => ({
      name: d.name,
      issuer: d.issuer,
      kind: d.kind,
      provider: d.provider ?? null,
      balance: formatMoney(d.balance, currency),
      monthly_rate: `${(d.monthlyRate * 100).toFixed(2)}%`,
      /** Simple annualisation, monthly times twelve; say "a year", never compound it. */
      annual_rate: `${(annualRate(d.monthlyRate) * 100).toFixed(2)}%`,
      minimum_payment: formatMoney(d.minimumPayment, currency),
      due_day: d.dueDay ?? null,
      statement_day: d.statementDay ?? null,
      estimated_fields: d.estimatedFields ?? (d.isEstimated ? "rate" : null),
      sharia_compliant: d.isIslamic,
      last_statement: d.lastReviewed
        ? {
            on: d.lastReviewed.at.toISOString().slice(0, 10),
            paid: formatMoney(d.lastReviewed.paid, currency),
            interest_charged: formatMoney(d.lastReviewed.interestCharged, currency),
            new_borrowing: formatMoney(d.lastReviewed.newBorrowing, currency),
          }
        : null,
    })),
    /** The four numbers from the last review, if the person has done one. */
    last_review: snap.lastReview
      ? {
          on: snap.lastReview.completedAt.toISOString().slice(0, 10),
          cadence: snap.reviewCadence,
          debt_at_start: formatMoney(snap.lastReview.openingDebt, currency),
          new_borrowing: formatMoney(snap.lastReview.newBorrowing, currency),
          principal_repaid: formatMoney(snap.lastReview.principalRepaid, currency),
          interest_burned: formatMoney(snap.lastReview.interestCharged, currency),
          debt_free_before: snap.lastReview.debtFreeBefore,
          debt_free_after: snap.lastReview.debtFreeAfter,
          reflection: snap.lastReview.reflection,
        }
      : null,
    since_review: {
      principal_repaid: formatMoney(snap.sinceReview.principalRepaid, currency),
      interest_burned: formatMoney(snap.sinceReview.interestCharged, currency),
      new_borrowing: formatMoney(snap.sinceReview.newBorrowing, currency),
    },
    /** True when the bank took more last month than the plan cleared; the only time to raise a transfer unprompted. */
    interest_outweighs_principal: snap.interestOutweighsPrincipal,
    smallest_card: snap.comparison.snowball.order[0] ?? null,
    highest_rate_card: snap.comparison.avalanche.order[0] ?? null,
    jars: snap.jars.map((j) => ({
      name: j.name,
      purpose: j.purpose,
      saved: formatMoney(j.saved, currency),
      target: formatMoney(j.target, currency),
      percent_full: j.pct,
      stage: j.stage,
    })),
    open_commitments: snap.commitments.map((c) => ({
      wish: c.wish,
      if_then_plan: c.ifThenPlan,
      due: c.dueAt?.toISOString().slice(0, 10) ?? null,
    })),
    has_data: snap.debts.length > 0,
    /** clearing while cards remain; building once they are gone. */
    horizon: snap.horizon,
    months_of_cover: snap.runwayMonths.toFixed(1),
    pending_transfers: snap.proposals.map((p) => ({
      from_card: p.fromName,
      to_bank: p.toIssuer,
      amount: formatMoney(p.amount, currency),
      waiting_since: p.createdAt.toISOString().slice(0, 10),
      source_url: p.sourceUrl ?? null,
      retrieved_at: p.retrievedAt ?? null,
    })),
    /** What the monthly amount becomes once the last card clears. */
    after_debt: snap.afterDebt.map((step) => ({
      jar: step.name,
      still_to_fill: formatMoney(step.remaining, currency),
      full_by: step.fillsOn,
    })),
  });
}
