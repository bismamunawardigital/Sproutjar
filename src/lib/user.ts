import { api } from "../../convex/_generated/api";
import { convex } from "@/lib/convex";
import { buildPayoffPlan, compareStrategies, minimumsOnlyOutlook, type DebtInput, type Strategy } from "@/lib/debt-engine";
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

export type Snapshot = Awaited<ReturnType<typeof buildSnapshot>>;

/**
 * The hackathon build runs single-tenant: every request resolves to the demo
 * profile. Swapping this for a session lookup is the only change auth requires.
 */
export async function currentUser() {
  const live = await convex.query(api.sproutjar.snapshot, {});
  return live.user;
}

/**
 * One live Convex read behind the whole product. The dashboard, the API routes
 * and Ren's tools all derive from this, so they can never disagree about what
 * someone owes.
 */
export async function buildSnapshot() {
  const live = await convex.query(api.sproutjar.snapshot, {});
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
  const surplus = Math.max(0, user.monthlyIncome - user.monthlyEssentials);
  const strategy = (user.strategy === "avalanche" ? "avalanche" : "snowball") as Strategy;

  const starterTarget = recommendedStarterJar(user.monthlyEssentials);
  const starterJar = jarRows.find((j) => j.purpose === "emergency");
  const split = allocateSurplus(surplus, starterTarget, starterJar?.saved ?? 0);

  const plan = buildPayoffPlan(debts, surplus, strategy);
  const comparison = compareStrategies(debts, surplus);
  const minimumsOnly = minimumsOnlyOutlook(debts);

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
    debts: debtRows.map((d) => ({ ...d, id: d._id })),
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
