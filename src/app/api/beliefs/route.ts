import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import { convexClient } from "@/lib/convex";

export const dynamic = "force-dynamic";

const beliefSchema = z.object({ text: z.string().min(1) });

export async function POST(request: Request) {
  const parsed = beliefSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid belief", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const id = await convexClient().mutation(api.sproutjar.nameBelief, parsed.data);
  return NextResponse.json({ id, ...parsed.data }, { status: 201 });
}
