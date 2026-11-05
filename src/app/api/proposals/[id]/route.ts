import { NextResponse } from "next/server";
import { currentCaller, isDemo } from "@/lib/caller";
import { z } from "zod";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { convexClient } from "@/lib/convex";

export const dynamic = "force-dynamic";

const patchSchema = z.object({ action: z.enum(["apply", "discard"]) });

type Params = { params: Promise<{ id: string }> };

/** Applying is the only moment a proposal touches the cards. */
export async function PATCH(request: Request, { params }: Params) {
  const caller = await currentCaller();
  if (isDemo(caller)) return NextResponse.json({ error: "The demo is read-only. Switch back to your own numbers to make changes." }, { status: 403 });
  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const proposalId = id as Id<"proposals">;
  if (parsed.data.action === "apply") {
    await convexClient().mutation(api.sproutjar.applyProposal, {
    caller, id: proposalId });
  } else {
    await convexClient().mutation(api.sproutjar.discardProposal, {
    caller, id: proposalId });
  }

  return NextResponse.json({ ok: true });
}
