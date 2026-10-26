import { NextResponse } from "next/server";
import { currentCaller, deleteClerkUser, isDemo } from "@/lib/caller";
import { api } from "../../../../convex/_generated/api";
import { convexClient } from "@/lib/convex";

export const dynamic = "force-dynamic";

/** Deletes the person's numbers, sessions and sign-in. There is no undo. */
export async function DELETE() {
  const caller = await currentCaller();
  if (isDemo(caller)) return NextResponse.json({ error: "Switch back to your own account first." }, { status: 403 });
  await convexClient().mutation(api.sproutjar.deleteAccount, { caller });
  await deleteClerkUser(caller.userKey);
  return NextResponse.json({ deleted: true });
}
