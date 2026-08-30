import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    country: v.string(),
    monthlyIncome: v.number(),
    monthlyEssentials: v.number(),
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
    source: v.string(),
    loggedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_debt", ["debtId"]),

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

  beliefs: defineTable({
    userId: v.id("users"),
    text: v.string(),
    namedOn: v.number(),
    status: v.string(),
  }).index("by_user", ["userId"]),
});
