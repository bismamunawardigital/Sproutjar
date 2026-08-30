import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { convex } from "@/lib/convex";
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
  const snap = await buildSnapshot();
  return NextResponse.json(snap.recentCommitments);
}

export async function POST(request: Request) {
  const parsed = createSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid commitment", issues: parsed.error.issues }, { status: 400 });
  }
  const id = await convex.mutation(api.sproutjar.addCommitment, parsed.data);
  return NextResponse.json({ id, ...parsed.data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const parsed = updateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update", issues: parsed.error.issues }, { status: 400 });
  }
  const id = await convex.mutation(api.sproutjar.setCommitmentStatus, {
    id: parsed.data.id as Id<"commitments">,
    status: parsed.data.status,
    reflection: parsed.data.reflection,
  });
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ id, status: parsed.data.status });
}
