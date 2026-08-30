import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { assertToolKey } from "@/lib/tool-auth";
import { currentUser } from "@/lib/user";
import { jarProgress } from "@/lib/jars";
import { formatMoney } from "@/lib/money";
import { countryProfile } from "@/lib/money";

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

  const user = await currentUser();
  const jars = await prisma.jar.findMany({ where: { userId: user.id } });
  if (jars.length === 0) {
    return NextResponse.json({ error: "No jars exist yet." }, { status: 404 });
  }

  const needle = parsed.data.jar_name?.toLowerCase();
  const jar =
    (needle ? jars.find((j) => j.name.toLowerCase().includes(needle)) : undefined) ??
    jars.find((j) => j.purpose === "emergency") ??
    jars[0];

  const updated = await prisma.jar.update({
    where: { id: jar.id },
    data: {
      saved: jar.saved + parsed.data.amount,
      deposits: { create: { amount: parsed.data.amount, note: parsed.data.note } },
    },
  });

  const currency = countryProfile(user.country).currency;
  const progress = jarProgress({
    id: updated.id,
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
