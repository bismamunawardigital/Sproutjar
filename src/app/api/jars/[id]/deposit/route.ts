import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/user";

export const dynamic = "force-dynamic";

const depositSchema = z.object({
  amount: z.coerce.number(),
  note: z.string().default(""),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const parsed = depositSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid deposit", issues: parsed.error.issues }, { status: 400 });
  }
  const user = await currentUser();
  const jar = await prisma.jar.findFirst({ where: { id, userId: user.id } });
  if (!jar) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.jar.update({
    where: { id },
    data: {
      saved: Math.max(0, jar.saved + parsed.data.amount),
      deposits: { create: { amount: parsed.data.amount, note: parsed.data.note } },
    },
  });
  return NextResponse.json(updated);
}
