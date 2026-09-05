import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { retrieve } from "@/lib/context-dev";
import { convexClient } from "@/lib/convex";
import { assertToolKey } from "@/lib/tool-auth";
import { formatMoney } from "@/lib/money";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  from_card: z.string().min(1),
  to_bank: z.string().min(1),
  to_card: z.string().default(""),
  amount: z.coerce.number().positive(),
  monthly_rate: z.coerce.number().min(0).max(1),
  promo_months: z.coerce.number().int().min(0).max(60).default(12),
  fee: z.coerce.number().min(0).default(0),
  revert_rate: z.coerce.number().min(0).max(1).default(0),
  note: z.string().default(""),
});

/**
 * Ren files the transfer it worked out on the call. It is a proposal, not a
 * change: the cards only move when the person taps apply on Plan. The bank's
 * own published terms are read again here, server-side, so the card on Plan
 * carries a source and a time rather than whatever was said out loud.
 */
export async function POST(request: Request) {
  const denied = assertToolKey(request);
  if (denied) return denied;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const body = parsed.data;

  const snap = await buildSnapshot();
  const needle = body.from_card.toLowerCase();
  const from =
    snap.debts.find((debt) => debt.name.toLowerCase().includes(needle)) ??
    snap.debts.find((debt) => debt.issuer.toLowerCase().includes(needle));

  if (!from) {
    return NextResponse.json({
      proposed: false,
      message: `No card here matches "${body.from_card}".`,
      cards: snap.debts.map((debt) => debt.name),
    });
  }

  const currency = snap.country.currency;
  const live = await retrieve(
    `${body.to_bank} credit card balance transfer promotional rate transfer fee revert rate`,
    { country: snap.country.code.toLowerCase(), officialHint: body.to_bank },
  );
  const published: Partial<Record<
    | "sourceUrl"
    | "sourceTitle"
    | "retrievedAt"
    | "publishedPromoRate"
    | "publishedPromoPeriod"
    | "publishedRevertRate"
    | "publishedFee"
    | "publishedEarlySettlementFee",
    string
  >> =
    live.ok && live.terms
      ? {
          sourceUrl: live.terms.source_url,
          sourceTitle: live.sources.find((s) => s.url === live.terms?.source_url)?.title,
          retrievedAt: live.retrievedAt,
          publishedPromoRate: live.terms.promotional_rate ?? undefined,
          publishedPromoPeriod: live.terms.promotional_period ?? undefined,
          publishedRevertRate: live.terms.standard_or_revert_rate ?? undefined,
          publishedFee: live.terms.transfer_fee ?? undefined,
          publishedEarlySettlementFee: live.terms.early_settlement_fee ?? undefined,
        }
      : {};

  const id = await convexClient().mutation(api.sproutjar.proposeBalanceMove, {
    fromDebtId: from.id as Id<"debts">,
    toIssuer: body.to_bank,
    toName: body.to_card || `${body.to_bank} transfer`,
    amount: Math.min(body.amount, from.balance),
    monthlyRate: body.monthly_rate,
    promoMonths: body.promo_months,
    fee: body.fee,
    revertRate: body.revert_rate,
    note: body.note,
    ...published,
  });

  return NextResponse.json({
    proposed: true,
    id,
    from: from.name,
    confirmation:
      `Filed on their Plan screen: move ${formatMoney(Math.min(body.amount, from.balance), currency)} ` +
      `from ${from.name} to ${body.to_bank}. Nothing changes until they apply it.` +
      (published.sourceUrl
        ? " The card shows the bank's published terms with the source and the time they were read."
        : " The bank's page could not be read just now, so the card says the terms are from the call and to check them with the bank."),
  });
}
