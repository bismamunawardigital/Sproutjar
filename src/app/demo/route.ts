import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { DEMO_COOKIE } from "@/lib/caller";

export const dynamic = "force-dynamic";

/** Switches a signed-in person over to Layla's demo until they switch back. */
export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL("/sign-in", request.url));
  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(DEMO_COOKIE, userId, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  return response;
}
