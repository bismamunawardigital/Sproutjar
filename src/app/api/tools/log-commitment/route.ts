import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "../../../../../convex/_generated/api";
import { convex } from "@/lib/convex";
import { assertToolKey } from "@/lib/tool-auth";
import { currentUser } from "@/lib/user";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  wish: z.string().min(1),
  outcome: z.string().default(""),
  obstacle: z.string().default(""),
  if_then_plan: z.string().default(""),
  trigger: z.string().default(""),
  ownership_confirmed: z.boolean().default(false),
  days: z.coerce.number().int().min(1).max(365).default(30),
});

/**
 * Ren's WOOP close: the one commitment the user says out loud lands here so the
 * dashboard and the next session can hold them to it.
 */
export async function POST(request: Request) {
  const denied = assertToolKey(request);
  if (denied) return denied;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.issues }, { status: 400 });
  }

  const user = await currentUser();
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + parsed.data.days);

  const id = await convex.mutation(api.sproutjar.addCommitment, {
    wish: parsed.data.wish,
    outcome: parsed.data.outcome,
    obstacle: parsed.data.obstacle,
    ifThenPlan: parsed.data.if_then_plan,
    trigger: parsed.data.trigger,
    ownershipConfirmed: parsed.data.ownership_confirmed,
    days: parsed.data.days,
  });

  return NextResponse.json({
    saved: true,
    id,
    due: dueAt.toISOString().slice(0, 10),
    confirmation: `Saved. It is on ${user.name}'s dashboard until ${dueAt.toDateString()}.`,
  });
}
