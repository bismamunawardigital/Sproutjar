import { v } from "convex/values";

export const onboardingAnswers = v.object({
  why: v.optional(v.string()), pattern: v.optional(v.string()),
  carrying: v.optional(v.string()), help: v.optional(v.string()),
  statement: v.optional(v.string()), setback: v.optional(v.string()), pressure: v.optional(v.string()),
});

export const onboardingProgress = v.object({
  step: v.string(), cardSlot: v.number(), hasMore: v.boolean(),
  money: v.object({ income: v.number(), bills: v.number(), family: v.number(), everyday: v.number() }),
  payment: v.optional(v.number()), moneySkipped: v.boolean(),
  reason: v.optional(v.string()), help: v.optional(v.string()), callFirst: v.boolean(),
});
