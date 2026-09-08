import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    country: v.string(),
    monthlyIncome: v.number(),
    monthlyEssentials: v.number(),
    /** Day of the month salary lands, 1-31. */
    payday: v.optional(v.number()),
    /** Rent, school fees, loan instalments: fixed and non-negotiable. */
    priorityObligations: v.optional(v.number()),
    /** Money sent home. Treated as untouchable, never as slack. */
    remittances: v.optional(v.number()),
    /** Set aside monthly for predictable lumps: Eid, insurance, travel. */
    sinkingFunds: v.optional(v.number()),
    /**
     * The person's own monthly amount for the cards. When set, it overrides the
     * derived figure; debtAttackSource records which one the plan is running on.
     */
    debtAttack: v.optional(v.number()),
    /** derived | chosen */
    debtAttackSource: v.optional(v.string()),
    /** What happens to a bonus or gift, decided before it arrives. */
    windfallRule: v.optional(v.string()),
    /** weekly | payday */
    reviewCadence: v.optional(v.string()),
    /** The person has read what Ren does and does not do. */
    contractedAt: v.optional(v.number()),
    strategy: v.string(),
    weeksActive: v.number(),
    upbringing: v.string(),
    moneyPurpose: v.string(),
    goodDecision: v.string(),
    /** High-water mark for the stem. The plant is never allowed to fall below it. */
    stemPeak: v.number(),
  }).index("by_email", ["email"]),

  debts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    issuer: v.string(),
    kind: v.string(),
    openingBalance: v.number(),
    balance: v.number(),
    monthlyRate: v.number(),
    minimumPayment: v.number(),
    /** Day of the month the payment is due, 1-31. */
    dueDay: v.optional(v.number()),
    /** Day of the month the statement is cut, 1-31. */
    statementDay: v.optional(v.number()),
    /** Tabby, Postpay, Tamara: set when kind is bnpl. */
    provider: v.optional(v.string()),
    /** Which figures are estimates: rate | minimum | balance, comma separated. */
    estimatedFields: v.optional(v.string()),
    isIslamic: v.boolean(),
    isEstimated: v.boolean(),
    carryingBalance: v.boolean(),
    status: v.string(),
  }).index("by_user", ["userId"]),

  balanceEntries: defineTable({
    userId: v.id("users"),
    debtId: v.id("debts"),
    balance: v.number(),
    amountPaid: v.number(),
    principalCleared: v.number(),
    interestCharged: v.number(),
    /** Anything new that went on the card since the last reading. */
    newBorrowing: v.optional(v.number()),
    reviewId: v.optional(v.id("reviews")),
    source: v.string(),
    loggedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_debt", ["debtId"]),

  /**
   * The review ritual: the four numbers recorded between calls, and one
   * observation in the person's own words. Ren's next agenda is derived from
   * the gap between what was intended and what was recorded here.
   */
  reviews: defineTable({
    userId: v.id("users"),
    /** weekly | payday */
    cadence: v.string(),
    /** Total owed when the period opened. */
    openingDebt: v.number(),
    /** Total owed when the review was recorded. */
    closingDebt: v.number(),
    paid: v.number(),
    principalRepaid: v.number(),
    interestCharged: v.number(),
    newBorrowing: v.number(),
    /** Debt-free month before and after this review, so the date moving is a fact. */
    debtFreeBefore: v.string(),
    debtFreeAfter: v.string(),
    reflection: v.string(),
    completedAt: v.number(),
  }).index("by_user", ["userId"]),

  jars: defineTable({
    userId: v.id("users"),
    name: v.string(),
    purpose: v.string(),
    target: v.number(),
    saved: v.number(),
  }).index("by_user", ["userId"]),

  deposits: defineTable({
    jarId: v.id("jars"),
    amount: v.number(),
    note: v.string(),
    at: v.number(),
  }).index("by_jar", ["jarId"]),

  sessions: defineTable({
    userId: v.id("users"),
    conversationId: v.optional(v.string()),
    agenda: v.string(),
    agendaReason: v.string(),
    technique: v.string(),
    plannedMinutes: v.number(),
    contractChoice: v.string(),
    mode: v.string(),
    summary: v.string(),
    closingReflection: v.string(),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  commitments: defineTable({
    userId: v.id("users"),
    sessionId: v.optional(v.id("sessions")),
    wish: v.string(),
    outcome: v.string(),
    obstacle: v.string(),
    ifThenPlan: v.string(),
    trigger: v.string(),
    ownershipConfirmed: v.boolean(),
    reflection: v.string(),
    dueAt: v.optional(v.number()),
    /** open | kept | partial | missed */
    status: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  /**
   * A change Ren worked out on a call. It sits here until the person taps
   * apply, so a mishearing never moves their money.
   */
  proposals: defineTable({
    userId: v.id("users"),
    /** balance_move is the only kind so far. */
    kind: v.string(),
    fromDebtId: v.id("debts"),
    toIssuer: v.string(),
    toName: v.string(),
    amount: v.number(),
    monthlyRate: v.number(),
    promoMonths: v.number(),
    fee: v.number(),
    revertRate: v.number(),
    note: v.string(),
    /** Where the terms came from: the bank's own page, read when Ren checked. */
    sourceUrl: v.optional(v.string()),
    sourceTitle: v.optional(v.string()),
    retrievedAt: v.optional(v.string()),
    /** Terms as the bank published them, when the page stated them. */
    publishedPromoRate: v.optional(v.string()),
    publishedPromoPeriod: v.optional(v.string()),
    publishedRevertRate: v.optional(v.string()),
    publishedFee: v.optional(v.string()),
    publishedEarlySettlementFee: v.optional(v.string()),
    /** pending | applied | discarded */
    status: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  beliefs: defineTable({
    userId: v.id("users"),
    text: v.string(),
    namedOn: v.number(),
    status: v.string(),
  }).index("by_user", ["userId"]),
});
