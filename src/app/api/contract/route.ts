import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";
import { convexClient } from "@/lib/convex";

export const dynamic = "force-dynamic";

/** The person has read what Ren does and does not do. Recorded once. */
export async function POST() {
  await convexClient().mutation(api.sproutjar.acceptContract, {});
  return NextResponse.json({ contracted: true });
}
