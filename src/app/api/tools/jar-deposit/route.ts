import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "../../../../../convex/_generated/api";
import { convex } from "@/lib/convex";
import { assertToolKey } from "@/lib/tool-auth";
import { currentUser } from "@/lib/user";
import { jarProgress } from "@/lib/jars";
import { countryProfile, formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  amount: z.coerce.number().positive(),
  jar_name: z.string().optional(),
  note: z.string().default(""),
});

export async function POST(request: Request) {
  const denied = assertToolKey(request);
  if (denied) return denied;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.issues }, { status: 400 });
  }

  const target = await convex.query(api.sproutjar.jarByName, { needle: parsed.data.jar_name });
  if (!target) {
    return NextResponse.json({ error: "No jars exist yet." }, { status: 404 });
  }

  const updated = await convex.mutation(api.sproutjar.depositToJar, {
    jarId: target._id,
    amount: parsed.data.amount,
    note: parsed.data.note,
  });
  if (!updated) return NextResponse.json({ error: "No jars exist yet." }, { status: 404 });

  const user = await currentUser();
  const currency = countryProfile(user.country).currency;
  const progress = jarProgress({
    id: updated._id,
    name: updated.name,
    purpose: updated.purpose,
    target: updated.target,
    saved: updated.saved,
  });

  return NextResponse.json({
    saved: true,
    jar: updated.name,
    new_total: formatMoney(updated.saved, currency),
    target: formatMoney(updated.target, currency),
    percent_full: progress.pct,
    stage: progress.stage,
    remaining: formatMoney(progress.remaining, currency),
  });
}
