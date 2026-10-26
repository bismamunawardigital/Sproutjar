import { NextResponse } from "next/server";
import { DEMO_COOKIE } from "@/lib/caller";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.delete(DEMO_COOKIE);
  return response;
}
