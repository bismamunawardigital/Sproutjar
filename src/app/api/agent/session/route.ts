import { NextResponse } from "next/server";
import { elevenLabsConfig, fetchConversationToken } from "@/lib/elevenlabs";
import { buildSnapshot } from "@/lib/user";
import { formatMoney, speakableAmount } from "@/lib/money";

export const dynamic = "force-dynamic";

/**
 * Hands the browser a short-lived WebRTC token plus the dynamic variables Ren needs,
 * so the call opens already knowing the user's real numbers instead of asking for them.
 */
export async function GET() {
  const { apiKey, agentId, configured } = elevenLabsConfig();
  const snap = await buildSnapshot();
  const currency = snap.country.currency;

  const dynamicVariables = {
    user_name: snap.user.name,
    country: snap.country.name,
    currency,
    currency_spoken: snap.country.currencyWord,
    total_debt: formatMoney(snap.totals.debt, currency),
    total_debt_spoken: speakableAmount(snap.totals.debt, currency),
    monthly_surplus: formatMoney(snap.surplus, currency),
    monthly_bleed_spoken: speakableAmount(snap.plan.monthlyBleed, currency),
    debt_free_date: snap.plan.feasible ? snap.plan.debtFreeOn : "not yet reachable",
    smallest_card: snap.comparison.snowball.order[0] ?? "none logged",
    strategy: snap.strategy,
    jar_progress:
      snap.jars.length > 0
        ? `${snap.jars[0].name} at ${snap.jars[0].pct} percent`
        : "no jar started",
    open_commitment: snap.commitments[0]?.wish ?? "none yet",
    card_count: String(snap.debts.length),
    monthly_attack_source: snap.attack.source,
    days_until_payday:
      snap.payday.daysUntil === null ? "unknown" : String(snap.payday.daysUntil),
    last_review_on: snap.lastReview
      ? snap.lastReview.completedAt.toISOString().slice(0, 10)
      : "never",
    interest_outweighs_principal: snap.interestOutweighsPrincipal ? "true" : "false",
    review_cadence: snap.reviewCadence,
  };

  if (!configured) {
    return NextResponse.json(
      {
        configured: false,
        message:
          "Set ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID to start a live voice session with Ren.",
        dynamicVariables,
      },
      { status: 200 },
    );
  }

  try {
    const conversationToken = await fetchConversationToken(agentId!, apiKey!);
    return NextResponse.json({ configured: true, conversationToken, agentId, dynamicVariables });
  } catch (error) {
    return NextResponse.json(
      { configured: false, message: (error as Error).message, dynamicVariables },
      { status: 502 },
    );
  }
}
