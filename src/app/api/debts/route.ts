import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import { convex } from "@/lib/convex";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

const debtSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  kind: z.string().default("credit_card"),
  balance: z.coerce.number().nonnegative(),
  monthlyRate: z.coerce.number().min(0).max(1),
  minimumPayment: z.coerce.number().nonnegative(),
  isIslamic: z.boolean().default(false),
});

export async function GET() {
  const snap = await buildSnapshot();
  return NextResponse.json(snap.debts);
}

export async function POST(request: Request) {
  const parsed = debtSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid debt", issues: parsed.error.issues }, { status: 400 });
  }

  // Bank the growth already earned before the new balance enters the maths,
  // so admitting to another card never costs someone stem.
  const before = await buildSnapshot();
  await convex.mutation(api.sproutjar.recordStemPeak, { stemPct: before.stemPct });

  const id = await convex.mutation(api.sproutjar.addDebt, parsed.data);
  return NextResponse.json({ id, ...parsed.data }, { status: 201 });
}
