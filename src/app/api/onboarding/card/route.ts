import { NextResponse } from "next/server";
import { z } from "zod";
import { currentCaller, isDemo } from "@/lib/caller";
import { convexClient } from "@/lib/convex";
import { api } from "../../../../../convex/_generated/api";

const schema = z.object({
  slot: z.number().int().min(0).max(49),
  name: z.string().trim().min(1).max(100), issuer: z.string().trim().min(1).max(100),
  balance: z.number().finite().positive(), monthlyRate: z.number().finite().min(0).max(1),
  minimumPayment: z.number().finite().nonnegative(), estimatedFields: z.string().max(40),
  dueDay: z.number().int().min(1).max(31).optional(),
  statementDay: z.number().int().min(1).max(31).optional(),
});

export async function POST(request: Request) {
  const caller = await currentCaller();
  if (isDemo(caller)) return NextResponse.json({ error: "The demo is read-only." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the card figures and try again." }, { status: 400 });
  return NextResponse.json(await convexClient().mutation(api.sproutjar.saveOnboardingCard, { caller, ...parsed.data }));
}
