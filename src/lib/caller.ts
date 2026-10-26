import { auth, clerkClient, currentUser as clerkUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { api } from "../../convex/_generated/api";
import { convexClient } from "@/lib/convex";
import { readRenUserToken } from "@/lib/ren-token";

export type Caller = { serverKey: string; userKey: string };

export const DEMO_COOKIE = "sproutjar_view";

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
 * numbers; with the demo cookie set they are looking at Layla's instead.
 * Throws when nobody is signed in: the proxy redirects those before they land here.
 */
export async function currentCaller(): Promise<Caller> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in.");
  const jar = await cookies();
  if (jar.get(DEMO_COOKIE)?.value === "demo") return demoCaller();
  return { serverKey: serverKey(), userKey: userId };
}

/**
 * First visit after sign-in: make sure a Sproutjar row exists for this person,
 * named from whatever the identity provider knew.
 */
export async function ensureCallerUser(caller: Caller) {
  if (isDemo(caller)) return convexClient().mutation(api.sproutjar.ensureUser, { caller, name: "", email: "" });
  const person = await clerkUser();
  const name = person?.firstName ?? person?.username ?? "";
  const email = person?.primaryEmailAddress?.emailAddress ?? "";
  return convexClient().mutation(api.sproutjar.ensureUser, { caller, name, email });
}

/** The person behind one of Ren's tool calls: the signed token, or the demo when none was sent. */
export function callerFromRenToken(token: string | null | undefined): Caller {
  const userKey = readRenUserToken(token);
  return { serverKey: serverKey(), userKey: userKey ?? "demo" };
}

/** Removes the Clerk account after Convex has forgotten the person. */
export async function deleteClerkUser(userId: string) {
  const client = await clerkClient();
  await client.users.deleteUser(userId);
}
