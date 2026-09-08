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
  totalInterest: number;
  totalPaid: number;
  monthlyBleed: number;
  order: string[];
  milestones: PayoffMilestone[];
  feasible: boolean;
  /** Set when the surplus cannot even cover the minimums. */
  shortfall: number;
};

const MAX_MONTHS = 600;

export function monthlyBleed(debts: DebtInput[]): number {
  return debts.reduce((sum, d) => sum + d.balance * d.monthlyRate, 0);
}

export function totalBalance(debts: DebtInput[]): number {
  return debts.reduce((sum, d) => sum + d.balance, 0);
}

export function totalMinimums(debts: DebtInput[]): number {
  return debts.reduce((sum, d) => sum + d.minimumPayment, 0);
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
  const d = new Date(from.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
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

  if (monthlyBudget < minimums) {
    return {
      ...empty,
      feasible: false,
      shortfall: minimums - monthlyBudget,
      months: 0,
      debtFreeOn: "",
    };
  }

  const remaining = new Map(ordered.map((d) => [d.id, d.balance]));
  const interestByDebt = new Map(ordered.map((d) => [d.id, 0]));
  const milestones: PayoffMilestone[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;

  while (month < MAX_MONTHS) {
    const live = ordered.filter((d) => (remaining.get(d.id) ?? 0) > 0.005);
    if (live.length === 0) break;
    month += 1;

    for (const debt of live) {
      const balance = remaining.get(debt.id) ?? 0;
      const interest = balance * debt.monthlyRate;
      remaining.set(debt.id, balance + interest);
      interestByDebt.set(debt.id, (interestByDebt.get(debt.id) ?? 0) + interest);
      totalInterest += interest;
    }

    let budget = month === 1 ? Math.max(minimums, firstMonthBudget) : monthlyBudget;

    // Minimums on everything except the focus debt, which absorbs the surplus.
    const focus = live[0];
    for (const debt of live.slice(1)) {
      const balance = remaining.get(debt.id) ?? 0;
      const pay = Math.min(balance, debt.minimumPayment, budget);
      remaining.set(debt.id, balance - pay);
      budget -= pay;
      totalPaid += pay;
    }

    const focusBalance = remaining.get(focus.id) ?? 0;
    const focusPay = Math.min(focusBalance, budget);
    remaining.set(focus.id, focusBalance - focusPay);
    totalPaid += focusPay;

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

  return {
    strategy,
    months: month,
    debtFreeOn: formatMonthYear(addMonths(startDate, month)),
    totalInterest: Math.round(totalInterest),
    totalPaid: Math.round(totalPaid),
    monthlyBleed: Math.round(bleed),
    order: ordered.map((d) => d.name),
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
    interestSavedByAvalanche: snowball.totalInterest - avalanche.totalInterest,
    monthsSavedByAvalanche: snowball.months - avalanche.months,
    firstWinMonthsSoonerWithSnowball: firstAvalanche - firstSnowball,
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
): number {
  const base = buildPayoffPlan(debts, monthlyBudget, strategy);
  const boosted = buildPayoffPlan(debts, monthlyBudget + extraPerMonth, strategy);
  if (!base.feasible || !boosted.feasible) return 0;
  return base.months - boosted.months;
}
