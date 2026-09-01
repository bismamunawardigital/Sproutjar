import { NextResponse } from "next/server";
import { retrieve } from "@/lib/context-dev";
import { countryProfile } from "@/lib/money";
import { OFFERS } from "@/lib/reference";
import { assertToolKey } from "@/lib/tool-auth";

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
  const country = matches.length > 0 ? countryProfile(matches[0].country) : null;

  const live = await retrieve(
    `${bank} credit card balance transfer promotional rate transfer fee revert rate`,
    { country: country ? country.code.toLowerCase() : "ae", officialHint: bank },
  );

  return NextResponse.json({
    bank: matches.length > 0 ? matches[0].bank : bank,
    country: country ? country.name : null,
    currency: country ? country.currency : null,
    live: live.ok
      ? {
          retrieved: true,
          retrieved_at: live.retrievedAt,
          instruction:
            "Quote these figures with the bank and the retrieval date. Say a transfer is a proposal until the person confirms it.",
          published_terms: live.terms,
          published_terms_note:
            live.terms === null
              ? "No page on that bank's own site could be read, so quote nothing as their current offer."
              : null,
          sources: live.sources,
        }
      : {
          retrieved: false,
          reason: live.reason,
          instruction:
            "Say plainly that you could not check the bank's current offer just now, and do not present the reference figures below as today's rates.",
        },
    reference_table: {
      note: "Dated reference figures held in the app. Useful for shape and order of magnitude, never quotable as current.",
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
      alternatives:
        matches.length === 0 ? OFFERS.slice(0, 3).map((o) => `${o.bank}, ${o.product}`) : [],
    },
    coaching_note:
      "A transfer is a tool, not progress. Only worth it once new spending on the card has stopped.",
  });
}
