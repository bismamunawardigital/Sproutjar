import { NextResponse } from "next/server";
import { currentCaller, isDemo } from "@/lib/caller";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { convexClient } from "@/lib/convex";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  wish: z.string().min(1),
  outcome: z.string().default(""),
  obstacle: z.string().default(""),
  ifThenPlan: z.string().default(""),
  trigger: z.string().default(""),
  ownershipConfirmed: z.boolean().default(false),
  days: z.coerce.number().int().min(1).max(365).default(30),
});

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["open", "kept", "partial", "missed"]),
  reflection: z.string().default(""),
});

export async function GET() {
  const caller = await currentCaller();
  const snap = await buildSnapshot(caller);
  return NextResponse.json(snap.recentCommitments);
}

export async function POST(request: Request) {
  const caller = await currentCaller();
  if (isDemo(caller)) return NextResponse.json({ error: "The demo is read-only. Switch back to your own numbers to make changes." }, { status: 403 });
  const parsed = createSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid commitment", issues: parsed.error.issues }, { status: 400 });
  }
  const id = await convexClient().mutation(api.sproutjar.addCommitment, { caller, ...parsed.data });
  return NextResponse.json({ id, ...parsed.data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const caller = await currentCaller();
  if (isDemo(caller)) return NextResponse.json({ error: "The demo is read-only. Switch back to your own numbers to make changes." }, { status: 403 });
  const parsed = updateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update", issues: parsed.error.issues }, { status: 400 });
  }
  const id = await convexClient().mutation(api.sproutjar.setCommitmentStatus, {
    caller,
    id: parsed.data.id as Id<"commitments">,
    status: parsed.data.status,
    reflection: parsed.data.reflection,
  });
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ id, status: parsed.data.status });
}
