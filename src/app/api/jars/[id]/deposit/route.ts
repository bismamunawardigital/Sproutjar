import { NextResponse } from "next/server";
import { currentCaller, isDemo } from "@/lib/caller";
import { z } from "zod";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { convexClient } from "@/lib/convex";

export const dynamic = "force-dynamic";

const depositSchema = z.object({
  amount: z.coerce.number(),
  note: z.string().default(""),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const caller = await currentCaller();
  if (isDemo(caller)) return NextResponse.json({ error: "The demo is read-only. Switch back to your own numbers to make changes." }, { status: 403 });
  const { id } = await params;
  const parsed = depositSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid deposit", issues: parsed.error.issues }, { status: 400 });
  }
  const jar = await convexClient().mutation(api.sproutjar.depositToJar, {
    caller,
    jarId: id as Id<"jars">,
    amount: parsed.data.amount,
    note: parsed.data.note,
  });
  if (!jar) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(jar);
}
