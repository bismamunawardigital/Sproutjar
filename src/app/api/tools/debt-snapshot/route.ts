import { NextResponse } from "next/server";
import { assertToolKey } from "@/lib/tool-auth";
import { buildSnapshot } from "@/lib/user";
import { formatMoney, speakableAmount } from "@/lib/money";

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
    total_minimums: formatMoney(snap.totals.minimums, currency),
    cards: snap.debts.map((d) => ({
      name: d.name,
      issuer: d.issuer,
      balance: formatMoney(d.balance, currency),
      monthly_rate: `${(d.monthlyRate * 100).toFixed(2)}%`,
      minimum_payment: formatMoney(d.minimumPayment, currency),
      sharia_compliant: d.isIslamic,
    })),
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
  });
}
