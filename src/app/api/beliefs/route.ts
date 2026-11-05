import { NextResponse } from "next/server";
import { currentCaller, isDemo } from "@/lib/caller";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { convexClient } from "@/lib/convex";

export const dynamic = "force-dynamic";

const beliefSchema = z.object({ text: z.string().min(1), replaces: z.string().optional() });

export async function POST(request: Request) {
  const caller = await currentCaller();
  if (isDemo(caller)) return NextResponse.json({ error: "The demo is read-only. Switch back to your own numbers to make changes." }, { status: 403 });
  const parsed = beliefSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid belief", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { text, replaces } = parsed.data;
  const id = await convexClient().mutation(api.sproutjar.nameBelief, {
    caller,
    text,
    replaces: replaces ? (replaces as Id<"beliefs">) : undefined,
  });
  return NextResponse.json({ id, text }, { status: 201 });
}
