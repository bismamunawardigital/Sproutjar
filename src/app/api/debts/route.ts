import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/user";

export const dynamic = "force-dynamic";

const debtSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  kind: z.string().default("credit_card"),
  balance: z.coerce.number().nonnegative(),
  monthlyRate: z.coerce.number().min(0).max(1),
  minimumPayment: z.coerce.number().nonnegative(),
  isIslamic: z.boolean().default(false),
});

export async function GET() {
  const user = await currentUser();
  return NextResponse.json(
    await prisma.debt.findMany({ where: { userId: user.id }, orderBy: { balance: "asc" } }),
  );
}

export async function POST(request: Request) {
  const parsed = debtSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid debt", issues: parsed.error.issues }, { status: 400 });
  }
  const user = await currentUser();
  return NextResponse.json(
    await prisma.debt.create({
      // What it stands at today is also what the plant starts growing against.
      data: { ...parsed.data, openingBalance: parsed.data.balance, userId: user.id },
    }),
    { status: 201 },
  );
}
