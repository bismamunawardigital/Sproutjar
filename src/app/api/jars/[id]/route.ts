import { NextResponse } from "next/server";
import { currentCaller, isDemo } from "@/lib/caller";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { convexClient } from "@/lib/convex";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const caller = await currentCaller();
  if (isDemo(caller)) return NextResponse.json({ error: "The demo is read-only. Switch back to your own numbers to make changes." }, { status: 403 });
  const { id } = await params;
  const removed = await convexClient().mutation(api.sproutjar.removeJar, {
    caller, id: id as Id<"jars"> });
  if (!removed) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
