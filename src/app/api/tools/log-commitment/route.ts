import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { assertToolKey } from "@/lib/tool-auth";
import { currentUser } from "@/lib/user";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  wish: z.string().min(1),
  outcome: z.string().default(""),
  obstacle: z.string().default(""),
  if_then_plan: z.string().default(""),
  days: z.coerce.number().int().min(1).max(365).default(30),
  conversation_id: z.string().optional(),
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

  const session = parsed.data.conversation_id
    ? await prisma.coachSession.findUnique({ where: { conversationId: parsed.data.conversation_id } })
    : null;

  const commitment = await prisma.commitment.create({
    data: {
      userId: user.id,
      sessionId: session?.id ?? null,
      wish: parsed.data.wish,
      outcome: parsed.data.outcome,
      obstacle: parsed.data.obstacle,
      ifThenPlan: parsed.data.if_then_plan,
      dueAt,
    },
  });

  return NextResponse.json({
    saved: true,
    id: commitment.id,
    due: dueAt.toISOString().slice(0, 10),
    confirmation: `Saved. It is on ${user.name}'s dashboard until ${dueAt.toDateString()}.`,
  });
}
