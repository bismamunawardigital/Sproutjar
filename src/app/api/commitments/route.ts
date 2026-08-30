import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/user";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  wish: z.string().min(1),
  outcome: z.string().default(""),
  obstacle: z.string().default(""),
  ifThenPlan: z.string().default(""),
  days: z.coerce.number().int().min(1).max(365).default(30),
});

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["open", "kept", "missed"]),
});

export async function GET() {
  const user = await currentUser();
  return NextResponse.json(
    await prisma.commitment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  );
}

export async function POST(request: Request) {
  const parsed = createSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid commitment", issues: parsed.error.issues }, { status: 400 });
  }
  const user = await currentUser();
  const { days, ...rest } = parsed.data;
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + days);
  return NextResponse.json(
    await prisma.commitment.create({ data: { ...rest, dueAt, userId: user.id } }),
    { status: 201 },
  );
}

export async function PATCH(request: Request) {
  const parsed = updateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update", issues: parsed.error.issues }, { status: 400 });
  }
  const user = await currentUser();
  const commitment = await prisma.commitment.findFirst({
    where: { id: parsed.data.id, userId: user.id },
  });
  if (!commitment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(
    await prisma.commitment.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status } }),
  );
}
