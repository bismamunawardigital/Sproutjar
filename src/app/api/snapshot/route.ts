import { NextResponse } from "next/server";
import { currentCaller } from "@/lib/caller";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

export async function GET() {
  const caller = await currentCaller();
  return NextResponse.json(await buildSnapshot(caller));
}
