import { NextResponse } from "next/server";
import { currentCaller, isDemo } from "@/lib/caller";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import { convexClient } from "@/lib/convex";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

const debtSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  kind: z.enum(["credit_card", "bnpl", "personal_loan", "overdraft"]).default("credit_card"),
  provider: z.string().max(60).optional(),
  balance: z.coerce.number().nonnegative(),
  monthlyRate: z.coerce.number().min(0).max(1),
  minimumPayment: z.coerce.number().nonnegative(),
  dueDay: z.coerce.number().int().min(1).max(31).optional(),
  statementDay: z.coerce.number().int().min(1).max(31).optional(),
  /** Which of rate | minimum | balance the person was guessing at, comma separated. */
  estimatedFields: z.string().max(40).optional(),
  isIslamic: z.boolean().default(false),
});

export async function GET() {
  const caller = await currentCaller();
  const snap = await buildSnapshot(caller);
  return NextResponse.json(snap.debts);
}

export async function POST(request: Request) {
  const caller = await currentCaller();
  if (isDemo(caller)) return NextResponse.json({ error: "The demo is read-only. Switch back to your own numbers to make changes." }, { status: 403 });
  const parsed = debtSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid debt", issues: parsed.error.issues }, { status: 400 });
  }

  // Bank the growth already earned before the new balance enters the maths,
  // so admitting to another card never costs someone stem.
  const before = await buildSnapshot(caller);
  await convexClient().mutation(api.sproutjar.recordStemPeak, {
    caller, stemPct: before.stemPct });

  const id = await convexClient().mutation(api.sproutjar.addDebt, { caller, ...parsed.data });
  return NextResponse.json({ id, ...parsed.data }, { status: 201 });
}
