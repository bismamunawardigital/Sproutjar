export type DebtInput = {
  id: string;
  name: string;
  issuer: string;
  balance: number;
  /** Monthly rate as a decimal, e.g. 0.0299 for 2.99% per month. */
  monthlyRate: number;
  minimumPayment: number;
};

export type Strategy = "snowball" | "avalanche";

export type PayoffMilestone = {
  debtId: string;
  name: string;
  monthCleared: number;
  clearedOn: string;
  interestPaid: number;
};

export type PayoffPlan = {
  strategy: Strategy;
  months: number;
  debtFreeOn: string;
  monthlyBleed: number;
  order: string[];
  milestones: PayoffMilestone[];
  /** Set when the surplus cannot even cover the minimums. */
  shortfall: number;
} & (
  | { feasible: true; totalInterest: number; totalPaid: number }
  | { feasible: false; totalInterest: null; totalPaid: null }
);

const MAX_MONTHS = 600;

export function monthlyBleed(debts: DebtInput[]): number {
  return debts.reduce((sum, d) => sum + d.balance * d.monthlyRate, 0);
}

export function totalBalance(debts: DebtInput[]): number {
  return debts.reduce((sum, d) => sum + d.balance, 0);
}

export function totalMinimums(debts: DebtInput[]): number {
  // A card at zero has no minimum, however the bank still lists one.
  return debts.filter((d) => d.balance > 0.005).reduce((sum, d) => sum + d.minimumPayment, 0);
}

function orderDebts(debts: DebtInput[], strategy: Strategy): DebtInput[] {
  // A card at zero is finished, whether it was paid off or moved elsewhere. It
  // must never be what the plan tells someone to start on.
  const copy = debts.filter((d) => d.balance > 0.005);
  copy.sort((a, b) =>
    strategy === "snowball"
      ? a.balance - b.balance
      : b.monthlyRate - a.monthlyRate || a.balance - b.balance,
  );
  return copy;
}

function addMonths(from: Date, months: number): Date {
  return new Date(from.getFullYear(), from.getMonth() + months, 1);
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/**
 * Simulates month-by-month repayment: interest accrues on the remaining balance,
 * every debt receives its minimum, and the whole surplus is thrown at the focus debt.
 */
export function buildPayoffPlan(
  debts: DebtInput[],
  monthlyBudget: number,
  strategy: Strategy,
  startDate = new Date(),
  /** What actually reaches the cards in month one, when part of the amount tops up the reserve. */
  firstMonthBudget = monthlyBudget,
): PayoffPlan {
  const ordered = orderDebts(debts, strategy);
  const minimums = totalMinimums(debts);
  const bleed = monthlyBleed(debts);

  const empty: PayoffPlan = {
    strategy,
    months: 0,
    debtFreeOn: formatMonthYear(startDate),
    totalInterest: 0,
    totalPaid: 0,
    monthlyBleed: bleed,
    order: ordered.map((d) => d.name),
    milestones: [],
    feasible: true,
    shortfall: 0,
  };

  if (ordered.length === 0) return empty;

  const never = (shortfall = 0): PayoffPlan => ({
    ...empty,
    feasible: false,
    shortfall,
    debtFreeOn: "",
    totalInterest: null,
    totalPaid: null,
  });

  if (!Number.isFinite(monthlyBudget) || !Number.isFinite(firstMonthBudget)) return never();
  if (monthlyBudget < minimums || monthlyBudget <= bleed) {
    return never(Math.max(0, minimums - monthlyBudget));
  }

  const remaining = new Map(ordered.map((d) => [d.id, d.balance]));
  const interestByDebt = new Map(ordered.map((d) => [d.id, 0]));
  const milestones: PayoffMilestone[] = [];
  const attacked: DebtInput[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;

  while (month < MAX_MONTHS) {
    const live = debts.filter((d) => (remaining.get(d.id) ?? 0) > 0.005);
    if (live.length === 0) break;
    month += 1;

    for (const debt of live) {
      const balance = remaining.get(debt.id) ?? 0;
      const interest = balance * debt.monthlyRate;
      remaining.set(debt.id, balance + interest);
      interestByDebt.set(debt.id, (interestByDebt.get(debt.id) ?? 0) + interest);
      totalInterest += interest;
    }

    let budget = Math.max(0, month === 1 ? firstMonthBudget : monthlyBudget);

    for (const debt of live) {
      const balance = remaining.get(debt.id) ?? 0;
      const pay = Math.min(balance, debt.minimumPayment, budget);
      remaining.set(debt.id, balance - pay);
      budget -= pay;
      totalPaid += pay;
    }

    const focusOrder = orderDebts(
      live.map((debt) => ({ ...debt, balance: remaining.get(debt.id) ?? 0 })),
      strategy,
    );
    for (const debt of focusOrder) {
      const balance = remaining.get(debt.id) ?? 0;
      const pay = Math.min(balance, budget);
      if (pay > 0 && !attacked.some((card) => card.id === debt.id)) attacked.push(debt);
      remaining.set(debt.id, balance - pay);
      totalPaid += pay;
      budget -= pay;
    }

    for (const debt of live) {
      if ((remaining.get(debt.id) ?? 0) <= 0.005 && !milestones.some((m) => m.debtId === debt.id)) {
        remaining.set(debt.id, 0);
        milestones.push({
          debtId: debt.id,
          name: debt.name,
          monthCleared: month,
          clearedOn: formatMonthYear(addMonths(startDate, month)),
          interestPaid: Math.round(interestByDebt.get(debt.id) ?? 0),
        });
      }
    }
  }

  if ([...remaining.values()].some((balance) => balance > 0.005)) return never();

  return {
    strategy,
    months: month,
    debtFreeOn: formatMonthYear(addMonths(startDate, month)),
    totalInterest: Math.round(totalInterest),
    totalPaid: Math.round(totalPaid),
    monthlyBleed: Math.round(bleed),
    order: [...attacked, ...ordered.filter((debt) => !attacked.some((card) => card.id === debt.id))]
      .map((debt) => debt.name),
    milestones,
    feasible: true,
    shortfall: 0,
  };
}

export type StrategyComparison = {
  snowball: PayoffPlan;
  avalanche: PayoffPlan;
  interestSavedByAvalanche: number;
  monthsSavedByAvalanche: number;
  firstWinMonthsSoonerWithSnowball: number;
};

export function compareStrategies(
  debts: DebtInput[],
  monthlyBudget: number,
  startDate = new Date(),
  firstMonthBudget = monthlyBudget,
): StrategyComparison {
  const snowball = buildPayoffPlan(debts, monthlyBudget, "snowball", startDate, firstMonthBudget);
  const avalanche = buildPayoffPlan(debts, monthlyBudget, "avalanche", startDate, firstMonthBudget);
  const firstSnowball = snowball.milestones[0]?.monthCleared ?? 0;
  const firstAvalanche = avalanche.milestones[0]?.monthCleared ?? 0;
  return {
    snowball,
    avalanche,
    interestSavedByAvalanche: snowball.totalInterest !== null && avalanche.totalInterest !== null
      ? snowball.totalInterest - avalanche.totalInterest : 0,
    monthsSavedByAvalanche: snowball.feasible && avalanche.feasible ? snowball.months - avalanche.months : 0,
    firstWinMonthsSoonerWithSnowball: snowball.feasible && avalanche.feasible ? firstAvalanche - firstSnowball : 0,
  };
}

/**
 * What happens if only minimums are ever paid. Used to show the cost of standing still.
 */
export function minimumsOnlyOutlook(debts: DebtInput[], startDate = new Date()): PayoffPlan {
  return buildPayoffPlan(debts, totalMinimums(debts), "avalanche", startDate);
}

/** Converts extra monthly money into the language Ren uses: months of your life back. */
export function monthsOfLifeBack(
  debts: DebtInput[],
  monthlyBudget: number,
  extraPerMonth: number,
  strategy: Strategy,
  firstMonthBudget = monthlyBudget,
  boostedFirstMonthBudget = firstMonthBudget + extraPerMonth,
  start = new Date(),
): number {
  const base = buildPayoffPlan(debts, monthlyBudget, strategy, start, firstMonthBudget);
  const boosted = buildPayoffPlan(debts, monthlyBudget + extraPerMonth, strategy, start, boostedFirstMonthBudget);
  if (!base.feasible || !boosted.feasible) return 0;
  return base.months - boosted.months;
}

/** Money actually handed over, as opposed to a balance correction or a review. */
export function isPaymentSource(source: string): boolean {
  return source === "payment" || source === "ren";
}

/**
 * Whether a balance entry is money paid. Before corrections and payments were
 * separated, "Settled" wrote a `self_report` row that took the card to zero
 * and carried the cleared amount; those rows still count. A hand edit to any
 * other figure, then or since, is a correction and does not.
 */
export function isPaymentEntry(entry: { source: string; amountPaid: number; balance: number }): boolean {
  return (
    isPaymentSource(entry.source) ||
    (entry.source === "self_report" && entry.balance === 0 && entry.amountPaid > 0)
  );
}
