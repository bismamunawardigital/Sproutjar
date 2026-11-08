import { z } from "zod";
import { buildPayoffPlan, totalMinimums, type DebtInput } from "./debt-engine";
import { allocateSurplus, STARTER_RESERVE_DEFAULT } from "./jars";

export const ONBOARDING_STEPS = ["q1", "q2", "q3", "name", "card", "type", "statement", "more", "money", "tight", "why", "renready", "plan", "save", "hello", "seed"] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const ONBOARDING_QUESTIONS = [
  { id: "statement", title: "When your card statement arrives, you...", options: ["Open it straight away", "Open it when I feel ready", "Leave it as long as I can", "Pay it, and try not to think about it"] },
  { id: "setback", title: "When a money plan slips, what happens next?", options: ["I pay what I can and carry on", "I restart next month", "I go quiet for a while", "Family needed it more that month"] },
  { id: "pressure", title: "Where does most of the pressure come from?", options: ["The interest", "Spending when I'm tired or stressed", "Not knowing where I stand", "Supporting family alongside the cards"] },
] as const;

export const MONEY_REASONS = {
  bill: ["A big bill or one-off cost", "One big cost can throw a whole month. Ren will help you plan around it."],
  income: ["My income dropped or changed", "That's a lot to carry. Ren will start from what you have now."],
  costs: ["Everyday costs keep going up", "Ren will go through your month with you and see what's moving."],
  family: ["I'm supporting family right now", "Family support stays in your plan. Ren will work around it."],
  unsure: ["I'm not sure", "That's fine. Working it out is what the call is for."],
} as const;
export const MONEY_HELPS = {
  room: ["Find some room together", "Go through your month and look for room"],
  order: ["Decide which card gets what", "Decide which card gets what this month"],
  bank: ["Know what to say to my bank", "Work out what to say to your bank"],
  talk: ["Just talk it through", "Talk it through. Numbers only if you want them"],
} as const;

export const onboardingAnswersSchema = z.object({
  why: z.string().max(100).optional(),
  pattern: z.string().max(100).optional(),
  carrying: z.string().max(100).optional(),
  help: z.string().max(100).optional(),
  statement: z.string().max(100).optional(),
  setback: z.string().max(100).optional(),
  pressure: z.string().max(100).optional(),
});
export type OnboardingAnswers = z.infer<typeof onboardingAnswersSchema>;
const amount = z.number().finite().nonnegative();
export const onboardingProgressSchema = z.object({
  step: z.enum(ONBOARDING_STEPS),
  cardSlot: z.number().int().min(0).max(49),
  hasMore: z.boolean(),
  money: z.object({ income: amount, bills: amount, family: amount, everyday: amount }),
  payment: amount.optional(),
  moneySkipped: z.boolean(),
  reason: z.enum(["bill", "income", "costs", "family", "unsure"]).optional(),
  help: z.enum(["room", "order", "bank", "talk"]).optional(),
  callFirst: z.boolean(),
});
export type OnboardingProgress = z.infer<typeof onboardingProgressSchema>;
export const INITIAL_ONBOARDING: OnboardingProgress = {
  step: "q1", cardSlot: 0, hasMore: false,
  money: { income: 0, bills: 0, family: 0, everyday: 0 },
  moneySkipped: false, callFirst: false,
};

export type OnboardingCard = DebtInput & { estimatedFields?: string; dueDay?: number; statementDay?: number };

export function onboardingMoney(cards: OnboardingCard[], money: OnboardingProgress["money"], chosen?: number, start = new Date()) {
  const minimums = totalMinimums(cards);
  const left = money.income - money.bills - money.family - money.everyday;
  const tier = left <= 0 ? "none" : left < minimums ? "short" : left - minimums < 100 ? "just" : "room";
  const payment = tier === "room" && chosen !== undefined ? Math.max(minimums, Math.min(chosen, left)) : Math.max(0, left);
  const guessed = cards.some((card) => card.balance > 0 && card.estimatedFields?.split(",").includes("minimum"));
  const split = allocateSurplus(payment, STARTER_RESERVE_DEFAULT, 0);
  const firstMonthPayment = Math.max(minimums, split.toDebt);
  const plan = buildPayoffPlan(cards, payment, "avalanche", start, split.toDebt);
  const amortizes = cards.every((card) => card.minimumPayment >= card.balance * card.monthlyRate) || payment > plan.monthlyBleed;
  return { minimums, left, tier, payment, firstMonthPayment, guessed, plan, hasDate: cards.length > 0 && plan.feasible && amortizes && plan.months < 600 };
}

export function onboardingPlanLabel(hasMore: boolean, count: number) {
  return hasMore ? `With this plan, ${count > 1 ? "these cards are" : "this card is"} paid off by` : "With this plan, you'll be debt-free by";
}

export function onboardingVoiceContext(answers: OnboardingAnswers, progress?: OnboardingProgress, cards: OnboardingCard[] = []) {
  const labels = ONBOARDING_QUESTIONS.map((question) => `${question.title} ${answers[question.id] ?? "Not answered"}`);
  if (!progress) return labels.join("\n");
  const money = progress.money;
  const figures = cards.map((card) => `${card.name}: balance ${card.balance}; monthly rate ${card.monthlyRate * 100}%; minimum ${card.minimumPayment}; estimates: ${card.estimatedFields || "none"}`);
  return [...labels,
    `Take-home pay ${money.income}; automatic bills ${money.bills}; family support ${money.family}; everyday spending ${money.everyday}. Money step ${progress.moneySkipped ? "skipped; these are not confirmed figures" : "confirmed as rough figures"}.`,
    `Monthly card payment ${progress.payment ?? 0}. ${progress.hasMore ? "Other debts have not been added; this is not the full debt picture." : "All debts reported as added."}`,
    `Reason: ${progress.reason ? MONEY_REASONS[progress.reason][0] : "Not selected"}. Help wanted: ${progress.help ? MONEY_HELPS[progress.help][1] : "Not selected"}. Family support stays in the plan.`,
    ...figures,
  ].join("\n");
}
