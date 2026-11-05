import { NextResponse } from "next/server";
import { currentCaller, isDemo } from "@/lib/caller";
import { api } from "../../../../convex/_generated/api";
import { convexClient } from "@/lib/convex";

export const dynamic = "force-dynamic";

/** The person has read what Ren does and does not do. Recorded once. */
export async function POST() {
  const caller = await currentCaller();
  if (isDemo(caller)) return NextResponse.json({ error: "The demo is read-only. Switch back to your own numbers to make changes." }, { status: 403 });
  await convexClient().mutation(api.sproutjar.acceptContract, { caller });
  return NextResponse.json({ contracted: true });
}
