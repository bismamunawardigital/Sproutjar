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

export async function savePlanChange<T = unknown>(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown, request: typeof fetch = fetch): Promise<T> {
  const response = await request(url, { method, ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof result?.error === "string" ? result.error : "That didn't save. Your figures are still here. Try again.");
  return result as T;
}
