import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { convex } from "@/lib/convex";

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
  const debt = await convex.mutation(api.sproutjar.updateDebt, {
    id: id as Id<"debts">,
    ...parsed.data,
  });
  if (!debt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(debt);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const removed = await convex.mutation(api.sproutjar.removeDebt, { id: id as Id<"debts"> });
  if (!removed) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
