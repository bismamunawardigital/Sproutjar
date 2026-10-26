import { NextResponse } from "next/server";
import { z } from "zod";
import { currentCaller, isDemo } from "@/lib/caller";
import { api } from "../../../../convex/_generated/api";
import { convexClient } from "@/lib/convex";
import { COUNTRIES } from "@/lib/money";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(1).max(40).optional(),
  country: z.enum(Object.keys(COUNTRIES) as [string, ...string[]]).optional(),
  answers: z.object({
    why: z.string().max(40).optional(),
    pattern: z.string().max(40).optional(),
    carrying: z.string().max(40).optional(),
    help: z.string().max(40).optional(),
  }),
});

export async function POST(request: Request) {
  const caller = await currentCaller();
  if (isDemo(caller)) return NextResponse.json({ error: "The demo is already set up." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] ?? "");
    const error =
      field === "name"
        ? "That name is a bit long. Keep it under 40 characters."
        : "Something did not save. Go back a step and try again.";
    return NextResponse.json({ error, issues: parsed.error.issues }, { status: 400 });
  }
  const user = await convexClient().mutation(api.sproutjar.completeOnboarding, { caller, ...parsed.data });
  return NextResponse.json({ user });
}
