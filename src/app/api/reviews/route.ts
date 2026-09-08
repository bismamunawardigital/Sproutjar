import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { convexClient } from "@/lib/convex";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

const reviewSchema = z.object({
  cadence: z.enum(["weekly", "payday"]),
  reflection: z.string().max(600).default(""),
  entries: z
    .array(
      z.object({
        debtId: z.string().min(1),
        paid: z.coerce.number().nonnegative(),
        newBorrowing: z.coerce.number().nonnegative(),
        balance: z.coerce.number().nonnegative(),
      }),
    )
    .min(1),
});

export async function GET() {
  const snap = await buildSnapshot();
  return NextResponse.json({ reviews: snap.reviews, sinceReview: snap.sinceReview });
}

export async function POST(request: Request) {
  const parsed = reviewSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review", issues: parsed.error.issues }, { status: 400 });
  }
  const id = await convexClient().mutation(api.sproutjar.recordReview, {
    cadence: parsed.data.cadence,
    reflection: parsed.data.reflection,
    entries: parsed.data.entries.map((e) => ({ ...e, debtId: e.debtId as Id<"debts"> })),
  });
  const snap = await buildSnapshot();
  const review = snap.reviews.find((r) => r.id === id) ?? null;
  return NextResponse.json({ id, review, debtFreeOn: snap.plan.debtFreeOn }, { status: 201 });
}
