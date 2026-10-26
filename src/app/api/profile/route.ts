import { NextResponse } from "next/server";
import { currentCaller, isDemo } from "@/lib/caller";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import { convexClient } from "@/lib/convex";
import { currentUser } from "@/lib/user";
import { COUNTRIES } from "@/lib/money";

export const dynamic = "force-dynamic";

const money = z.coerce.number().nonnegative().optional();

const profileSchema = z.object({
  name: z.string().trim().min(1).max(40).optional(),
  country: z.enum(Object.keys(COUNTRIES) as [string, ...string[]]).optional(),
  monthlyIncome: money,
  monthlyEssentials: money,
  payday: z.coerce.number().int().min(1).max(31).optional(),
  priorityObligations: money,
  remittances: money,
  sinkingFunds: money,
  debtAttack: money,
  debtAttackSource: z.enum(["derived", "chosen"]).optional(),
  windfallRule: z.string().max(300).optional(),
  reviewCadence: z.enum(["weekly", "payday"]).optional(),
  moneyPurpose: z.string().max(300).optional(),
  goodDecision: z.string().max(300).optional(),
  upbringing: z.string().max(300).optional(),
  strategy: z.enum(["snowball", "avalanche"]).optional(),
});

export async function GET() {
  const caller = await currentCaller();
  return NextResponse.json(await currentUser(caller));
}

export async function PATCH(request: Request) {
  const caller = await currentCaller();
  if (isDemo(caller)) return NextResponse.json({ error: "The demo is read-only. Switch back to your own numbers to make changes." }, { status: 403 });
  const parsed = profileSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile", issues: parsed.error.issues }, { status: 400 });
  }
  return NextResponse.json(await convexClient().mutation(api.sproutjar.updateProfile, { caller, ...parsed.data }));
}
