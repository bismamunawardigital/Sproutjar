import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { DEMO_COOKIE, GUEST_VIEW } from "@/lib/demo-cookie";

export const dynamic = "force-dynamic";

/** Opens Layla's demo for guests and signed-in people. */
export async function GET(request: Request) {
  const { userId } = await auth();
  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(DEMO_COOKIE, userId ?? GUEST_VIEW, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  return response;
}
