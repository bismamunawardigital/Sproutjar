import { NextResponse } from "next/server";
import { z } from "zod";
import { currentCaller, isDemo } from "@/lib/caller";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { convexClient } from "@/lib/convex";

export const dynamic = "force-dynamic";

const schema = z.object({ amount: z.coerce.number().positive() });

type Params = { params: Promise<{ id: string }> };

/** "I paid this": knocks the amount off the card and keeps it in the history. */
export async function POST(request: Request, { params }: Params) {
  const caller = await currentCaller();
  if (isDemo(caller)) return NextResponse.json({ error: "The demo is read-only. Switch back to your own numbers to log a payment." }, { status: 403 });
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Enter the amount you paid." }, { status: 400 });
  const debt = await convexClient().mutation(api.sproutjar.logPayment, {
    caller,
    debtId: id as Id<"debts">,
    amount: parsed.data.amount,
    source: "payment",
  });
  if (!debt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(debt);
}
