import { totalMinimums, type DebtInput, type Strategy } from "./debt-engine";

export function todayPayments<T extends DebtInput>(cards: T[], budget: number, strategy: Strategy) {
  const ordered = cards.filter((card) => card.balance > 0.005).slice().sort((a, b) =>
    strategy === "snowball" ? a.balance - b.balance : b.monthlyRate - a.monthlyRate || a.balance - b.balance,
  );
  let remaining = Math.max(totalMinimums(cards), budget);
  const amounts = new Map<string, number>();
  for (const card of ordered.slice(1)) {
    const amount = Math.min(card.balance * (1 + card.monthlyRate), card.minimumPayment, remaining);
    amounts.set(card.id, amount);
    remaining -= amount;
  }
  if (ordered[0]) amounts.set(ordered[0].id, Math.min(ordered[0].balance * (1 + ordered[0].monthlyRate), remaining));
  return ordered.map((card, index) => ({ ...card, amount: amounts.get(card.id) ?? 0, focus: index === 0 }));
}

export function todayHasDate(plan: { feasible: boolean; months: number }) {
  return plan.feasible && plan.months > 0 && plan.months < 600;
}

export function paymentPresets(row: { amount: number; balance: number; minimumPayment: number }) {
  return [
    { label: "The plan", amount: row.amount },
    { label: "The minimum", amount: Math.min(row.minimumPayment, row.balance) },
    { label: "All of it", amount: row.balance },
  ].map((preset) => ({ label: preset.label, value: String(Math.round(preset.amount * 100) / 100) }));
}

export const CHECKIN_ANSWERS = {
  kept: { button: "Done", heading: "What made this week work", description: "What made this week work, and what got in the way before.", agenda: "checkin-kept", minutes: 20 },
  partial: { button: "Partly", heading: "Next call, with a smaller step", description: "What the part you did tells you, and how to make next week easier.", agenda: "checkin-partial", minutes: 20 },
  missed: { button: "Not this week", heading: "The week it didn't happen", description: "No score kept. What got in the way? Then the same step again, smaller.", agenda: "checkin-missed", minutes: 10 },
} as const;

export type CheckinAnswer = keyof typeof CHECKIN_ANSWERS;

export function commitmentHeading(status: string) {
  return status === "kept" ? "Done" : status === "partial" ? "Partly done" : "You left this one for another time";
}

export function openCommitmentsByDueDate<T extends { status: string; dueAt?: number | null }>(commitments: T[]) {
  return commitments.filter((commitment) => commitment.status === "open")
    .sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0));
}
