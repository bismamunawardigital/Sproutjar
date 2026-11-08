import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { currentCaller, isDemo } from "@/lib/caller";
import { convexClient } from "@/lib/convex";

export const dynamic = "force-dynamic";

const recordSchema = z.object({
  sessionId: z.string().min(1),
  conversationId: z.string().trim().min(1).max(200),
});

export async function POST(request: Request) {
  const caller = await currentCaller();
  if (isDemo(caller)) return NextResponse.json({ error: "The demo is read-only." }, { status: 403 });
  const parsed = recordSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid talk", issues: parsed.error.issues }, { status: 400 });
  const id = await convexClient().mutation(api.sproutjar.recordCompletedSession, { caller, ...parsed.data, sessionId: parsed.data.sessionId as Id<"sessions"> });
  return NextResponse.json({ id }, { status: 201 });
}
