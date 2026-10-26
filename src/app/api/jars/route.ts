import { NextResponse } from "next/server";
import { currentCaller, isDemo } from "@/lib/caller";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import { convexClient } from "@/lib/convex";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

const jarSchema = z.object({
  name: z.string().min(1),
  purpose: z.string().default("planned"),
  target: z.coerce.number().positive(),
  saved: z.coerce.number().nonnegative().default(0),
});

export async function GET() {
  const caller = await currentCaller();
  const snap = await buildSnapshot(caller);
  return NextResponse.json(snap.jars);
}

export async function POST(request: Request) {
  const caller = await currentCaller();
  if (isDemo(caller)) return NextResponse.json({ error: "The demo is read-only. Switch back to your own numbers to make changes." }, { status: 403 });
  const parsed = jarSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid jar", issues: parsed.error.issues }, { status: 400 });
  }
  const jar = await convexClient().mutation(api.sproutjar.addJar, { caller, ...parsed.data });
  return NextResponse.json(jar, { status: 201 });
}
