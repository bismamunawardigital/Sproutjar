import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import { convex } from "@/lib/convex";
import { currentUser } from "@/lib/user";
import { COUNTRIES } from "@/lib/money";

export const dynamic = "force-dynamic";

const profileSchema = z.object({
  name: z.string().min(1).optional(),
  country: z.enum(Object.keys(COUNTRIES) as [string, ...string[]]).optional(),
  monthlyIncome: z.coerce.number().nonnegative().optional(),
  monthlyEssentials: z.coerce.number().nonnegative().optional(),
  strategy: z.enum(["snowball", "avalanche"]).optional(),
});

export async function GET() {
  return NextResponse.json(await currentUser());
}

export async function PATCH(request: Request) {
  const parsed = profileSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile", issues: parsed.error.issues }, { status: 400 });
  }
  return NextResponse.json(await convex.mutation(api.sproutjar.updateProfile, parsed.data));
}
