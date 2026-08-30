import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/user";

export const dynamic = "force-dynamic";

const jarSchema = z.object({
  name: z.string().min(1),
  purpose: z.string().default("planned"),
  target: z.coerce.number().positive(),
  saved: z.coerce.number().nonnegative().default(0),
});

export async function GET() {
  const user = await currentUser();
  return NextResponse.json(
    await prisma.jar.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
  );
}

export async function POST(request: Request) {
  const parsed = jarSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid jar", issues: parsed.error.issues }, { status: 400 });
  }
  const user = await currentUser();
  return NextResponse.json(
    await prisma.jar.create({ data: { ...parsed.data, userId: user.id } }),
    { status: 201 },
  );
}
