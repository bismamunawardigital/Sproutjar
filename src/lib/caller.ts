import { auth, clerkClient, currentUser as clerkUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { convexClient } from "@/lib/convex";
import { readRenUserToken } from "@/lib/ren-token";
import { DEMO_COOKIE, GUEST_VIEW } from "@/lib/demo-cookie";

export type Caller = { serverKey: string; userKey: string };

export { DEMO_COOKIE, GUEST_VIEW } from "@/lib/demo-cookie";

function serverKey(): string {
  return process.env.SPROUTJAR_SERVER_KEY ?? "";
}

/** The shared Layla profile: readable by anyone signed in, writable by no one. */
export function demoCaller(): Caller {
  return { serverKey: serverKey(), userKey: "demo" };
}

export function isDemo(caller: Caller): boolean {
  return caller.userKey === "demo";
}

/**
 * Who this request is about. A signed-in person normally sees their own
 * numbers; the demo cookie switches them to Layla's, or lets a signed-out guest
 * view the demo. Throws when there is neither a signed-in user nor a guest demo.
 */
export async function currentCaller(): Promise<Caller> {
  const { userId } = await auth();
  const jar = await cookies();
  const demoView = jar.get(DEMO_COOKIE)?.value;
  if (!userId) {
    if (demoView === GUEST_VIEW) return demoCaller();
    throw new Error("Not signed in.");
  }
  if (demoView === userId) return demoCaller();
  return { serverKey: serverKey(), userKey: userId };
}

export async function isGuestDemo(): Promise<boolean> {
  const { userId } = await auth();
  if (userId) return false;
  const jar = await cookies();
  return jar.get(DEMO_COOKIE)?.value === GUEST_VIEW;
}

/**
 * First visit after sign-in: make sure a Sproutjar row exists for this person,
 * named from whatever the identity provider knew.
 */
export async function ensureCallerUser(caller: Caller) {
  if (isDemo(caller)) return convexClient().mutation(api.sproutjar.ensureUser, { caller, name: "", email: "" });
  const person = await clerkUser().catch(() => null);
  if (!person) redirect("/");
  const name = person?.firstName ?? person?.username ?? "";
  const email = person?.primaryEmailAddress?.emailAddress ?? "";
  return convexClient().mutation(api.sproutjar.ensureUser, { caller, name, email });
}

/** The person behind one of Ren's tool calls: the signed token, or the demo when none was sent. */
export function callerFromRenToken(token: string | null | undefined): Caller {
  const userKey = readRenUserToken(token);
  return { serverKey: serverKey(), userKey: userKey ?? "demo" };
}

/**
 * Removes the sign-in first, so a failure here leaves the numbers intact and
 * the person still able to retry. A Convex failure afterwards leaves data no
 * identity can reach, which is the safer of the two half-states.
 */
export async function deleteClerkUser(userId: string) {
  const client = await clerkClient();
  await client.users.deleteUser(userId);
}
