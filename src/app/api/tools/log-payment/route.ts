import { NextResponse } from "next/server";
import { callerFromRenToken, isDemo } from "@/lib/caller";
import { z } from "zod";
import { api } from "../../../../../convex/_generated/api";
import { convexClient } from "@/lib/convex";
import { assertToolKey } from "@/lib/tool-auth";
import { currentUser } from "@/lib/user";
import { countryProfile, formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  user: z.string().optional(),
  amount: z.coerce.number().positive(),
  card_name: z.string().optional(),
});

/** Ren's "I paid this": the person says they paid a card, the balance moves the same minute. */
export async function POST(request: Request) {
  const denied = assertToolKey(request);
  if (denied) return denied;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.issues }, { status: 400 });
  }
  const caller = callerFromRenToken(parsed.data.user);
  if (isDemo(caller)) return NextResponse.json({ error: "This is the demo. Nothing is saved for it." }, { status: 403 });

  const target = await convexClient().query(api.sproutjar.debtByName, { caller, needle: parsed.data.card_name });
  if (!target) {
    return NextResponse.json(
      { error: "Could not tell which card that was. Ask which card they paid, by name." },
      { status: 404 },
    );
  }

  const updated = await convexClient().mutation(api.sproutjar.logPayment, {
    caller,
    debtId: target._id,
    amount: parsed.data.amount,
    source: "ren",
  });
  if (!updated) return NextResponse.json({ error: "That card is gone." }, { status: 404 });

  const user = await currentUser(caller);
  const currency = countryProfile(user.country).currency;
  return NextResponse.json({
    saved: true,
    card: updated.name,
    paid: formatMoney(parsed.data.amount, currency),
    new_balance: formatMoney(updated.balance, currency),
    cleared: updated.balance <= 0,
  });
}
