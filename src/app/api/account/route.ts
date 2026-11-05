import { NextResponse } from "next/server";
import { currentCaller, deleteClerkUser, isDemo } from "@/lib/caller";
import { api } from "../../../../convex/_generated/api";
import { convexClient } from "@/lib/convex";

export const dynamic = "force-dynamic";

/**
 * Deletes the person's numbers, sessions and sign-in. There is no undo.
 * Data goes first: if the sign-in delete then fails they are still signed in
 * and can press Delete again, whereas the other way round would leave their
 * numbers behind with nobody able to reach them.
 */
export async function DELETE() {
  const caller = await currentCaller();
  if (isDemo(caller)) return NextResponse.json({ error: "Switch back to your own account first." }, { status: 403 });
  await convexClient().mutation(api.sproutjar.deleteAccount, { caller });
  try {
    await deleteClerkUser(caller.userKey);
  } catch (error) {
    console.error("Clerk delete failed after Convex delete", error);
    return NextResponse.json(
      { error: "Your numbers are gone, but the sign-in did not close. Press Delete once more." },
      { status: 500 },
    );
  }
  return NextResponse.json({ deleted: true });
}
