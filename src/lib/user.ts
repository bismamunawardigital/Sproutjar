import { prisma } from "@/lib/db";
import { buildPayoffPlan, compareStrategies, minimumsOnlyOutlook, type DebtInput, type Strategy } from "@/lib/debt-engine";
import { allocateSurplus, jarProgress, recommendedStarterJar } from "@/lib/jars";
import { countryProfile } from "@/lib/money";
import { plantState, principalCleared } from "@/lib/plant";

export const DEMO_EMAIL = "demo@sproutjar.app";

/**
 * The hackathon build runs single-tenant: every request resolves to the demo profile.
 * Swapping this for a session lookup is the only change auth requires.
 */
export async function currentUser() {
  const user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (user) return user;
  return prisma.user.create({
    data: { name: "Friend", email: DEMO_EMAIL, country: "AE" },
  });
}

export type Snapshot = Awaited<ReturnType<typeof buildSnapshot>>;

export async function buildSnapshot() {
  const user = await currentUser();
  const [debtRows, jarRows, commitments, recentCommitments, beliefs, sessions] = await Promise.all([
    prisma.debt.findMany({ where: { userId: user.id }, orderBy: { balance: "asc" } }),
    prisma.jar.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.commitment.findMany({
      where: { userId: user.id, status: "open" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.commitment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.belief.findMany({
      where: { userId: user.id, status: "active" },
      orderBy: { namedOn: "desc" },
    }),
    prisma.coachSession.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      take: 8,
      include: { commitments: true },
    }),
  ]);

  const debts: DebtInput[] = debtRows.map((d) => ({
    id: d.id,
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
  const currentPrincipal = debtRows.reduce((s, d) => s + d.balance, 0);
  const commitmentsKept = recentCommitments.filter((c) => c.status === "kept").length;
  const growth = plantState({
    openingPrincipal,
    currentPrincipal,
    sessionsHeld: sessions.length,
    commitmentsKept,
    weeksActive: user.weeksActive,
  });

  return {
    user,
    country,
    debts: debtRows,
    beliefs,
    sessions,
    recentCommitments,
    growth,
    openingPrincipal,
    cleared: principalCleared(openingPrincipal, currentPrincipal),
    jars: jarRows.map((j) =>
      jarProgress(
        { id: j.id, name: j.name, purpose: j.purpose, target: j.target, saved: j.saved },
        j.purpose === "emergency" ? split.toJar : 0,
      ),
    ),
    commitments,
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
