import { formatMoney, formatMoneyShort } from "./money";
import type { Strategy } from "./debt-engine";

export function planMoney(amount: number, currency: string) {
  return Math.abs(amount) > 0 && Math.abs(amount) < 1 ? formatMoney(amount, currency) : formatMoneyShort(amount, currency);
}

export function planStrategy(value: string | undefined): Strategy {
  return value === "snowball" ? "snowball" : "avalanche";
}

export type PlanReviewEntry = { paid: string; newBorrowing: string; balance: string };

export function planReviewEntry(card: { id: string; balance: number }, drafts: Record<string, PlanReviewEntry>) {
  return drafts[card.id] ?? { paid: "", newBorrowing: "", balance: String(card.balance) };
}

export function planReviewDays(debtId: string, createdAt: number | undefined, readings: { debtId: string; source: string; loggedAt: number; amountPaid: number; balance: number }[], now: number) {
  const last = readings.filter((entry) => entry.debtId === debtId && (entry.source === "review" || (entry.source === "self_report" && !(entry.balance === 0 && entry.amountPaid > 0)))).reduce<number | undefined>((latest, entry) => latest === undefined ? entry.loggedAt : Math.max(latest, entry.loggedAt), undefined);
  return Math.max(0, (now - (last ?? createdAt ?? now)) / 86_400_000);
}

export function planReviewSplit(opening: number, paid: number, balance: number, monthlyRate: number, elapsedDays: number, spending?: number) {
  const unexplained = Math.max(0, balance - Math.max(0, opening - paid));
  if (spending !== undefined) {
    const newBorrowing = Math.max(0, spending);
    return { interestCharged: Math.max(0, balance - Math.max(0, opening - paid + newBorrowing)), newBorrowing, estimatedSplit: false };
  }
  const interestCharged = Math.min(unexplained, Math.max(0, opening * monthlyRate * (Math.max(0, elapsedDays) * 12 / 365)));
  return { interestCharged, newBorrowing: unexplained - interestCharged, estimatedSplit: unexplained > 0 };
}

export async function savePlanChange<T = unknown>(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown, request: typeof fetch = fetch): Promise<T> {
  const response = await request(url, { method, ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof result?.error === "string" ? result.error : "That didn't save. Your figures are still here. Try again.");
  return result as T;
}
