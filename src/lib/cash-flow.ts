/**
 * The monthly amount that goes at the cards, and where it came from. Shared by
 * the Next.js snapshot and the Convex review mutation so the two can never
 * disagree about what the plan is running on.
 */
export type CashFlowProfile = {
  monthlyIncome: number;
  monthlyEssentials: number;
  priorityObligations?: number;
  remittances?: number;
  sinkingFunds?: number;
  debtAttack?: number;
  debtAttackSource?: string;
};

export type DebtAttackSource = "derived" | "chosen";

export type DebtAttack = {
  /** What the plan actually runs on. */
  amount: number;
  source: DebtAttackSource;
  /** income − essentials − obligations − remittances − sinking funds, floored at zero. */
  derived: number;
  /** The figure the person typed, when they chose their own. */
  chosen: number | null;
  lines: { label: string; amount: number }[];
};

export function debtAttackFor(user: CashFlowProfile): DebtAttack {
  const lines = [
    { label: "Take-home salary", amount: user.monthlyIncome },
    { label: "Essentials", amount: -user.monthlyEssentials },
    { label: "Rent, fees, instalments", amount: -(user.priorityObligations ?? 0) },
    { label: "Sent home", amount: -(user.remittances ?? 0) },
    { label: "Set aside for known lumps", amount: -(user.sinkingFunds ?? 0) },
  ];
  const derived = Math.max(
    0,
    Math.round(lines.reduce((sum, line) => sum + line.amount, 0)),
  );
  const chosen =
    user.debtAttackSource === "chosen" && typeof user.debtAttack === "number" && user.debtAttack >= 0
      ? Math.round(user.debtAttack)
      : null;
  return {
    amount: chosen ?? derived,
    source: chosen === null ? "derived" : "chosen",
    derived,
    chosen,
    lines,
  };
}

/** Days until the next payday, 0 on the day itself. */
export function daysUntilPayday(payday: number | undefined, today = new Date()): number | null {
  if (!payday || payday < 1 || payday > 31) return null;
  const year = today.getFullYear();
  const month = today.getMonth();
  const clamp = (y: number, m: number) => Math.min(payday, new Date(y, m + 1, 0).getDate());
  let next = new Date(year, month, clamp(year, month));
  if (next.getDate() < today.getDate()) next = new Date(year, month + 1, clamp(year, month + 1));
  const ms = new Date(next.getFullYear(), next.getMonth(), next.getDate()).getTime() -
    new Date(year, month, today.getDate()).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

/** Payday is a window, not an instant: a couple of days either side counts. */
export function isPaydayWindow(payday: number | undefined, today = new Date()): boolean {
  const until = daysUntilPayday(payday, today);
  if (until === null) return false;
  if (until <= 2) return true;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return daysInMonth - until <= 3;
}
