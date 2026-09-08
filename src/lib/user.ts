import { api } from "../../convex/_generated/api";
import { convexClient } from "@/lib/convex";
import { daysUntilPayday, debtAttackFor, isPaydayWindow } from "@/lib/cash-flow";
import {
  buildPayoffPlan,
  compareStrategies,
  formatMonthYear,
  minimumsOnlyOutlook,
  type DebtInput,
  type Strategy,
} from "@/lib/debt-engine";
import { allocateSurplus, jarProgress, recommendedStarterJar } from "@/lib/jars";
import { countryProfile } from "@/lib/money";
import { plantState, principalCleared } from "@/lib/plant";

export const DEMO_EMAIL = "demo@sproutjar.app";

export type HistoryPoint = { at: Date; total: number };

/**
 * Balance entries land per card, so the total owed on any given day is the sum
 * of the newest reading for every card up to that day, starting from what each
 * one opened at.
 */
function totalOwedOverTime(
  debts: { _id: string; openingBalance: number; balance: number }[],
  entries: { debtId: string; balance: number; loggedAt: number }[],
): HistoryPoint[] {
  const latest = new Map<string, number>(
    debts.map((debt) => [debt._id, debt.openingBalance || debt.balance]),
  );
  const byDay = new Map<string, HistoryPoint>();

  for (const entry of entries) {
    latest.set(entry.debtId, entry.balance);
    const at = new Date(entry.loggedAt);
    const total = [...latest.values()].reduce((sum, balance) => sum + balance, 0);
    byDay.set(at.toISOString().slice(0, 10), { at, total });
  }

  return [...byDay.values()];
}

/**
 * What the monthly amount becomes once the last card is gone: the reserve fills
 * first, then each jar in turn, each with the month it would be full.
 */
function afterDebtHorizon(
  debtFreeOn: Date | null,
  monthly: number,
  jars: { name: string; purpose: string; target: number; saved: number }[],
) {
  if (!debtFreeOn || monthly <= 0) return [];
  const ordered = [...jars].sort((a, b) =>
    a.purpose === b.purpose ? 0 : a.purpose === "emergency" ? -1 : 1,
  );
  let month = 0;
  return ordered.flatMap((jar) => {
    const remaining = Math.max(0, jar.target - jar.saved);
    if (remaining <= 0) return [];
    month += Math.ceil(remaining / monthly);
    const fillsOn = new Date(debtFreeOn.getTime());
    fillsOn.setMonth(fillsOn.getMonth() + month);
    return [{ name: jar.name, remaining, monthsAfter: month, fillsOn: formatMonthYear(fillsOn) }];
  });
}

export type Snapshot = Awaited<ReturnType<typeof buildSnapshot>>;

/**
 * The hackathon build runs single-tenant: every request resolves to the demo
 * profile. Swapping this for a session lookup is the only change auth requires.
 */
export async function currentUser() {
  const live = await convexClient().query(api.sproutjar.snapshot, {});
  return live.user;
}

/**
 * One live Convex read behind the whole product. The dashboard, the API routes
 * and Ren's tools all derive from this, so they can never disagree about what
 * someone owes.
 */
export async function buildSnapshot() {
  const live = await convexClient().query(api.sproutjar.snapshot, {});
  const user = live.user;

  const debtRows = live.debts;
  const jarRows = live.jars;
  const recentCommitments = live.commitments.slice(0, 12);
  const commitments = live.commitments.filter((c) => c.status === "open").slice(0, 5);

  const debts: DebtInput[] = debtRows.map((d) => ({
    id: d._id,
    name: d.name,
    issuer: d.issuer,
    balance: d.balance,
    monthlyRate: d.monthlyRate,
    minimumPayment: d.minimumPayment,
  }));

  const country = countryProfile(user.country);
  const attack = debtAttackFor(user);
  const surplus = attack.amount;
  const strategy = (user.strategy === "avalanche" ? "avalanche" : "snowball") as Strategy;

  const starterJar = jarRows.find((j) => j.purpose === "emergency");
  const starterTarget = recommendedStarterJar(starterJar?.target);
  const split = allocateSurplus(surplus, starterTarget, starterJar?.saved ?? 0);

  // One engine run behind every number on screen: the reserve top-up comes off
  // month one, everything after that is the full amount.
  const plan = buildPayoffPlan(debts, surplus, strategy, new Date(), split.toDebt);
  const comparison = compareStrategies(debts, surplus, new Date(), split.toDebt);
  const minimumsOnly = minimumsOnlyOutlook(debts);

  const reviews = live.reviews.map((r) => ({ ...r, id: r._id, completedAt: new Date(r.completedAt) }));
  const lastReview = reviews[0] ?? null;
  // The four numbers since the last review, from whatever has been logged since.
  const sinceReview = live.balanceEntries
    .filter((e) => e.loggedAt > (lastReview?.completedAt.getTime() ?? 0))
    .reduce(
      (acc, e) => ({
        paid: acc.paid + e.amountPaid,
        principalRepaid: acc.principalRepaid + e.principalCleared,
        interestCharged: acc.interestCharged + e.interestCharged,
        newBorrowing: acc.newBorrowing + (e.newBorrowing ?? 0),
      }),
      { paid: 0, principalRepaid: 0, interestCharged: 0, newBorrowing: 0 },
    );

  const debtFreeDate = (() => {
    if (!plan.feasible || plan.months === 0) return null;
    const d = new Date();
    d.setMonth(d.getMonth() + plan.months);
    return d;
  })();

  const openingPrincipal = debtRows.reduce((s, d) => s + (d.openingBalance || d.balance), 0);
  const history = totalOwedOverTime(debtRows, live.balanceEntries);
  const currentPrincipal = debtRows.reduce((s, d) => s + d.balance, 0);
  const commitmentsKept = recentCommitments.filter((c) => c.status === "kept").length;
  const growth = plantState({
    openingPrincipal,
    currentPrincipal,
    sessionsHeld: live.sessions.length,
    commitmentsKept,
    weeksActive: user.weeksActive,
    stemPeak: user.stemPeak,
  });

  return {
    user: { ...user, id: user._id },
    country,
    debts: debtRows.map((d) => {
      // The last figure the person actually read off a statement, if any.
      const reviewed = [...live.balanceEntries]
        .reverse()
        .find((e) => e.debtId === d._id && e.source === "review");
      return {
        ...d,
        id: d._id,
        lastReviewed: reviewed
          ? {
              at: new Date(reviewed.loggedAt),
              paid: reviewed.amountPaid,
              interestCharged: reviewed.interestCharged,
              newBorrowing: reviewed.newBorrowing ?? 0,
            }
          : null,
      };
    }),
    /** Transfers Ren worked out on a call, waiting on a tap before they count. */
    proposals: live.proposals.map((p) => ({
      ...p,
      id: p._id,
      fromName: debtRows.find((d) => d._id === p.fromDebtId)?.name ?? "a card",
      fromRate: debtRows.find((d) => d._id === p.fromDebtId)?.monthlyRate ?? 0,
      createdAt: new Date(p.createdAt),
    })),
    beliefs: live.beliefs.map((b) => ({ ...b, id: b._id, namedOn: new Date(b.namedOn) })),
    sessions: live.sessions.map((s) => ({
      ...s,
      id: s._id,
      startedAt: new Date(s.startedAt),
      commitments: live.commitments.filter((c) => c.sessionId === s._id),
    })),
    recentCommitments: recentCommitments.map((c) => ({ ...c, id: c._id, createdAt: new Date(c.createdAt) })),
    growth,
    /** Total owed, week by week, for the line on Ren's screen. */
    history,
    /** What the plant is drawn at now, so a mutation can bank it. */
    stemPct: growth.stemPct,
    openingPrincipal,
    cleared: principalCleared(openingPrincipal, currentPrincipal),
    jars: jarRows.map((j) =>
      jarProgress(
        { id: j._id, name: j.name, purpose: j.purpose, target: j.target, saved: j.saved },
        j.purpose === "emergency" ? split.toJar : 0,
      ),
    ),
    commitments: commitments.map((c) => ({
      ...c,
      id: c._id,
      dueAt: c.dueAt === undefined ? null : new Date(c.dueAt),
    })),
    surplus,
    /** The monthly amount for the cards, and the lines it was derived from. */
    attack,
    payday: {
      day: user.payday ?? null,
      daysUntil: daysUntilPayday(user.payday),
      isWindow: isPaydayWindow(user.payday),
    },
    /** Past reviews, newest first, each carrying its four numbers and the date before and after. */
    reviews,
    lastReview,
    sinceReview,
    reviewCadence: (user.reviewCadence === "weekly" ? "weekly" : "payday") as "weekly" | "payday",
    /**
     * The lever most people never pull: when a month's interest outweighs the
     * principal it cleared, the price of the debt is the problem, not the effort.
     */
    interestOutweighsPrincipal:
      lastReview !== null && lastReview.interestCharged > lastReview.principalRepaid,
    afterDebt: afterDebtHorizon(debtFreeDate, surplus, jarRows),
    /**
     * Clearing the cards is the first goal, not the product. Once they are gone
     * the same coaching turns to what the money is now for, and the number that
     * matters becomes months of cover rather than a debt-free date.
     */
    horizon: (debtRows.reduce((s, d) => s + d.balance, 0) > 0 ? "clearing" : "building") as
      | "clearing"
      | "building",
    /** Months of essentials the jars would cover if income stopped. */
    runwayMonths:
      user.monthlyEssentials > 0
        ? jarRows.reduce((s, j) => s + j.saved, 0) / user.monthlyEssentials
        : 0,
    strategy,
    starterTarget,
    split,
    plan,
    comparison,
    minimumsOnly,
    totals: {
      debt: debts.reduce((s, d) => s + d.balance, 0),
      minimums: debts.reduce((s, d) => s + d.minimumPayment, 0),
      saved: jarRows.reduce((s, j) => s + j.saved, 0),
    },
  };
}
