import { NextResponse } from "next/server";
import { assertToolKey } from "@/lib/tool-auth";
import { buildSnapshot } from "@/lib/user";
import { buildPayoffPlan, monthsOfLifeBack, type Strategy } from "@/lib/debt-engine";
import { formatMoney, speakableAmount } from "@/lib/money";

export const dynamic = "force-dynamic";

/**
 * Answers "what happens if I put X a month at this" without the user leaving the call.
 */
export async function GET(request: Request) {
  const denied = assertToolKey(request);
  if (denied) return denied;

  const params = new URL(request.url).searchParams;
  const snap = await buildSnapshot();
  const currency = snap.country.currency;

  const debts = snap.debts.map((d) => ({
    id: d.id,
    name: d.name,
    issuer: d.issuer,
    balance: d.balance,
    monthlyRate: d.monthlyRate,
    minimumPayment: d.minimumPayment,
  }));

  if (debts.length === 0) {
    return NextResponse.json({ has_data: false, message: "No cards logged yet." });
  }

  const requestedBudget = Number(params.get("monthly_payment"));
  const budget = Number.isFinite(requestedBudget) && requestedBudget > 0 ? requestedBudget : snap.surplus;
  const requestedStrategy = params.get("strategy");
  const strategy: Strategy = requestedStrategy === "avalanche" ? "avalanche" : requestedStrategy === "snowball" ? "snowball" : snap.strategy;

  const plan = buildPayoffPlan(debts, budget, strategy);

  if (!plan.feasible) {
    return NextResponse.json({
      has_data: true,
      feasible: false,
      shortfall: formatMoney(plan.shortfall, currency),
      message:
        "That monthly amount does not cover the minimum payments. This is a hardship conversation, not a plan conversation — the bank's restructuring team needs to be involved.",
    });
  }

  const extra = 500;
  return NextResponse.json({
    has_data: true,
    feasible: true,
    strategy,
    monthly_payment: formatMoney(budget, currency),
    months_to_debt_free: plan.months,
    debt_free_date: plan.debtFreeOn,
    total_interest: formatMoney(plan.totalInterest, currency),
    total_interest_spoken: speakableAmount(plan.totalInterest, currency),
    monthly_bleed_spoken: speakableAmount(plan.monthlyBleed, currency),
    order: plan.order,
    first_card_cleared: plan.milestones[0]
      ? { name: plan.milestones[0].name, on: plan.milestones[0].clearedOn, in_months: plan.milestones[0].monthCleared }
      : null,
    milestones: plan.milestones.map((m) => ({ card: m.name, cleared: m.clearedOn, month: m.monthCleared })),
    minimums_only_months: snap.minimumsOnly.feasible ? snap.minimumsOnly.months : null,
    minimums_only_interest: snap.minimumsOnly.feasible
      ? formatMoney(snap.minimumsOnly.totalInterest, currency)
      : null,
    strategy_comparison: {
      snowball_months: snap.comparison.snowball.months,
      avalanche_months: snap.comparison.avalanche.months,
      interest_saved_by_avalanche: formatMoney(Math.max(0, snap.comparison.interestSavedByAvalanche), currency),
      first_win_sooner_with_snowball_months: snap.comparison.firstWinMonthsSoonerWithSnowball,
    },
    extra_500_a_month_buys_months_back: monthsOfLifeBack(debts, budget, extra, strategy),
  });
}
