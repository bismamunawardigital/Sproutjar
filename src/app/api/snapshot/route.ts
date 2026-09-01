import { NextResponse } from "next/server";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await buildSnapshot());
}
