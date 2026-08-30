import { NextResponse } from "next/server";
import { assertToolKey } from "@/lib/tool-auth";
import { countryProfile } from "@/lib/money";
import { OFFERS } from "@/lib/reference";

export const dynamic = "force-dynamic";

function pct(monthlyRate: number): string {
  return `${(monthlyRate * 100).toFixed(2)}% per month`;
}

export async function GET(request: Request) {
  const denied = assertToolKey(request);
  if (denied) return denied;

  const bank = new URL(request.url).searchParams.get("bank")?.trim() ?? "";
  if (!bank) {
    return NextResponse.json({ error: "Pass a bank name, e.g. ?bank=ADCB" }, { status: 400 });
  }

  const needle = bank.toLowerCase();
  const matches = OFFERS.filter(
    (o) => o.bank.toLowerCase().includes(needle) || needle.includes(o.bank.toLowerCase()),
  );

  if (matches.length === 0) {
    return NextResponse.json({
      found: false,
      bank,
      message: `Sproutjar has no current balance transfer offer on file for ${bank}.`,
      alternatives: OFFERS.slice(0, 3).map((o) => `${o.bank} — ${o.product}`),
    });
  }

  return NextResponse.json({
    found: true,
    bank: matches[0].bank,
    country: countryProfile(matches[0].country).name,
    currency: countryProfile(matches[0].country).currency,
    offers: matches.map((o) => ({
      product: o.product,
      promo_rate: pct(o.promoMonthlyRate),
      promo_months: o.promoMonths,
      standard_rate_after_promo: pct(o.standardMonthlyRate),
      transfer_fee_pct: o.transferFeePct,
      sharia_compliant: o.isIslamic,
      wording: o.isIslamic ? "profit rate" : "interest rate",
      notes: o.notes,
    })),
    coaching_note:
      "A transfer is a tool, not progress. Only worth it once new spending on the card has stopped.",
  });
}
