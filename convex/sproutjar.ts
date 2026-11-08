import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { debtAttackFor } from "../src/lib/cash-flow";
import { buildPayoffPlan, isPaymentEntry, type DebtInput } from "../src/lib/debt-engine";
import { STARTER_RESERVE_DEFAULT } from "../src/lib/jars";
import { planReviewDays, planReviewSplit, planStrategy } from "../src/lib/plan";
import { onboardingAnswers, onboardingProgress } from "./onboarding";
import { INITIAL_ONBOARDING, onboardingAnswersSchema, onboardingProgressSchema } from "../src/lib/onboarding";

const DEMO_EMAIL = "demo@sproutjar.app";

/**
 * Who a request is for. The Next server resolves the signed-in person (or the
 * shared Layla demo) and sends it along; serverKey proves the call came from
 * our own server rather than straight at the deployment URL.
 */
export const callerArg = v.object({ serverKey: v.string(), userKey: v.string() });
type Caller = { serverKey: string; userKey: string };

function assertServer(caller: { serverKey: string }) {
  const expected = process.env.SPROUTJAR_SERVER_KEY;
  if (!expected) throw new Error("SPROUTJAR_SERVER_KEY is not set on this Convex deployment.");
  if (caller.serverKey !== expected) throw new Error("Not from the Sproutjar server.");
}

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

async function callerUser(ctx: QueryCtx | MutationCtx, caller: Caller): Promise<Doc<"users">> {
  assertServer(caller);
  const user =
    caller.userKey === "demo"
      ? await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", DEMO_EMAIL)).unique()
      : await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", caller.userKey)).unique();
  if (!user) throw new Error("No Sproutjar profile for this person yet.");
  return user;
}

/** Everything a person owns, for the snapshot and for deleting an account. */
async function rowsFor(ctx: QueryCtx | MutationCtx, mine: Id<"users">) {
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
  return { debts, jars, commitments, beliefs, sessions, balanceEntries, proposals, reviews };
}

/**
 * First sign-in creates the row; every later one returns it. Name and email
 * come from the identity provider and are only filled in where still blank.
 */
export const ensureUser = mutation({
  args: { caller: callerArg, name: v.string(), email: v.string() },
  handler: async (ctx, { caller, name, email }) => {
    assertServer(caller);
    if (caller.userKey === "demo") return callerUser(ctx, caller);
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", caller.userKey))
      .unique();
    if (existing) return existing;
    const id = await ctx.db.insert("users", {
      clerkId: caller.userKey,
      name: name || "there",
      email,
      country: "AE",
      monthlyIncome: 0,
      monthlyEssentials: 0,
      strategy: "avalanche",
      weeksActive: 0,
      upbringing: "",
      moneyPurpose: "",
      goodDecision: "",
      stemPeak: 0,
    });
    // The cushion jar exists from day one, so the first deposit has somewhere to go.
    await ctx.db.insert("jars", {
      userId: id,
      name: "Cushion",
      purpose: "emergency",
      target: STARTER_RESERVE_DEFAULT,
      saved: 0,
    });
    return (await ctx.db.get(id))!;
  },
});

/** The answers from the first screens, kept so Ren can open the first call already knowing them. */
export const completeOnboarding = mutation({
  args: {
    caller: callerArg,
    complete: v.optional(v.boolean()),
    name: v.optional(v.string()),
    country: v.optional(v.string()),
    answers: onboardingAnswers,
    progress: v.optional(onboardingProgress),
    saveMoney: v.optional(v.boolean()),
  },
  handler: async (ctx, { caller, complete, name, country, answers, progress, saveMoney }) => {
    const user = await callerUser(ctx, caller);
    if (caller.userKey === "demo") throw new Error("The demo is read-only.");
    onboardingAnswersSchema.parse(answers);
    const state = progress ? onboardingProgressSchema.parse(progress) : undefined;
    if (saveMoney && !state) throw new Error("Money needs saved onboarding progress.");
    if (state && complete && !["hello", "seed"].includes(state.step)) throw new Error("Finish the onboarding steps first.");
    await ctx.db.patch(user._id, {
      ...(name ? { name } : {}),
      ...(country ? { country } : {}),
      onboarding: answers,
      ...(state ? { onboardingProgress: state } : {}),
      ...(saveMoney && state ? {
        ...(!state.moneySkipped ? { monthlyIncome: state.money.income, monthlyEssentials: state.money.bills + state.money.everyday, remittances: state.money.family, priorityObligations: 0 } : {}),
        debtAttack: state.payment ?? 0,
        debtAttackSource: "chosen",
        strategy: "avalanche",
      } : {}),
      ...(complete ? { onboardedAt: user.onboardedAt ?? Date.now() } : {}),
    });
    return ctx.db.get(user._id);
  },
});

/** Removes the person and every row that hangs off them. The demo cannot be deleted this way. */
export const deleteAccount = mutation({
  args: { caller: callerArg },
  handler: async (ctx, { caller }) => {
    assertServer(caller);
    if (caller.userKey === "demo") throw new Error("The demo profile stays.");
    // Nothing left to delete is a success, so a retry after a half-finished delete goes through.
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", caller.userKey))
      .unique();
    if (!user) return null;
    const rows = await rowsFor(ctx, user._id);
    for (const jar of rows.jars) {
      const deposits = await ctx.db.query("deposits").withIndex("by_jar", (q) => q.eq("jarId", jar._id)).collect();
      await Promise.all(deposits.map((d) => ctx.db.delete(d._id)));
    }
    for (const list of Object.values(rows)) await Promise.all(list.map((row) => ctx.db.delete(row._id)));
    await ctx.db.delete(user._id);
    return user._id;
  },
});

/**
 * Everything the dashboard and Ren need, in one live read. Subscribing to this
 * is what makes a jar deposit Ren logs mid-call appear on screen without a
 * refresh.
 */
export const snapshot = query({
  args: { caller: callerArg},
  handler: async (ctx, { caller }) => {
    const user = await callerUser(ctx, caller);
    const { debts, jars, commitments, beliefs, sessions, balanceEntries, proposals, reviews } =
      await rowsFor(ctx, user._id);
    const completedSessions = sessions.filter((session) => session.endedAt !== undefined);

    return {
      user,
      debts: debts
        .filter((d) => d.status === "active")
        .sort((a, b) => a.balance - b.balance),
      settledDebts: debts.filter((d) => d.status === "settled"),
      jars,
      commitments: commitments.sort((a, b) => b.createdAt - a.createdAt),
      beliefs: beliefs.filter((b) => b.status === "active"),
      sessions: completedSessions.sort((a, b) => b.startedAt - a.startedAt).slice(0, 8),
      completedSessionCount: completedSessions.length,
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
  args: { caller: callerArg, stemPct: v.number() },
  handler: async (ctx, { caller, stemPct }) => {
    const user = await callerUser(ctx, caller);
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

export const saveOnboardingCard = mutation({
  args: {
    caller: callerArg, slot: v.number(), name: v.string(), issuer: v.string(),
    balance: v.number(), monthlyRate: v.number(), minimumPayment: v.number(),
    ...debtDetailArgs,
  },
  handler: async (ctx, { caller, slot, ...fields }) => {
    const user = await callerUser(ctx, caller);
    if (caller.userKey === "demo" || user.onboardedAt) throw new Error("Onboarding is already finished.");
    if (!Number.isInteger(slot) || slot < 0 || slot > 49 || !fields.name.trim() || !Number.isFinite(fields.balance) || fields.balance <= 0 || !Number.isFinite(fields.monthlyRate) || fields.monthlyRate < 0 || fields.monthlyRate > 1 || !Number.isFinite(fields.minimumPayment) || fields.minimumPayment < 0) throw new Error("Check the card figures and try again.");
    const ids = user.onboardingCardIds ?? (await ctx.db.query("debts").withIndex("by_user", (q) => q.eq("userId", user._id)).collect()).filter((debt) => debt.status === "active").sort((a, b) => a.balance - b.balance).map((debt) => debt._id);
    if (slot > ids.length) throw new Error("Save the previous card first.");
    let id = ids[slot];
    if (id) {
      const debt = await ctx.db.get(id);
      if (!debt || debt.userId !== user._id) throw new Error("That card is no longer available.");
      await ctx.db.patch(id, { ...fields, isEstimated: Boolean(fields.estimatedFields) });
      if (fields.balance !== debt.balance) await ctx.db.insert("balanceEntries", {
        userId: user._id, debtId: id, balance: fields.balance, amountPaid: 0,
        principalCleared: 0, interestCharged: 0, source: "self_report", loggedAt: Date.now(),
      });
    } else {
      id = await ctx.db.insert("debts", {
        ...fields, userId: user._id, kind: "credit_card", isIslamic: false,
        openingBalance: fields.balance, isEstimated: Boolean(fields.estimatedFields), carryingBalance: true, status: "active",
      });
      ids.push(id);
    }
    const progress = { ...INITIAL_ONBOARDING, ...user.onboardingProgress, step: "more", cardSlot: slot };
    await ctx.db.patch(user._id, { onboardingCardIds: ids, onboardingProgress: progress });
    return { id, progress, card: { id, ...fields } };
  },
});

export const addDebt = mutation({
  args: {
    caller: callerArg,
    name: v.string(),
    issuer: v.string(),
    kind: v.string(),
    balance: v.number(),
    monthlyRate: v.number(),
    minimumPayment: v.number(),
    isIslamic: v.boolean(),
    ...debtDetailArgs,
  },
  handler: async (ctx, { caller, ...args }) => {
    const user = await callerUser(ctx, caller);
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
    caller: callerArg,
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
  handler: async (ctx, { caller, id, ...fields }) => {
    const user = await callerUser(ctx, caller);
    const debt = await ctx.db.get(id);
    if (!debt || debt.userId !== user._id) return null;
    const patch = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
    if (fields.estimatedFields !== undefined) patch.isEstimated = fields.estimatedFields !== "";
    await ctx.db.patch(id, patch);
    if (fields.balance !== undefined && fields.balance !== debt.balance) {
      // A hand correction is neither money paid nor principal cleared; it only
      // records that the figure changed. The review maths does not read it.
      await ctx.db.insert("balanceEntries", {
        userId: user._id,
        debtId: id,
        balance: fields.balance,
        amountPaid: 0,
        principalCleared: 0,
        interestCharged: 0,
        source: "self_report",
        loggedAt: Date.now(),
      });
    }
    return ctx.db.get(id);
  },
});

export const removeDebt = mutation({
  args: { caller: callerArg, id: v.id("debts") },
  handler: async (ctx, { caller, id }) => {
    const user = await callerUser(ctx, caller);
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
    caller: callerArg,
    debtId: v.id("debts"),
    balance: v.number(),
    amountPaid: v.number(),
    interestCharged: v.number(),
    newBorrowing: v.optional(v.number()),
    source: v.string(),
  },
  handler: async (ctx, { caller, ...args }) => {
    const user = await callerUser(ctx, caller);
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
 * "I paid this": one payment, the day it happens. The balance drops by the
 * amount, interest is left for the payday review to reconcile.
 */
export const logPayment = mutation({
  args: { caller: callerArg, debtId: v.id("debts"), amount: v.number(), source: v.string() },
  handler: async (ctx, { caller, debtId, amount, source }) => {
    const user = await callerUser(ctx, caller);
    const debt = await ctx.db.get(debtId);
    if (!debt || debt.userId !== user._id) return null;
    // Three decimals, for KWD, BHD and OMR; a cents currency is unaffected.
    const balance = Math.max(0, Math.round((debt.balance - amount) * 1000) / 1000);
    await ctx.db.patch(debtId, { balance });
    await ctx.db.insert("balanceEntries", {
      userId: user._id,
      debtId,
      balance,
      amountPaid: amount,
      principalCleared: debt.balance - balance,
      interestCharged: 0,
      newBorrowing: 0,
      source,
      loggedAt: Date.now(),
    });
    return ctx.db.get(debtId);
  },
});

/** Finds an open card by a loose name, the way someone says it out loud. */
export const debtByName = query({
  args: { caller: callerArg, needle: v.optional(v.string()) },
  handler: async (ctx, { caller, needle }) => {
    const user = await callerUser(ctx, caller);
    const debts = (
      await ctx.db.query("debts").withIndex("by_user", (q) => q.eq("userId", user._id)).collect()
    ).filter((debt) => debt.balance > 0);
    if (!needle) return debts.length === 1 ? debts[0] : null;
    const lowered = needle.toLowerCase();
    // Only an unambiguous match pays. A card named in full always wins; a bank
    // name shared by two cards makes Ren ask, even if only one card carries it.
    const exact = debts.filter((debt) => debt.name.toLowerCase() === lowered);
    if (exact.length === 1) return exact[0];
    if (exact.length > 1) return null;
    const sameBank = debts.filter((debt) => debt.issuer.toLowerCase().includes(lowered));
    if (sameBank.length > 1) return null;
    const partial = debts.filter(
      (debt) => debt.name.toLowerCase().includes(lowered) || lowered.includes(debt.name.toLowerCase()),
    );
    if (partial.length === 1) return partial[0];
    if (partial.length > 1) return null;
    return sameBank[0] ?? null;
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
    caller: callerArg,
    cadence: v.string(),
    reflection: v.string(),
    entries: v.array(
      v.object({
        debtId: v.id("debts"),
        paid: v.number(),
        newBorrowing: v.optional(v.number()),
        balance: v.number(),
      }),
    ),
  },
  handler: async (ctx, { caller, ...args }) => {
    const user = await callerUser(ctx, caller);
    const now = Date.now();
    const debts = await ctx.db
      .query("debts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const active = debts.filter((d) => d.status === "active");
    // "I paid this" already took these off the balances. The statement counts
    // them again, so they are added back to the opening figure before reconciling.
    const previous = (
      await ctx.db.query("reviews").withIndex("by_user", (q) => q.eq("userId", user._id)).collect()
    ).reduce((latest, r) => Math.max(latest, r.completedAt), 0);
    // Only money actually paid is added back. A hand correction redefines what
    // the card stood at, so it is neither a payment nor interest here (older
    // Settled rows that carry an amount still count). `paid` is
    // what was handed over, `reduction` what came off the card (an overpayment
    // on a small balance stops at zero).
    const loggedSince = new Map<Id<"debts">, { paid: number; reduction: number }>();
    const balanceEntries = await ctx.db
      .query("balanceEntries")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const entry of balanceEntries) {
      if (!isPaymentEntry(entry) || entry.loggedAt <= previous) continue;
      const sum = loggedSince.get(entry.debtId) ?? { paid: 0, reduction: 0 };
      loggedSince.set(entry.debtId, {
        paid: sum.paid + entry.amountPaid,
        reduction: sum.reduction + entry.principalCleared,
      });
    }
    const attack = debtAttackFor(user).amount;
    const strategy = planStrategy(user.strategy);
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

    const totals = { openingDebt: 0, closingDebt: 0, paid: 0, principalRepaid: 0, interestCharged: 0, newBorrowing: 0, estimatedSplit: false };
    for (const entry of args.entries) {
      const debt = active.find((d) => d._id === entry.debtId);
      if (!debt) continue;
      const logged = loggedSince.get(debt._id) ?? { paid: 0, reduction: 0 };
      // The statement covers the logged payments too; a blank field means "just those".
      const paid = Math.max(0, entry.paid, logged.paid);
      const balance = Math.max(0, entry.balance);
      const opening = debt.balance + logged.reduction;
      const days = planReviewDays(debt._id, debt._creationTime, balanceEntries, now);
      const { newBorrowing, interestCharged, estimatedSplit } = planReviewSplit(opening, paid, balance, debt.monthlyRate, days, entry.newBorrowing);
      const principalRepaid = Math.max(0, Math.min(paid, opening + newBorrowing) - interestCharged);

      totals.openingDebt += opening;
      totals.closingDebt += balance;
      totals.paid += paid;
      totals.principalRepaid += principalRepaid;
      totals.interestCharged += interestCharged;
      totals.newBorrowing += newBorrowing;
      totals.estimatedSplit ||= estimatedSplit;

      debt.balance = balance;
      await ctx.db.patch(debt._id, {
        balance,
        status: balance <= 0 ? "settled" : debt.status,
      });
      await ctx.db.insert("balanceEntries", {
        userId: user._id,
        debtId: debt._id,
        balance,
        // History counts each dirham once: only what the logged payments had not
        // already covered. The full statement figure sits in statementPaid.
        amountPaid: Math.max(0, paid - logged.paid),
        // Signed on purpose: a logged payment counted as all principal, and the
        // interest found here takes some of that back so the history sums right.
        principalCleared: principalRepaid - logged.reduction,
        statementPaid: paid,
        estimatedSplit,
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
    caller: callerArg,
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
    acknowledgeDebtFree: v.optional(v.boolean()),
  },
  handler: async (ctx, { caller, acknowledgeDebtFree, ...fields }) => {
    const user = await callerUser(ctx, caller);
    const patch = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
    if (acknowledgeDebtFree && !user.debtFreeAcknowledgedAt) {
      if (caller.userKey === "demo") throw new Error("The demo is read-only.");
      const debts = await ctx.db.query("debts").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
      const recorded = debts.filter((debt) => debt.status === "active" || debt.status === "settled");
      if (!recorded.some((debt) => debt.openingBalance > 0) || recorded.some((debt) => debt.status === "active" && debt.balance > 0)) throw new Error("Clear the cards before acknowledging this moment.");
      patch.debtFreeAcknowledgedAt = Date.now();
    }
    await ctx.db.patch(user._id, patch);
    return ctx.db.get(user._id);
  },
});

/** Recorded once the person has read what Ren does and does not do. */
export const acceptContract = mutation({
  args: { caller: callerArg},
  handler: async (ctx, { caller }) => {
    const user = await callerUser(ctx, caller);
    if (!user.contractedAt) await ctx.db.patch(user._id, { contractedAt: Date.now() });
    return user._id;
  },
});

export const setStrategy = mutation({
  args: { caller: callerArg, strategy: v.string() },
  handler: async (ctx, { caller, strategy }) => {
    const user = await callerUser(ctx, caller);
    await ctx.db.patch(user._id, { strategy });
    return strategy;
  },
});

export const addJar = mutation({
  args: { caller: callerArg, name: v.string(), purpose: v.string(), target: v.number(), saved: v.number() },
  handler: async (ctx, { caller, ...args }) => {
    const user = await callerUser(ctx, caller);
    const id = await ctx.db.insert("jars", { ...args, userId: user._id });
    return ctx.db.get(id);
  },
});

export const removeJar = mutation({
  args: { caller: callerArg, id: v.id("jars") },
  handler: async (ctx, { caller, id }) => {
    const user = await callerUser(ctx, caller);
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
  args: { caller: callerArg, jarId: v.id("jars"), amount: v.number(), note: v.string() },
  handler: async (ctx, { caller, jarId, amount, note }) => {
    const user = await callerUser(ctx, caller);
    const jar = await ctx.db.get(jarId);
    if (!jar || jar.userId !== user._id) return null;
    const saved = Math.max(0, jar.saved + amount);
    await ctx.db.patch(jarId, { saved });
    await ctx.db.insert("deposits", { jarId, amount, note, at: Date.now() });
    return ctx.db.get(jarId);
  },
});

export const jarByName = query({
  args: { caller: callerArg, needle: v.optional(v.string()) },
  handler: async (ctx, { caller, needle }) => {
    const user = await callerUser(ctx, caller);
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
    caller: callerArg,
    sessionId: v.optional(v.id("sessions")),
    wish: v.string(),
    outcome: v.string(),
    obstacle: v.string(),
    ifThenPlan: v.string(),
    trigger: v.string(),
    ownershipConfirmed: v.boolean(),
    days: v.number(),
  },
  handler: async (ctx, { caller, days, ...rest }) => {
    const user = await callerUser(ctx, caller);
    if (rest.sessionId) {
      const session = await ctx.db.get(rest.sessionId);
      if (!session || session.userId !== user._id) throw new Error("That talk isn't available.");
    }
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
  args: { caller: callerArg, id: v.id("commitments"), status: v.string(), reflection: v.string() },
  handler: async (ctx, { caller, id, status, reflection }) => {
    const user = await callerUser(ctx, caller);
    if (caller.userKey === "demo") throw new Error("The demo is read-only.");
    if (!["open", "kept", "partial", "missed"].includes(status)) throw new Error("Choose a check-in answer.");
    const commitment = await ctx.db.get(id);
    if (!commitment || commitment.userId !== user._id) return null;
    await ctx.db.patch(id, { status, reflection, ...(status !== "open" && commitment.checkedInAt === undefined ? { checkedInAt: Date.now() } : {}) });
    return id;
  },
});

/**
 * Ren works a transfer out loud and files it here. Nothing on the cards moves
 * until the person applies it on screen.
 */
export const proposeBalanceMove = mutation({
  args: {
    caller: callerArg,
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
  handler: async (ctx, { caller, ...args }) => {
    const user = await callerUser(ctx, caller);
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
  args: { caller: callerArg, id: v.id("proposals") },
  handler: async (ctx, { caller, id }) => {
    const user = await callerUser(ctx, caller);
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
  args: { caller: callerArg, id: v.id("proposals") },
  handler: async (ctx, { caller, id }) => {
    const user = await callerUser(ctx, caller);
    const proposal = await ctx.db.get(id);
    if (!proposal || proposal.userId !== user._id) return null;
    await ctx.db.patch(id, { status: "discarded" });
    return id;
  },
});

export const nameBelief = mutation({
  args: { caller: callerArg, text: v.string(), replaces: v.optional(v.string()) },
  handler: async (ctx, { caller, text, replaces }) => {
    const user = await callerUser(ctx, caller);
    const previousId = replaces ? ctx.db.normalizeId("beliefs", replaces) : null;
    if (previousId) {
      const previous = await ctx.db.get(previousId);
      if (previous && previous.userId === user._id) await ctx.db.delete(previousId);
    }
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
    caller: callerArg,
    agenda: v.string(),
    agendaReason: v.string(),
    technique: v.string(),
    plannedMinutes: v.number(),
    contractChoice: v.string(),
    mode: v.optional(v.string()),
  },
  handler: async (ctx, { caller, mode, ...args }) => {
    const user = await callerUser(ctx, caller);
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
  args: { caller: callerArg, id: v.id("sessions"), summary: v.string(), closingReflection: v.string() },
  handler: async (ctx, { caller, id, summary, closingReflection }) => {
    const user = await callerUser(ctx, caller);
    const session = await ctx.db.get(id);
    if (!session || session.userId !== user._id) return null;
    await ctx.db.patch(id, { summary, closingReflection, endedAt: Date.now() });
    return id;
  },
});

export const recordCompletedSession = mutation({
  args: { caller: callerArg, sessionId: v.id("sessions"), conversationId: v.string() },
  handler: async (ctx, { caller, sessionId, conversationId }) => {
    const user = await callerUser(ctx, caller);
    if (caller.userKey === "demo") throw new Error("The demo is read-only.");
    if (!conversationId.trim()) throw new Error("Invalid talk.");
    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== user._id) throw new Error("That talk isn't available.");
    if (session.conversationId && session.conversationId !== conversationId) throw new Error("That talk belongs to a different conversation.");
    if (session.endedAt === undefined) await ctx.db.patch(sessionId, { conversationId, endedAt: Date.now() });
    return sessionId;
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
const HISTORY_WEEKS = 12;
/** The newest weekly reading is this many days old. */
const HISTORY_OFFSET_DAYS = 2;

/**
 * Idempotent: wipes the demo user's rows and lays down Layla's twelve
 * weeks again. Safe to run before a demo.
 */
export const seed = mutation({
  args: {
    caller: callerArg,
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
      strategy: v.optional(v.string()),
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
        balanceAtStart: v.optional(v.number()),
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
  handler: async (ctx, { caller, ...args }) => {
    assertServer(caller);
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
      strategy: planStrategy(args.profile.strategy),
      weeksActive: Math.floor(Math.max(0, ...args.sessions.map((session) => session.daysAgo)) / 7),
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

    const seededDebts: { debtId: Id<"debts">; debt: SeedDebt }[] = [];
    for (const debt of args.debts as SeedDebt[]) {
      const { events, ...fields } = debt;
      const debtId = await ctx.db.insert("debts", {
        ...fields,
        userId,
        isEstimated: Boolean(debt.estimatedFields),
        carryingBalance: true,
        status: "active",
      });
      seededDebts.push({ debtId, debt });

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
          source: lump > 0 ? "windfall" : "payment",
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
      if (session.balanceAtStart !== undefined) {
        const week = Math.max(0, Math.min(HISTORY_WEEKS, HISTORY_WEEKS - Math.round((session.daysAgo - HISTORY_OFFSET_DAYS) / 7)));
        const balances = seededDebts.map(({ debt }) => seedBalanceAt(debt, week));
        const total = balances.reduce((sum, balance) => sum + balance, 0);
        if (total > 0) for (const [index, { debtId }] of seededDebts.entries()) {
          await ctx.db.insert("balanceEntries", {
            userId, debtId, balance: session.balanceAtStart * balances[index] / total,
            amountPaid: 0, principalCleared: 0, interestCharged: 0, newBorrowing: 0,
            source: "seed_snapshot", loggedAt: now - session.daysAgo * day,
          });
        }
      }
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
        planStrategy(args.profile.strategy),
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
