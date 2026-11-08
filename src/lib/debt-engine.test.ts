import assert from "node:assert/strict";
import { test } from "node:test";
import { buildPayoffPlan, compareStrategies, minimumsOnlyOutlook, monthsOfLifeBack, payoffUnavailableMessage, type DebtInput } from "./debt-engine";
import { debtAllocation } from "./jars";

const start = new Date(2026, 10, 1);
const layla: DebtInput[] = [
  { id: "adcb", name: "ADCB Traveller", issuer: "ADCB", balance: 4800, monthlyRate: 0.0325, minimumPayment: 240 },
  { id: "enbd", name: "Emirates NBD Platinum", issuer: "Emirates NBD", balance: 12400, monthlyRate: 0.0329, minimumPayment: 620 },
  { id: "fab", name: "FAB Titanium", issuer: "FAB", balance: 21900, monthlyRate: 0.0349, minimumPayment: 1095 },
];
const one: DebtInput[] = [{ id: "one", name: "Card", issuer: "Sample", balance: 24000, monthlyRate: 0.0299, minimumPayment: 620 }];

test("Layla smallest-first: 7 months, AED 5,466 interest", () => {
  const plan = buildPayoffPlan(layla, 6500, "snowball", start);
  assert.equal(plan.feasible, true);
  assert.equal(plan.months, 7);
  assert.equal(plan.totalInterest, 5466);
  assert.equal(plan.totalPaid, 44566);
  assert.equal(plan.debtFreeOn, "June 2027");
});

test("Layla highest-rate-first: 7 months, AED 5,323 interest", () => {
  const plan = buildPayoffPlan(layla, 6500, "avalanche", start);
  assert.equal(plan.months, 7);
  assert.equal(plan.totalInterest, 5323);
  assert.equal(plan.totalPaid, 44423);
});

test("Layla minimums-only: 35 months, AED 27,520 interest", () => {
  const plan = minimumsOnlyOutlook(layla, start);
  assert.equal(plan.months, 35);
  assert.equal(plan.totalInterest, 27520);
});

test("One card at 2.99%, AED 3,000 monthly: 10 months", () => {
  const plan = buildPayoffPlan(one, 3000, "avalanche", start);
  assert.equal(plan.months, 10);
  assert.equal(plan.totalInterest, 3847);
  assert.equal(plan.totalPaid, 27847);
  assert.equal(plan.debtFreeOn, "September 2027");
});

test("Payment at or below interest: never, no date or totals", () => {
  for (const budget of [620, 700, 717.6]) {
    const plan = buildPayoffPlan(one, budget, "avalanche", start);
    assert.equal(plan.feasible, false);
    assert.equal(plan.debtFreeOn, "");
    assert.equal(plan.totalInterest, null);
    assert.equal(plan.totalPaid, null);
    assert.deepEqual(plan.milestones, []);
  }
  assert.equal(minimumsOnlyOutlook(one, start).feasible, false);
});

test("600-month cap never presents an unfinished plan as paid off", () => {
  const cards = [{ ...one[0], monthlyRate: 0, minimumPayment: 1 }];
  const plan = buildPayoffPlan(cards, 1, "snowball", start);
  assert.equal(plan.feasible, false);
  assert.equal(plan.debtFreeOn, "");
  assert.equal(plan.totalInterest, null);
  assert.equal(plan.totalPaid, null);
  assert.deepEqual(plan.milestones, []);
});

test("Empty and already-cleared portfolios have zero totals", () => {
  for (const cards of [[], [{ ...one[0], balance: 0 }]]) {
    const plan = buildPayoffPlan(cards, 0, "avalanche", start);
    assert.equal(plan.feasible, true);
    assert.equal(plan.months, 0);
    assert.equal(plan.totalPaid, 0);
    assert.equal(plan.totalInterest, 0);
  }
});

test("Below-minimum and invalid budgets have no payoff totals", () => {
  for (const budget of [1500, Number.NaN, Number.POSITIVE_INFINITY]) {
    const plan = buildPayoffPlan(layla, budget, "snowball", start);
    assert.equal(plan.feasible, false);
    assert.equal(plan.totalPaid, null);
    assert.equal(plan.debtFreeOn, "");
  }
});

test("Minimums precede dynamic snowball ordering and spillover", () => {
  const cards = [
    { ...one[0], id: "a", name: "First card", balance: 100, minimumPayment: 0, monthlyRate: 0 },
    { ...one[0], id: "b", name: "Second card", balance: 200, minimumPayment: 150, monthlyRate: 0 },
  ];
  const plan = buildPayoffPlan(cards, 200, "snowball", start);
  assert.equal(plan.milestones[0].debtId, "b");
  assert.equal(plan.milestones[0].monthCleared, 1);
  assert.deepEqual(plan.order, ["Second card", "First card"]);
  assert.equal(plan.months, 2);
  assert.equal(plan.totalPaid, 300);
  assert.equal(cards[0].balance, 100);
});

test("Reserve inputs agree for plans, comparisons and extra-payment estimates", () => {
  const jars = [{ purpose: "emergency", target: 3000, saved: 2300 }];
  const first = debtAllocation(6500, jars).toDebt;
  const boostedFirst = debtAllocation(7000, jars).toDebt;
  assert.equal(first, 5800);
  const plan = buildPayoffPlan(layla, 6500, "avalanche", start, first);
  const comparison = compareStrategies(layla, 6500, start, first);
  assert.deepEqual(plan, comparison.avalanche);
  assert.equal(monthsOfLifeBack(layla, 6500, 500, "avalanche", first, boostedFirst),
    plan.months - buildPayoffPlan(layla, 7000, "avalanche", start, boostedFirst).months);
  const never = compareStrategies(one, 620, start);
  assert.equal(never.interestSavedByAvalanche, 0);
  assert.equal(never.monthsSavedByAvalanche, 0);
  assert.equal(monthsOfLifeBack(one, 620, 500, "avalanche"), 0);
});

test("First-month budget is not silently increased to cover minimums", () => {
  const plan = buildPayoffPlan(one, 3000, "avalanche", start, 0);
  assert.equal(plan.totalInterest, 4810);
  assert.equal(plan.months, 11);
});

test("Month-end starts do not skip the payoff month", () => {
  const plan = buildPayoffPlan([{ ...one[0], balance: 100, monthlyRate: 0, minimumPayment: 0 }], 100, "avalanche", new Date(2026, 0, 31));
  assert.equal(plan.debtFreeOn, "February 2026");
});

test("Unavailable copy distinguishes a minimum shortfall from a stalled plan", () => {
  const short = buildPayoffPlan(one, 500, "avalanche", start);
  const stalled = buildPayoffPlan(one, 620, "avalanche", start);
  assert.equal(short.feasible, false);
  assert.equal(short.shortfall, 120);
  assert.equal(stalled.feasible, false);
  assert.equal(stalled.shortfall, 0);
  assert.match(payoffUnavailableMessage(short.shortfall), /does not cover the minimum payments/);
  assert.doesNotMatch(payoffUnavailableMessage(stalled.shortfall), /minimum/);
  assert.match(payoffUnavailableMessage(stalled.shortfall), /do not have a payoff date yet/);
});
