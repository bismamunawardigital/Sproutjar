import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "../../../../../convex/_generated/api";
import { currentCaller, isDemo } from "@/lib/caller";
import { convexClient } from "@/lib/convex";
import { renUserToken } from "@/lib/ren-token";

export const dynamic = "force-dynamic";

const startSchema = z.object({
  agenda: z.string().min(1).max(200),
  agendaReason: z.string().max(6000),
  technique: z.string().max(200),
  plannedMinutes: z.number().int().min(1).max(240),
  contractChoice: z.string().max(200),
  mode: z.enum(["voice", "text"]),
});

export async function POST(request: Request) {
  const caller = await currentCaller();
  if (isDemo(caller)) return NextResponse.json({ error: "The demo is read-only." }, { status: 403 });
  const parsed = startSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid talk", issues: parsed.error.issues }, { status: 400 });
  const sessionId = await convexClient().mutation(api.sproutjar.startSession, { caller, ...parsed.data });
  return NextResponse.json({ sessionId, userToken: renUserToken(caller.userKey, sessionId) }, { status: 201 });
}
