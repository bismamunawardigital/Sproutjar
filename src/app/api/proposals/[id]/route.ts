import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { convex } from "@/lib/convex";

export const dynamic = "force-dynamic";

const patchSchema = z.object({ action: z.enum(["apply", "discard"]) });

type Params = { params: Promise<{ id: string }> };

/** Applying is the only moment a proposal touches the cards. */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const proposalId = id as Id<"proposals">;
  if (parsed.data.action === "apply") {
    await convex.mutation(api.sproutjar.applyProposal, { id: proposalId });
  } else {
    await convex.mutation(api.sproutjar.discardProposal, { id: proposalId });
  }

  return NextResponse.json({ ok: true });
}
