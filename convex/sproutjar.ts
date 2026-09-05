import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { debtAttackFor } from "../src/lib/cash-flow";
import { buildPayoffPlan, type DebtInput } from "../src/lib/debt-engine";

const DEMO_EMAIL = "demo@sproutjar.app";

function engineInput(debt: Doc<"debts">): DebtInput {
  return {
    id: debt._id,
    name: debt.name,
    issuer: debt.issuer,
    balance: debt.balance,
    monthlyRate: debt.monthlyRate,
    minimumPayment: debt.minimumPayment,
  };
}

async function demoUser(ctx: QueryCtx | MutationCtx): Promise<Doc<"users">> {
  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", DEMO_EMAIL))
    .unique();
  if (!user) throw new Error("Sproutjar has no user yet. Run the seed mutation.");
  return user;
}

/**
 * Everything the dashboard and Ren need, in one live read. Subscribing to this
 * is what makes a jar deposit Ren logs mid-call appear on screen without a
 * refresh.
 */
export const snapshot = query({
  args: {},
  handler: async (ctx) => {
    const user = await demoUser(ctx);
    const mine = user._id;

    const [debts, jars, commitments, beliefs, sessions, balanceEntries, proposals, reviews] =
      await Promise.all([
      ctx.db.query("debts").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
      ctx.db.query("jars").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
      ctx.db.query("commitments").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
      ctx.db.query("beliefs").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
      ctx.db.query("sessions").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
      ctx.db.query("balanceEntries").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
      ctx.db.query("proposals").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
      ctx.db.query("reviews").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
    ]);

    return {
      user,
      debts: debts
        .filter((d) => d.status === "active")
        .sort((a, b) => a.balance - b.balance),
      jars,
      commitments: commitments.sort((a, b) => b.createdAt - a.createdAt),
      beliefs: beliefs.filter((b) => b.status === "active"),
      sessions: sessions.sort((a, b) => b.startedAt - a.startedAt).slice(0, 8),
      balanceEntries: balanceEntries.sort((a, b) => a.loggedAt - b.loggedAt),
      proposals: proposals
        .filter((p) => p.status === "pending")
        .sort((a, b) => b.createdAt - a.createdAt),
      reviews: reviews.sort((a, b) => b.completedAt - a.completedAt),
    };
  },
});

/**
 * The plant never wilts. Growth already achieved is banked here, so adding a
 * card someone had been hiding cannot cost them stem they earned.
 */
export const recordStemPeak = mutation({
  args: { stemPct: v.number() },
  handler: async (ctx, { stemPct }) => {
    const user = await demoUser(ctx);
    if (stemPct <= user.stemPeak) return user.stemPeak;
    await ctx.db.patch(user._id, { stemPeak: stemPct });
    return stemPct;
  },
});

const debtDetailArgs = {
  dueDay: v.optional(v.number()),
  statementDay: v.optional(v.number()),
  provider: v.optional(v.string()),
  estimatedFields: v.optional(v.string()),
};

export const addDebt = mutation({
  args: {
    name: v.string(),
    issuer: v.string(),
    kind: v.string(),
    balance: v.number(),
    monthlyRate: v.number(),
    minimumPayment: v.number(),
    isIslamic: v.boolean(),
    ...debtDetailArgs,
  },
  handler: async (ctx, args) => {
    const user = await demoUser(ctx);
    return ctx.db.insert("debts", {
      ...args,
      userId: user._id,
      // Today's balance is what the plant starts growing against.
      openingBalance: args.balance,
      isEstimated: Boolean(args.estimatedFields),
      carryingBalance: true,
      status: "active",
    });
  },
});

export const updateDebt = mutation({
  args: {
    id: v.id("debts"),
    name: v.optional(v.string()),
    issuer: v.optional(v.string()),
    kind: v.optional(v.string()),
    balance: v.optional(v.number()),
    monthlyRate: v.optional(v.number()),
    minimumPayment: v.optional(v.number()),
    isIslamic: v.optional(v.boolean()),
    ...debtDetailArgs,
  },
  handler: async (ctx, { id, ...fields }) => {
    const user = await demoUser(ctx);
    const debt = await ctx.db.get(id);
    if (!debt || debt.userId !== user._id) return null;
    const patch = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
    if (fields.estimatedFields !== undefined) patch.isEstimated = fields.estimatedFields !== "";
    await ctx.db.patch(id, patch);
    if (fields.balance !== undefined && fields.balance !== debt.balance) {
      await ctx.db.insert("balanceEntries", {
        userId: user._id,
        debtId: id,
        balance: fields.balance,
        amountPaid: Math.max(0, debt.balance - fields.balance),
        principalCleared: Math.max(0, debt.balance - fields.balance),
        interestCharged: 0,
        source: "self_report",
        loggedAt: Date.now(),
      });
    }
    return ctx.db.get(id);
  },
});

export const removeDebt = mutation({
  args: { id: v.id("debts") },
  handler: async (ctx, { id }) => {
    const user = await demoUser(ctx);
    const debt = await ctx.db.get(id);
    if (!debt || debt.userId !== user._id) return null;
    const entries = await ctx.db
      .query("balanceEntries")
      .withIndex("by_debt", (q) => q.eq("debtId", id))
      .collect();
    await Promise.all(entries.map((entry) => ctx.db.delete(entry._id)));
    await ctx.db.delete(id);
    return id;
  },
});

export const logBalance = mutation({
  args: {
    debtId: v.id("debts"),
    balance: v.number(),
    amountPaid: v.number(),
    interestCharged: v.number(),
    newBorrowing: v.optional(v.number()),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await demoUser(ctx);
    const debt = await ctx.db.get(args.debtId);
    if (!debt || debt.userId !== user._id) throw new Error("No such debt.");
    await ctx.db.patch(args.debtId, { balance: args.balance });
    return ctx.db.insert("balanceEntries", {
      userId: user._id,
      debtId: args.debtId,
      balance: args.balance,
      amountPaid: args.amountPaid,
      principalCleared: Math.max(0, debt.balance - args.balance),
      interestCharged: args.interestCharged,
      newBorrowing: args.newBorrowing ?? 0,
      source: args.source,
      loggedAt: Date.now(),
    });
  },
});

/**
 * The review ritual. One reading per card: what was paid, what new went on it,
 * and what it now stands at. Interest is whatever the balance moved that the
 * payment and the new borrowing do not explain, so the four numbers reconcile
 * by construction rather than by trust.
 */
export const recordReview = mutation({
  args: {
    cadence: v.string(),
    reflection: v.string(),
    entries: v.array(
      v.object({
        debtId: v.id("debts"),
        paid: v.number(),
        newBorrowing: v.number(),
        balance: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const user = await demoUser(ctx);
    const now = Date.now();
    const debts = await ctx.db
      .query("debts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const active = debts.filter((d) => d.status === "active");
    const attack = debtAttackFor(user).amount;
    const strategy = user.strategy === "avalanche" ? "avalanche" : "snowball";
    const debtFreeBefore = buildPayoffPlan(active.map(engineInput), attack, strategy).debtFreeOn;

    const reviewId = await ctx.db.insert("reviews", {
      userId: user._id,
      cadence: args.cadence,
      openingDebt: 0,
      closingDebt: 0,
      paid: 0,
      principalRepaid: 0,
      interestCharged: 0,
      newBorrowing: 0,
      debtFreeBefore,
      debtFreeAfter: debtFreeBefore,
      reflection: args.reflection,
      completedAt: now,
    });

    const totals = { openingDebt: 0, closingDebt: 0, paid: 0, principalRepaid: 0, interestCharged: 0, newBorrowing: 0 };
    for (const entry of args.entries) {
      const debt = active.find((d) => d._id === entry.debtId);
      if (!debt) continue;
      const paid = Math.max(0, entry.paid);
      const newBorrowing = Math.max(0, entry.newBorrowing);
      const balance = Math.max(0, entry.balance);
      // What the card would stand at if no interest had been charged.
      const expected = debt.balance - paid + newBorrowing;
      const interestCharged = Math.max(0, balance - expected);
      const principalRepaid = Math.max(0, paid - interestCharged);

      totals.openingDebt += debt.balance;
      totals.closingDebt += balance;
      totals.paid += paid;
      totals.principalRepaid += principalRepaid;
      totals.interestCharged += interestCharged;
      totals.newBorrowing += newBorrowing;

      debt.balance = balance;
      await ctx.db.patch(debt._id, {
        balance,
        status: balance <= 0 ? "settled" : debt.status,
      });
      await ctx.db.insert("balanceEntries", {
        userId: user._id,
        debtId: debt._id,
        balance,
        amountPaid: paid,
        principalCleared: principalRepaid,
        interestCharged,
        newBorrowing,
        reviewId,
        source: "review",
        loggedAt: now,
      });
    }

    const debtFreeAfter = buildPayoffPlan(
      active.filter((d) => d.balance > 0).map(engineInput),
      attack,
      strategy,
    ).debtFreeOn;
    await ctx.db.patch(reviewId, { ...totals, debtFreeAfter });
    if (user.reviewCadence !== args.cadence) {
      await ctx.db.patch(user._id, { reviewCadence: args.cadence });
    }
    return reviewId;
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    country: v.optional(v.string()),
    monthlyIncome: v.optional(v.number()),
    monthlyEssentials: v.optional(v.number()),
    payday: v.optional(v.number()),
    priorityObligations: v.optional(v.number()),
    remittances: v.optional(v.number()),
    sinkingFunds: v.optional(v.number()),
    debtAttack: v.optional(v.number()),
    debtAttackSource: v.optional(v.string()),
    windfallRule: v.optional(v.string()),
    reviewCadence: v.optional(v.string()),
    moneyPurpose: v.optional(v.string()),
    goodDecision: v.optional(v.string()),
    upbringing: v.optional(v.string()),
    strategy: v.optional(v.string()),
  },
  handler: async (ctx, fields) => {
    const user = await demoUser(ctx);
    const patch = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
    await ctx.db.patch(user._id, patch);
    return ctx.db.get(user._id);
  },
});

/** Recorded once the person has read what Ren does and does not do. */
export const acceptContract = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await demoUser(ctx);
    if (!user.contractedAt) await ctx.db.patch(user._id, { contractedAt: Date.now() });
    return user._id;
  },
});

export const setStrategy = mutation({
  args: { strategy: v.string() },
  handler: async (ctx, { strategy }) => {
    const user = await demoUser(ctx);
    await ctx.db.patch(user._id, { strategy });
    return strategy;
  },
});

export const addJar = mutation({
  args: { name: v.string(), purpose: v.string(), target: v.number(), saved: v.number() },
  handler: async (ctx, args) => {
    const user = await demoUser(ctx);
    const id = await ctx.db.insert("jars", { ...args, userId: user._id });
    return ctx.db.get(id);
  },
});

export const removeJar = mutation({
  args: { id: v.id("jars") },
  handler: async (ctx, { id }) => {
    const user = await demoUser(ctx);
    const jar = await ctx.db.get(id);
    if (!jar || jar.userId !== user._id) return null;
    const deposits = await ctx.db
      .query("deposits")
      .withIndex("by_jar", (q) => q.eq("jarId", id))
      .collect();
    await Promise.all(deposits.map((deposit) => ctx.db.delete(deposit._id)));
    await ctx.db.delete(id);
    return id;
  },
});

export const depositToJar = mutation({
  args: { jarId: v.id("jars"), amount: v.number(), note: v.string() },
  handler: async (ctx, { jarId, amount, note }) => {
    const user = await demoUser(ctx);
    const jar = await ctx.db.get(jarId);
    if (!jar || jar.userId !== user._id) return null;
    const saved = Math.max(0, jar.saved + amount);
    await ctx.db.patch(jarId, { saved });
    await ctx.db.insert("deposits", { jarId, amount, note, at: Date.now() });
    return ctx.db.get(jarId);
  },
});

export const jarByName = query({
  args: { needle: v.optional(v.string()) },
  handler: async (ctx, { needle }) => {
    const user = await demoUser(ctx);
    const jars = await ctx.db
      .query("jars")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    if (!needle) return jars[0] ?? null;
    const lowered = needle.toLowerCase();
    return jars.find((jar) => jar.name.toLowerCase().includes(lowered)) ?? jars[0] ?? null;
  },
});

export const addCommitment = mutation({
  args: {
    wish: v.string(),
    outcome: v.string(),
    obstacle: v.string(),
    ifThenPlan: v.string(),
    trigger: v.string(),
    ownershipConfirmed: v.boolean(),
    days: v.number(),
  },
  handler: async (ctx, { days, ...rest }) => {
    const user = await demoUser(ctx);
    return ctx.db.insert("commitments", {
      ...rest,
      userId: user._id,
      reflection: "",
      dueAt: Date.now() + days * 24 * 60 * 60 * 1000,
      status: "open",
      createdAt: Date.now(),
    });
  },
});

export const setCommitmentStatus = mutation({
  args: { id: v.id("commitments"), status: v.string(), reflection: v.string() },
  handler: async (ctx, { id, status, reflection }) => {
    const user = await demoUser(ctx);
    const commitment = await ctx.db.get(id);
    if (!commitment || commitment.userId !== user._id) return null;
    await ctx.db.patch(id, { status, reflection });
    return id;
  },
});

/**
 * Ren works a transfer out loud and files it here. Nothing on the cards moves
 * until the person applies it on screen.
 */
export const proposeBalanceMove = mutation({
  args: {
    fromDebtId: v.id("debts"),
    toIssuer: v.string(),
    toName: v.string(),
    amount: v.number(),
    monthlyRate: v.number(),
    promoMonths: v.number(),
    fee: v.number(),
    revertRate: v.number(),
    note: v.string(),
    sourceUrl: v.optional(v.string()),
    sourceTitle: v.optional(v.string()),
    retrievedAt: v.optional(v.string()),
    publishedPromoRate: v.optional(v.string()),
    publishedPromoPeriod: v.optional(v.string()),
    publishedRevertRate: v.optional(v.string()),
    publishedFee: v.optional(v.string()),
    publishedEarlySettlementFee: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await demoUser(ctx);
    const debt = await ctx.db.get(args.fromDebtId);
    if (!debt || debt.userId !== user._id) return null;
    return ctx.db.insert("proposals", {
      ...args,
      userId: user._id,
      kind: "balance_move",
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

/**
 * Applying moves principal between cards. The old card's opening balance drops
 * by the same amount as its balance, so a transfer never reads as money paid off.
 */
export const applyProposal = mutation({
  args: { id: v.id("proposals") },
  handler: async (ctx, { id }) => {
    const user = await demoUser(ctx);
    const proposal = await ctx.db.get(id);
    if (!proposal || proposal.userId !== user._id || proposal.status !== "pending") return null;
    const from = await ctx.db.get(proposal.fromDebtId);
    if (!from) return null;

    const moved = Math.min(proposal.amount, from.balance);
    await ctx.db.patch(from._id, {
      balance: from.balance - moved,
      openingBalance: Math.max(0, from.openingBalance - moved),
    });
    await ctx.db.insert("balanceEntries", {
      userId: user._id,
      debtId: from._id,
      balance: from.balance - moved,
      amountPaid: 0,
      principalCleared: 0,
      interestCharged: 0,
      source: "balance_transfer",
      loggedAt: Date.now(),
    });

    const opened = moved + proposal.fee;
    const toId = await ctx.db.insert("debts", {
      userId: user._id,
      name: proposal.toName,
      issuer: proposal.toIssuer,
      kind: "card",
      openingBalance: opened,
      balance: opened,
      monthlyRate: proposal.monthlyRate,
      minimumPayment: Math.max(100, Math.round(opened * 0.05)),
      isIslamic: false,
      isEstimated: true,
      carryingBalance: true,
      status: "active",
    });

    await ctx.db.patch(id, { status: "applied" });
    return toId;
  },
});

export const discardProposal = mutation({
  args: { id: v.id("proposals") },
  handler: async (ctx, { id }) => {
    const user = await demoUser(ctx);
    const proposal = await ctx.db.get(id);
    if (!proposal || proposal.userId !== user._id) return null;
    await ctx.db.patch(id, { status: "discarded" });
    return id;
  },
});

export const nameBelief = mutation({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    const user = await demoUser(ctx);
    return ctx.db.insert("beliefs", {
      userId: user._id,
      text,
      namedOn: Date.now(),
      status: "active",
    });
  },
});

export const startSession = mutation({
  args: {
    agenda: v.string(),
    agendaReason: v.string(),
    technique: v.string(),
    plannedMinutes: v.number(),
    contractChoice: v.string(),
    mode: v.optional(v.string()),
  },
  handler: async (ctx, { mode, ...args }) => {
    const user = await demoUser(ctx);
    return ctx.db.insert("sessions", {
      ...args,
      userId: user._id,
      mode: mode ?? "voice",
      summary: "",
      closingReflection: "",
      startedAt: Date.now(),
    });
  },
});

export const endSession = mutation({
  args: { id: v.id("sessions"), summary: v.string(), closingReflection: v.string() },
  handler: async (ctx, { id, summary, closingReflection }) => {
    await ctx.db.patch(id, { summary, closingReflection, endedAt: Date.now() });
    return id;
  },
});

type SeedEvent = { week: number; principal?: number; newBorrowing?: number };

type SeedDebt = {
  name: string;
  issuer: string;
  kind: string;
  provider?: string;
  openingBalance: number;
  balance: number;
  monthlyRate: number;
  minimumPayment: number;
  dueDay: number;
  statementDay: number;
  isIslamic: boolean;
  estimatedFields?: string;
  /** Lumps and slips that the straight line does not explain. */
  events: SeedEvent[];
};

type SeedCommitment = {
  wish: string;
  trigger: string;
  status: string;
  daysAgo: number;
  sessionIndex: number;
};

/** Weeks of history behind the demo. Everything dated in the seed hangs off this. */
const HISTORY_WEEKS = 32;
/** The newest weekly reading is this many days old. */
const HISTORY_OFFSET_DAYS = 2;

/**
 * Idempotent: wipes the demo user's rows and lays down Layla's thirty-two
 * weeks again. Safe to run before a demo.
 */
export const seed = mutation({
  args: {
    profile: v.object({
      monthlyIncome: v.number(),
      monthlyEssentials: v.number(),
      payday: v.number(),
      priorityObligations: v.number(),
      remittances: v.number(),
      sinkingFunds: v.number(),
      debtAttack: v.number(),
      debtAttackSource: v.string(),
      windfallRule: v.string(),
      reviewCadence: v.string(),
    }),
    debts: v.array(
      v.object({
        name: v.string(),
        issuer: v.string(),
        kind: v.string(),
        provider: v.optional(v.string()),
        openingBalance: v.number(),
        balance: v.number(),
        monthlyRate: v.number(),
        minimumPayment: v.number(),
        dueDay: v.number(),
        statementDay: v.number(),
        isIslamic: v.boolean(),
        estimatedFields: v.optional(v.string()),
        events: v.array(
          v.object({
            week: v.number(),
            principal: v.optional(v.number()),
            newBorrowing: v.optional(v.number()),
          }),
        ),
      }),
    ),
    jars: v.array(
      v.object({
        name: v.string(),
        purpose: v.string(),
        target: v.number(),
        saved: v.number(),
      }),
    ),
    beliefs: v.array(v.object({ text: v.string(), daysAgo: v.number() })),
    sessions: v.array(
      v.object({
        agenda: v.string(),
        agendaReason: v.string(),
        technique: v.string(),
        plannedMinutes: v.number(),
        contractChoice: v.string(),
        mode: v.optional(v.string()),
        daysAgo: v.number(),
      }),
    ),
    commitments: v.array(
      v.object({
        wish: v.string(),
        trigger: v.string(),
        status: v.string(),
        daysAgo: v.number(),
        sessionIndex: v.number(),
      }),
    ),
    /** One payday review, covering the weeks between fromWeek (exclusive) and toWeek (inclusive). */
    review: v.object({
      fromWeek: v.number(),
      toWeek: v.number(),
      reflection: v.string(),
      daysAgo: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const day = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const weekAt = (week: number) => now - ((HISTORY_WEEKS - week) * 7 + HISTORY_OFFSET_DAYS) * day;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", DEMO_EMAIL))
      .unique();

    if (existing) {
      const mine = existing._id;
      const stale = await Promise.all([
        ctx.db.query("debts").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
        ctx.db.query("jars").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
        ctx.db.query("commitments").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
        ctx.db.query("beliefs").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
        ctx.db.query("sessions").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
        ctx.db.query("balanceEntries").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
        ctx.db.query("proposals").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
        ctx.db.query("reviews").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
      ]);
      for (const rows of stale) await Promise.all(rows.map((row) => ctx.db.delete(row._id)));
      await ctx.db.delete(mine);
    }

    const userId: Id<"users"> = await ctx.db.insert("users", {
      name: "Layla",
      email: DEMO_EMAIL,
      country: "AE",
      ...args.profile,
      strategy: "snowball",
      weeksActive: HISTORY_WEEKS,
      upbringing: "Money was something the adults argued about after we went to bed.",
      moneyPurpose: "So my mother never has to ask anyone for anything.",
      goodDecision: "I stopped using two of the cards in March and I haven't touched them since.",
      stemPeak: 0,
      contractedAt: weekAt(1) - 2 * day,
    });

    // Per week, across every card: the four numbers the payday review is built from.
    const weekly = Array.from({ length: HISTORY_WEEKS + 1 }, () => ({
      balance: 0,
      paid: 0,
      principal: 0,
      interest: 0,
      newBorrowing: 0,
    }));

    for (const debt of args.debts as SeedDebt[]) {
      const { events, ...fields } = debt;
      const debtId = await ctx.db.insert("debts", {
        ...fields,
        userId,
        isEstimated: Boolean(debt.estimatedFields),
        carryingBalance: true,
        status: "active",
      });

      const lumps = events.reduce((sum, e) => sum + (e.principal ?? 0), 0);
      const slips = events.reduce((sum, e) => sum + (e.newBorrowing ?? 0), 0);
      // The steady weekly clearance once the one-offs are taken out of the line.
      const step = (debt.openingBalance - debt.balance - lumps + slips) / HISTORY_WEEKS;
      const weeklyRate = debt.monthlyRate * (7 / 30.4);

      let previous = debt.openingBalance;
      weekly[0].balance += previous;
      for (let week = 1; week <= HISTORY_WEEKS; week += 1) {
        const event = events.find((e) => e.week === week);
        const lump = event?.principal ?? 0;
        const newBorrowing = event?.newBorrowing ?? 0;
        const balance =
          week === HISTORY_WEEKS ? debt.balance : previous - step - lump + newBorrowing;
        const interestCharged = previous * weeklyRate;
        const principalCleared = Math.max(0, previous + newBorrowing - balance);
        const amountPaid = principalCleared + interestCharged;
        await ctx.db.insert("balanceEntries", {
          userId,
          debtId,
          balance,
          amountPaid,
          principalCleared,
          interestCharged,
          newBorrowing,
          source: lump > 0 ? "windfall" : "self_report",
          loggedAt: weekAt(week),
        });
        weekly[week].balance += balance;
        weekly[week].paid += amountPaid;
        weekly[week].principal += principalCleared;
        weekly[week].interest += interestCharged;
        weekly[week].newBorrowing += newBorrowing;
        previous = balance;
      }
    }

    for (const jar of args.jars) await ctx.db.insert("jars", { ...jar, userId });
    for (const belief of args.beliefs) {
      await ctx.db.insert("beliefs", {
        userId,
        text: belief.text,
        namedOn: now - belief.daysAgo * day,
        status: "active",
      });
    }

    const sessionIds: Id<"sessions">[] = [];
    for (const session of args.sessions) {
      sessionIds.push(
        await ctx.db.insert("sessions", {
          userId,
          agenda: session.agenda,
          agendaReason: session.agendaReason,
          technique: session.technique,
          plannedMinutes: session.plannedMinutes,
          contractChoice: session.contractChoice,
          mode: session.mode ?? "voice",
          summary: "",
          closingReflection: "",
          startedAt: now - session.daysAgo * day,
          endedAt: now - session.daysAgo * day + session.plannedMinutes * 60 * 1000,
        }),
      );
    }

    for (const commitment of args.commitments as SeedCommitment[]) {
      await ctx.db.insert("commitments", {
        userId,
        sessionId: sessionIds[commitment.sessionIndex] ?? undefined,
        wish: commitment.wish,
        outcome: "",
        obstacle: "",
        ifThenPlan: "",
        trigger: commitment.trigger,
        ownershipConfirmed: true,
        reflection: "",
        dueAt: now - commitment.daysAgo * day + 7 * day,
        status: commitment.status,
        createdAt: now - commitment.daysAgo * day,
      });
    }

    const { review } = args;
    const window = weekly.slice(review.fromWeek + 1, review.toWeek + 1);
    const sum = (key: "paid" | "principal" | "interest" | "newBorrowing") =>
      window.reduce((total, week) => total + week[key], 0);
    const planOn = (balances: Map<string, number>) =>
      buildPayoffPlan(
        (args.debts as SeedDebt[])
          .map((d, i) => ({ ...engineInputFromSeed(d, i), balance: balances.get(d.name) ?? 0 }))
          .filter((d) => d.balance > 0),
        args.profile.debtAttack,
        "snowball",
        new Date(weekAt(review.toWeek)),
      ).debtFreeOn;
    const balancesAt = (week: number) =>
      new Map(
        (args.debts as SeedDebt[]).map((d) => [d.name, seedBalanceAt(d, week)]),
      );
    await ctx.db.insert("reviews", {
      userId,
      cadence: review.fromWeek === review.toWeek - 1 ? "weekly" : "payday",
      openingDebt: weekly[review.fromWeek].balance,
      closingDebt: weekly[review.toWeek].balance,
      paid: sum("paid"),
      principalRepaid: sum("principal"),
      interestCharged: sum("interest"),
      newBorrowing: sum("newBorrowing"),
      debtFreeBefore: planOn(balancesAt(review.fromWeek)),
      debtFreeAfter: planOn(balancesAt(review.toWeek)),
      reflection: review.reflection,
      completedAt: now - review.daysAgo * day,
    });

    return { userId };
  },
});

function engineInputFromSeed(debt: SeedDebt, index: number): DebtInput {
  return {
    id: String(index),
    name: debt.name,
    issuer: debt.issuer,
    balance: debt.balance,
    monthlyRate: debt.monthlyRate,
    minimumPayment: debt.minimumPayment,
  };
}

/** Replays the same straight line the history loop lays down, up to a given week. */
function seedBalanceAt(debt: SeedDebt, week: number): number {
  const lumps = debt.events.reduce((sum, e) => sum + (e.principal ?? 0), 0);
  const slips = debt.events.reduce((sum, e) => sum + (e.newBorrowing ?? 0), 0);
  const step = (debt.openingBalance - debt.balance - lumps + slips) / HISTORY_WEEKS;
  let balance = debt.openingBalance;
  for (let w = 1; w <= week; w += 1) {
    const event = debt.events.find((e) => e.week === w);
    balance = w === HISTORY_WEEKS ? debt.balance : balance - step - (event?.principal ?? 0) + (event?.newBorrowing ?? 0);
  }
  return balance;
}
