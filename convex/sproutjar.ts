import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const DEMO_EMAIL = "demo@sproutjar.app";

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

    const [debts, jars, commitments, beliefs, sessions, balanceEntries] = await Promise.all([
      ctx.db.query("debts").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
      ctx.db.query("jars").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
      ctx.db.query("commitments").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
      ctx.db.query("beliefs").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
      ctx.db.query("sessions").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
      ctx.db.query("balanceEntries").withIndex("by_user", (q) => q.eq("userId", mine)).collect(),
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

export const addDebt = mutation({
  args: {
    name: v.string(),
    issuer: v.string(),
    kind: v.string(),
    balance: v.number(),
    monthlyRate: v.number(),
    minimumPayment: v.number(),
    isIslamic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await demoUser(ctx);
    return ctx.db.insert("debts", {
      ...args,
      userId: user._id,
      // Today's balance is what the plant starts growing against.
      openingBalance: args.balance,
      isEstimated: false,
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
    balance: v.optional(v.number()),
    monthlyRate: v.optional(v.number()),
    minimumPayment: v.optional(v.number()),
    isIslamic: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const user = await demoUser(ctx);
    const debt = await ctx.db.get(id);
    if (!debt || debt.userId !== user._id) return null;
    const patch = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
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
      source: args.source,
      loggedAt: Date.now(),
    });
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    country: v.optional(v.string()),
    monthlyIncome: v.optional(v.number()),
    monthlyEssentials: v.optional(v.number()),
    strategy: v.optional(v.string()),
  },
  handler: async (ctx, fields) => {
    const user = await demoUser(ctx);
    const patch = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
    await ctx.db.patch(user._id, patch);
    return ctx.db.get(user._id);
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
  },
  handler: async (ctx, args) => {
    const user = await demoUser(ctx);
    return ctx.db.insert("sessions", {
      ...args,
      userId: user._id,
      mode: "voice",
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

type SeedDebt = {
  name: string;
  issuer: string;
  openingBalance: number;
  balance: number;
  monthlyRate: number;
  minimumPayment: number;
  isIslamic: boolean;
  isEstimated: boolean;
};

type SeedCommitment = {
  wish: string;
  trigger: string;
  status: string;
  daysAgo: number;
  sessionIndex: number;
};

/**
 * Idempotent: wipes the demo user's rows and lays down Layla's eleven weeks
 * again. Safe to run before a demo.
 */
export const seed = mutation({
  args: {
    debts: v.array(
      v.object({
        name: v.string(),
        issuer: v.string(),
        openingBalance: v.number(),
        balance: v.number(),
        monthlyRate: v.number(),
        minimumPayment: v.number(),
        isIslamic: v.boolean(),
        isEstimated: v.boolean(),
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
  },
  handler: async (ctx, args) => {
    const day = 24 * 60 * 60 * 1000;
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
      ]);
      for (const rows of stale) await Promise.all(rows.map((row) => ctx.db.delete(row._id)));
      await ctx.db.delete(mine);
    }

    const userId: Id<"users"> = await ctx.db.insert("users", {
      name: "Layla",
      email: DEMO_EMAIL,
      country: "AE",
      monthlyIncome: 18000,
      monthlyEssentials: 11500,
      strategy: "snowball",
      weeksActive: 11,
      upbringing: "Money was something the adults argued about after we went to bed.",
      moneyPurpose: "So my mother never has to ask anyone for anything.",
      goodDecision: "I stopped using two of the cards in March and I haven't touched them since.",
      stemPeak: 0,
    });

    for (const debt of args.debts as SeedDebt[]) {
      const debtId = await ctx.db.insert("debts", {
        ...debt,
        userId,
        kind: "credit_card",
        carryingBalance: true,
        status: "active",
      });
      // Eleven weeks of real movement, so the plant's stem has something true behind it.
      const step = (debt.openingBalance - debt.balance) / 11;
      for (let week = 1; week <= 11; week += 1) {
        const balance = debt.openingBalance - step * week;
        await ctx.db.insert("balanceEntries", {
          userId,
          debtId,
          balance,
          amountPaid: step + balance * debt.monthlyRate,
          principalCleared: step,
          interestCharged: balance * debt.monthlyRate,
          source: "self_report",
          loggedAt: Date.now() - (11 - week) * 7 * day,
        });
      }
    }

    for (const jar of args.jars) await ctx.db.insert("jars", { ...jar, userId });
    for (const belief of args.beliefs) {
      await ctx.db.insert("beliefs", {
        userId,
        text: belief.text,
        namedOn: Date.now() - belief.daysAgo * day,
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
          mode: "voice",
          summary: "",
          closingReflection: "",
          startedAt: Date.now() - session.daysAgo * day,
          endedAt: Date.now() - session.daysAgo * day + session.plannedMinutes * 60 * 1000,
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
        dueAt: Date.now() - commitment.daysAgo * day + 7 * day,
        status: commitment.status,
        createdAt: Date.now() - commitment.daysAgo * day,
      });
    }

    return { userId };
  },
});
