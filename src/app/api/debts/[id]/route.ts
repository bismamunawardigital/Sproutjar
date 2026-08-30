import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/user";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  issuer: z.string().min(1).optional(),
  balance: z.coerce.number().nonnegative().optional(),
  monthlyRate: z.coerce.number().min(0).max(1).optional(),
  minimumPayment: z.coerce.number().nonnegative().optional(),
  isIslamic: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update", issues: parsed.error.issues }, { status: 400 });
  }
  const user = await currentUser();
  const debt = await prisma.debt.findFirst({ where: { id, userId: user.id } });
  if (!debt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(await prisma.debt.update({ where: { id }, data: parsed.data }));
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const user = await currentUser();
  const debt = await prisma.debt.findFirst({ where: { id, userId: user.id } });
  if (!debt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.debt.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
