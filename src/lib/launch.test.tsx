import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { renderToStaticMarkup } from "react-dom/server";
import PublicDeletionPage from "../app/delete-public/page";
import manifest from "../app/manifest";
import { SystemPage } from "../components/SystemPage";
import { SUPPORT_EMAIL } from "./legal";
import { pageMetadata } from "./metadata";
import { onboardingRedirect } from "./onboarding-route";
import config from "../../next.config";
import { completeOnboarding, saveOnboardingCard, setCommitmentStatus } from "../../convex/sproutjar";
import { INITIAL_ONBOARDING, ONBOARDING_QUESTIONS, onboardingMoney, onboardingPlanLabel, onboardingProgressSchema, onboardingVoiceContext } from "./onboarding";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import type { FunctionArgs } from "convex/server";
import type { api } from "../../convex/_generated/api";
import type { MutationCtx } from "../../convex/_generated/server";
import { allocateSurplus, STARTER_RESERVE_DEFAULT } from "./jars";
import { buildPayoffPlan } from "./debt-engine";
import { readStatement } from "./statement";
import { CHECKIN_ANSWERS, todayHasDate, todayPayments } from "./today";
import { plantState } from "./plant";
import { TodayHero } from "../components/TodayHero";
import { HomeAgendas } from "../components/HomeAgendas";
import { Plant } from "../components/Plant";
import { PaydayInvitation } from "../components/PaydayInvitation";
import type { Snapshot } from "./user";

test("Today payments follow the live strategy, capped minimums and reserve budget", () => {
  const cards = [
    { id: "high", name: "Layla high", issuer: "Example", balance: 1000, monthlyRate: 0.1, minimumPayment: 100 },
    { id: "small", name: "Layla small", issuer: "Example", balance: 10, monthlyRate: 0, minimumPayment: 50 },
    { id: "zero", name: "Layla zero", issuer: "Example", balance: 0, monthlyRate: 0, minimumPayment: 100 },
  ];
  const rows = todayPayments(cards, 200, "avalanche");
  assert.deepEqual(rows.map((row) => [row.id, row.amount, row.focus]), [["high", 190, true], ["small", 10, false]]);
  assert.equal(todayPayments(cards, 0, "avalanche")[0].amount, 140);
  assert.equal(todayPayments(cards, 200, "snowball")[0].id, "small");
  assert.deepEqual(todayPayments([], 200, "avalanche"), []);
  assert.equal(todayHasDate({ feasible: false, months: 0 }), false);
  assert.equal(todayHasDate({ feasible: true, months: 600 }), false);
  assert.equal(todayHasDate({ feasible: true, months: 8 }), true);
});

test("every honest check-in grows roots without changing or shrinking the money stem", () => {
  const input = { openingPrincipal: 1000, currentPrincipal: 800, sessionsHeld: 6, commitmentsKept: 0, weeksActive: 4, stemPeak: 0.6 };
  const before = plantState(input);
  for (const status of Object.keys(CHECKIN_ANSWERS)) {
    assert.ok(CHECKIN_ANSWERS[status as keyof typeof CHECKIN_ANSWERS].agenda);
    const after = plantState({ ...input, checkins: 1 });
    assert.equal(after.rootDepth, before.rootDepth + 1);
    assert.equal(after.stemPct, before.stemPct);
    assert.equal(after.leafPairs, before.leafPairs);
  }
  assert.equal(plantState({ ...input, checkins: 20 }).rootDepth, 27);
  const crowded = renderToStaticMarkup(<Plant state={plantState({ ...input, checkins: 20 })} />);
  assert.equal((crowded.match(/class="plant-root"/g) ?? []).length, 27);
});

test("Today review invitation reflects the actual cadence and known payday", () => {
  assert.match(renderToStaticMarkup(<PaydayInvitation daysUntil={null} cadence="weekly" />), /Weekly review/);
  assert.match(renderToStaticMarkup(<PaydayInvitation daysUntil={0} cadence="payday" />), /It&#x27;s payday/);
  assert.match(renderToStaticMarkup(<PaydayInvitation daysUntil={2} cadence="payday" />), /Payday is in 2 days/);
  assert.match(renderToStaticMarkup(<PaydayInvitation daysUntil={null} cadence="payday" />), /Payday review/);
});

test("check-ins record every answer once, preserve ownership, and reject invalid or demo writes", async () => onboardingFixture(async ({ caller, user }) => {
  const records = new Map<string, { userId: string; status: string; checkedInAt?: number }>();
  const ctx = { db: {
    query: () => ({ withIndex: () => ({ unique: async () => user }) }),
    get: async (id: string) => structuredClone(records.get(id)),
    patch: async (id: string, patch: object) => Object.assign(records.get(id)!, patch),
  } } as unknown as MutationCtx;
  const run = (setCommitmentStatus as unknown as { _handler: (ctx: MutationCtx, args: FunctionArgs<typeof api.sproutjar.setCommitmentStatus>) => Promise<unknown> })._handler;
  for (const status of ["kept", "partial", "missed"] as const) {
    records.set(status, { userId: user._id, status: "open" });
    const args = { caller, id: status as Id<"commitments">, status, reflection: "" };
    await run(ctx, args);
    const saved = records.get(status)!.checkedInAt;
    assert.ok(saved);
    await run(ctx, args);
    await run(ctx, { ...args, status: "open" });
    await run(ctx, args);
    assert.equal(records.get(status)!.checkedInAt, saved);
  }
  const args = { caller, id: "missing" as Id<"commitments">, status: "kept", reflection: "" };
  assert.equal(await run(ctx, args), null);
  records.set("foreign", { userId: "other", status: "open" });
  assert.equal(await run(ctx, { ...args, id: "foreign" as Id<"commitments"> }), null);
  assert.equal(records.get("foreign")!.checkedInAt, undefined);
  await assert.rejects(run(ctx, { ...args, status: "score" }), /Choose a check-in/);
  await assert.rejects(run(ctx, { ...args, caller: { ...caller, userKey: "demo" } }), /read-only/);
  await assert.rejects(run(ctx, { ...args, caller: { ...caller, serverKey: "wrong" } }), /Not from/);
}));

test("Today hero labels forecasts, handles stalled, empty and debt-free states, and keeps the full AI opener", () => {
  const snap = {
    country: { currency: "AED" }, growth: plantState({ openingPrincipal: 1000, currentPrincipal: 800, sessionsHeld: 0, commitmentsKept: 0, weeksActive: 0, stemPeak: 0 }),
    user: {}, horizon: "clearing", openingPrincipal: 1000, cleared: 200, attack: { amount: 200 }, totals: { debt: 800, saved: 0 }, debts: [], jars: [],
    plan: { feasible: true, months: 5, debtFreeOn: "April 2027", monthlyBleed: 25, shortfall: 0 },
  } as unknown as Snapshot;
  const hero = renderToStaticMarkup(<TodayHero snap={snap} />);
  assert.match(hero, /Estimated/);
  assert.match(hero, /April/);
  assert.ok(!hero.includes("AED 800.00"));
  const stalled = renderToStaticMarkup(<TodayHero snap={{ ...snap, plan: { ...snap.plan, months: 600 } }} />);
  assert.match(stalled, /Not possible yet/);
  assert.ok(!stalled.includes("minimums need"));
  assert.match(renderToStaticMarkup(<TodayHero snap={{ ...snap, totals: { ...snap.totals, debt: 0 }, openingPrincipal: 0 }} />), /One card to start/);
  assert.match(renderToStaticMarkup(<TodayHero snap={{ ...snap, horizon: "building" }} />), /Nothing left to pay/);
  assert.match(renderToStaticMarkup(<TodayHero snap={{ ...snap, horizon: "building", jars: [{ id: "jar", name: "A real goal", target: 1000, saved: 250, pct: 25, stage: "sprout" }] as Snapshot["jars"] }} />), /A real goal/);
  const opener = renderToStaticMarkup(<HomeAgendas agendas={[{ id: "gap", title: "A real topic", reason: "The whole personal sentence stays visible.", minutes: 20, technique: "Looking back" }]} hasHistory />);
  assert.match(opener, /AI voice coach/);
  assert.match(opener, /whole personal sentence stays visible/);
  assert.ok(!opener.includes("line-clamp"));
});

test("statement import keeps full ungrouped balances and still reads grouped amounts", () => {
  assert.equal(readStatement("Total Amount Due AED 4800. Minimum Amount Due AED 240.").balance, 4800);
  assert.equal(readStatement("Total Amount Due AED 12400.50").balance, 12400.50);
  assert.equal(readStatement("Total Amount Due AED 12,400.50").balance, 12400.50);
  assert.equal(readStatement("").balance, null);
  assert.equal(readStatement("Total Amount Due unavailable").balance, null);
});

const runCard = (saveOnboardingCard as unknown as { _handler: (ctx: MutationCtx, args: FunctionArgs<typeof api.sproutjar.saveOnboardingCard>) => Promise<{ id: string }> })._handler;
const runDraft = (completeOnboarding as unknown as { _handler: (ctx: MutationCtx, args: FunctionArgs<typeof api.sproutjar.completeOnboarding>) => Promise<unknown> })._handler;

async function onboardingFixture(check: (fixture: ReturnType<typeof makeOnboardingFixture>) => Promise<void>) {
  const previous = process.env.SPROUTJAR_SERVER_KEY;
  process.env.SPROUTJAR_SERVER_KEY = "onboarding-test-key";
  try { await check(makeOnboardingFixture()); }
  finally { if (previous === undefined) delete process.env.SPROUTJAR_SERVER_KEY; else process.env.SPROUTJAR_SERVER_KEY = previous; }
}

function makeOnboardingFixture() {
  const user = { _id: "user", name: "Layla", country: "AE" } as Doc<"users">;
  const debts = new Map<string, Doc<"debts">>();
  const entries: Record<string, unknown>[] = [];
  const ctx = { db: {
    query: (table: string) => ({ withIndex: () => ({ unique: async () => user, collect: async () => table === "debts" ? [...debts.values()].filter((debt) => debt.userId === user._id) : [] }) }),
    get: async (id: string) => structuredClone(id === user._id ? user : debts.get(id)),
    patch: async (id: string, fields: Record<string, unknown>) => Object.assign(id === user._id ? user : debts.get(id)!, fields),
    insert: async (table: string, fields: Record<string, unknown>) => {
      if (table === "balanceEntries") { entries.push(fields); return `entry-${entries.length}`; }
      const id = `card-${debts.size}`;
      debts.set(id, { ...fields, _id: id } as Doc<"debts">);
      return id;
    },
  } } as unknown as MutationCtx;
  const caller = { serverKey: "onboarding-test-key", userKey: "layla" };
  const card = { caller, slot: 0, name: "Layla card", issuer: "Example", balance: 4800, monthlyRate: 0.0325, minimumPayment: 240, estimatedFields: "rate,minimum" };
  return { user, debts, entries, ctx, caller, card };
}

test("set B has the three prototype questions and keeps family support separate", () => {
  assert.equal(ONBOARDING_QUESTIONS.length, 3);
  assert.ok(ONBOARDING_QUESTIONS.every((question) => question.options.length === 4));
  assert.equal(ONBOARDING_QUESTIONS[1].options[3], "Family needed it more that month");
  assert.equal(ONBOARDING_QUESTIONS[2].options[3], "Supporting family alongside the cards");
});

test("onboarding money covers room, minimum-only, short, zero, skipped and stalled cases", () => {
  const cards = [{ id: "one", name: "Layla card", issuer: "Example", balance: 4800, monthlyRate: 0.0325, minimumPayment: 240, estimatedFields: "minimum" }];
  const money = { income: 18000, bills: 10000, family: 3000, everyday: 2000 };
  const room = onboardingMoney(cards, money, 1000);
  assert.equal(room.left, 3000);
  assert.equal(room.payment, 1000);
  assert.equal(room.tier, "room");
  assert.equal(room.guessed, true);
  assert.equal(room.hasDate, true);
  assert.equal(room.plan.debtFreeOn, buildPayoffPlan(cards, 1000, "avalanche", new Date(), allocateSurplus(1000, STARTER_RESERVE_DEFAULT, 0).toDebt).debtFreeOn);
  assert.equal(onboardingMoney(cards, money, 9000).payment, 3000);
  assert.equal(onboardingMoney(cards, money, 1).payment, 240);
  assert.equal(onboardingMoney(cards, { ...money, everyday: 4710 }).tier, "just");
  assert.equal(onboardingMoney(cards, { ...money, everyday: 4800 }).tier, "short");
  assert.equal(onboardingMoney(cards, { ...money, everyday: 5000 }).tier, "none");
  assert.equal(onboardingMoney(cards, { income: 0, bills: 0, family: 0, everyday: 0 }).hasDate, false);
  assert.equal(onboardingMoney([], money).hasDate, false);
  assert.equal(onboardingMoney([{ ...cards[0], minimumPayment: 100 }], { income: 100, bills: 0, family: 0, everyday: 0 }).hasDate, false);
  assert.equal(onboardingPlanLabel(true, 1), "With this plan, this card is paid off by");
  assert.match(onboardingPlanLabel(true, 2), /these cards are/);
  assert.match(onboardingPlanLabel(false, 1), /debt-free/);
});

test("onboarding progress rejects invalid steps, amounts and choices", () => {
  assert.ok(onboardingProgressSchema.safeParse(INITIAL_ONBOARDING).success);
  for (const invalid of [{ step: "q4" }, { cardSlot: -1 }, { cardSlot: 0.5 }, { money: { ...INITIAL_ONBOARDING.money, family: -10 } }, { payment: Infinity }, { reason: "blame-family" }]) {
    assert.equal(onboardingProgressSchema.safeParse({ ...INITIAL_ONBOARDING, ...invalid }).success, false);
  }
});

test("onboarding card retries update a stable flow slot without duplicate debts or payment entries", async () => onboardingFixture(async ({ ctx, caller, card, user, debts, entries }) => {
  const first = await runCard(ctx, card);
  assert.equal(user.onboardingProgress?.step, "more");
  assert.equal(user.onboardedAt, undefined);
  const repeat = await runCard(ctx, card);
  assert.equal(repeat.id, first.id);
  assert.equal(debts.size, 1);
  assert.equal(entries.length, 0);
  await runDraft(ctx, { caller, answers: { statement: ONBOARDING_QUESTIONS[0].options[1] }, progress: { ...INITIAL_ONBOARDING, step: "money" } });
  assert.equal(user.onboardingProgress?.step, "money");
  assert.equal(user.onboarding?.statement, ONBOARDING_QUESTIONS[0].options[1]);
  assert.equal((await runCard(ctx, { ...card, balance: 4500 })).id, first.id);
  assert.equal(debts.get(first.id)?.openingBalance, 4800);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].source, "self_report");
  assert.equal(entries[0].amountPaid, 0);
  assert.equal(entries[0].principalCleared, 0);
  await runCard(ctx, { ...card, slot: 1, name: "Second card" });
  await runCard(ctx, { ...card, slot: 1, name: "Second card" });
  assert.equal(debts.size, 2);
  assert.equal(user.onboardingCardIds?.length, 2);
}));

test("an unfinished legacy flow adopts its saved card rather than inserting it again", async () => onboardingFixture(async ({ ctx, card, user, debts }) => {
  debts.set("legacy", { _id: "legacy", userId: user._id, ...card, openingBalance: card.balance, status: "active" } as unknown as Doc<"debts">);
  assert.equal((await runCard(ctx, card)).id, "legacy");
  assert.equal(debts.size, 1);
}));

test("first-month card amounts give unused minimums to the focus as the simulation does", () => {
  const cards = [
    { id: "focus", name: "Layla focus", issuer: "Example", balance: 1000, monthlyRate: 0.1, minimumPayment: 100 },
    { id: "small", name: "Layla small", issuer: "Example", balance: 10, monthlyRate: 0, minimumPayment: 50 },
    { id: "paid", name: "Layla paid", issuer: "Example", balance: 0, monthlyRate: 0, minimumPayment: 100 },
  ];
  const money = { income: 1000, bills: 0, family: 0, everyday: 0 };
  const result = onboardingMoney(cards, money);
  assert.equal(result.focusId, "focus");
  assert.equal(result.firstMonthPayment, 150);
  assert.deepEqual([...result.firstMonthPayments], [["focus", 140], ["small", 10], ["paid", 0]]);
  assert.equal([...result.firstMonthPayments.values()].reduce((a, b) => a + b, 0), result.firstMonthPayment);
  assert.equal(onboardingMoney([cards[0]], money).firstMonthPayments.get("focus"), 100);
  assert.equal(onboardingMoney([], money).firstMonthPayments.size, 0);
  assert.equal(onboardingMoney(cards, { ...money, income: 1 }).hasDate, false);
});

test("legacy card slots match the active balance-sorted snapshot and stay stable after edits", async () => onboardingFixture(async ({ ctx, card, user, debts }) => {
  for (const [id, balance, status] of [["older", 4800, "active"], ["closed", 0, "closed"], ["newer", 1000, "active"]] as const) {
    debts.set(id, { _id: id, userId: user._id, ...card, balance, openingBalance: balance, status } as unknown as Doc<"debts">);
  }
  assert.equal((await runCard(ctx, { ...card, balance: 6000 })).id, "newer");
  assert.deepEqual(user.onboardingCardIds, ["newer", "older"]);
  assert.equal(debts.get("older")?.balance, 4800);
  assert.equal(debts.get("newer")?.openingBalance, 1000);
  assert.equal((await runCard(ctx, { ...card, balance: 7000 })).id, "newer");
  assert.equal(debts.size, 3);
}));

test("onboarding card rejects invalid, foreign, missing, finished and demo saves", async () => onboardingFixture(async ({ ctx, card, user, debts }) => {
  await assert.rejects(runCard(ctx, { ...card, balance: -1 }), /Check the card figures/);
  await assert.rejects(runCard(ctx, { ...card, slot: 1 }), /previous card/);
  await assert.rejects(runCard(ctx, { ...card, caller: { ...card.caller, serverKey: "wrong" } }), /Not from the Sproutjar server/);
  await assert.rejects(runCard(ctx, { ...card, caller: { ...card.caller, userKey: "demo" } }), /already finished/);
  assert.equal(debts.size, 0);
  user.onboardingCardIds = ["missing" as Id<"debts">];
  await assert.rejects(runCard(ctx, card), /no longer available/);
  debts.set("missing", { ...card, userId: "someone-else" } as unknown as Doc<"debts">);
  await assert.rejects(runCard(ctx, card), /no longer available/);
  user.onboardedAt = Date.now();
  await assert.rejects(runCard(ctx, card), /already finished/);
}));

test("Option 2 saves protected family support and a chosen card budget without finishing onboarding", async () => onboardingFixture(async ({ ctx, caller, user }) => {
  const progress = { ...INITIAL_ONBOARDING, step: "tight" as const, money: { income: 18000, bills: 10000, family: 3000, everyday: 2000 }, payment: 200, reason: "family" as const, help: "room" as const };
  await runDraft(ctx, { caller, answers: {}, progress, saveMoney: true });
  assert.deepEqual(user.onboardingProgress, progress);
  assert.equal(user.monthlyIncome, 18000);
  assert.equal(user.monthlyEssentials, 12000);
  assert.equal(user.remittances, 3000);
  assert.equal(user.debtAttack, 200);
  assert.equal(user.strategy, "avalanche");
  assert.equal(user.onboardedAt, undefined);
  await assert.rejects(runDraft(ctx, { caller, answers: {}, progress, complete: true }), /Finish the onboarding/);
  await runDraft(ctx, { caller, answers: {}, progress: { ...progress, step: "seed" }, complete: true });
  assert.ok(user.onboardedAt);
}));

test("skipping money keeps unknown figures unknown and invalid progress does not save", async () => onboardingFixture(async ({ ctx, caller, user }) => {
  await runDraft(ctx, { caller, answers: {}, progress: { ...INITIAL_ONBOARDING, step: "plan", payment: 240, moneySkipped: true }, saveMoney: true });
  assert.equal(user.monthlyIncome, undefined);
  assert.equal(user.remittances, undefined);
  assert.equal(user.debtAttack, 240);
  assert.equal(user.onboardedAt, undefined);
  const before = JSON.stringify(user);
  await assert.rejects(runDraft(ctx, { caller, answers: {}, progress: { ...INITIAL_ONBOARDING, step: "q4" } }));
  await assert.rejects(runDraft(ctx, { caller, answers: {}, saveMoney: true }), /Money needs saved/);
  assert.equal(JSON.stringify(user), before);
}));

test("Ren receives set B, four money figures, estimates, missing cards, reason and help", () => {
  const text = onboardingVoiceContext({ statement: "Leave it as long as I can", setback: "I restart next month", pressure: "The interest" }, { ...INITIAL_ONBOARDING, hasMore: true, money: { income: 18000, bills: 10000, family: 3000, everyday: 2000 }, payment: 200, reason: "family", help: "room" }, [{ id: "one", name: "Layla card", issuer: "Example", balance: 4800, monthlyRate: 0.0325, minimumPayment: 240, estimatedFields: "rate,minimum" }]);
  for (const phrase of ["Leave it as long as I can", "I restart next month", "The interest", "18000", "10000", "3000", "2000", "payment 200", "estimates: rate,minimum", "not the full debt picture", "supporting family", "Go through your month", "Family support stays"]) assert.ok(text.includes(phrase), phrase);
  assert.match(onboardingVoiceContext({}, { ...INITIAL_ONBOARDING, moneySkipped: true }), /not confirmed figures/);
  assert.match(onboardingVoiceContext({}), /Not answered/);
});

test("completed onboarding routes to Today and new or incomplete accounts stay in onboarding", () => {
  assert.equal(onboardingRedirect(1700000000000), "/dashboard");
  assert.equal(onboardingRedirect(undefined), null);
  assert.equal(onboardingRedirect(0), null);
});

test("onboarding answers stay a draft until the hello is finished or skipped", async () => {
  const runOnboarding = (completeOnboarding as unknown as {
    _handler: (ctx: MutationCtx, args: FunctionArgs<typeof api.sproutjar.completeOnboarding>) => Promise<unknown>;
  })._handler;
  const previousKey = process.env.SPROUTJAR_SERVER_KEY;
  process.env.SPROUTJAR_SERVER_KEY = "test-server-key";
  try {
    const user: { _id: string; name: string; country: string; onboardedAt?: number; onboarding?: Record<string, string> } = {
      _id: "test-user", name: "Layla", country: "AE",
    };
    let failPatch = false;
    let missing = false;
    const ctx = { db: {
      query: () => ({ withIndex: () => ({ unique: async () => missing ? null : user }) }),
      patch: async (_id: string, fields: Record<string, unknown>) => {
        if (failPatch) throw new Error("Could not save");
        Object.assign(user, fields);
      },
      get: async () => user,
    } } as unknown as MutationCtx;
    const args = { caller: { serverKey: "test-server-key", userKey: "test-person" }, answers: { why: "want-plan" } };

    await runOnboarding(ctx, args);
    assert.deepEqual(user.onboarding, args.answers);
    assert.equal(user.onboardedAt, undefined);
    assert.equal(onboardingRedirect(user.onboardedAt), null);
    assert.ok(!user.onboardedAt, "dashboard must still send a draft account to onboarding");

    await runOnboarding(ctx, { ...args, answers: {}, complete: false });
    assert.deepEqual(user.onboarding, {});
    assert.equal(user.onboardedAt, undefined);

    failPatch = true;
    await assert.rejects(runOnboarding(ctx, { ...args, complete: true }), /Could not save/);
    assert.equal(user.onboardedAt, undefined);
    failPatch = false;

    await runOnboarding(ctx, { ...args, complete: true });
    assert.ok(user.onboardedAt);
    assert.equal(onboardingRedirect(user.onboardedAt), "/dashboard");
    const completedAt = user.onboardedAt;
    await runOnboarding(ctx, { ...args, complete: true });
    await runOnboarding(ctx, { ...args, complete: false });
    assert.equal(user.onboardedAt, completedAt, "retries and draft saves retain the completion time");

    await assert.rejects(runOnboarding(ctx, { ...args, caller: { ...args.caller, serverKey: "wrong" }, complete: true }), /Not from the Sproutjar server/);
    missing = true;
    await assert.rejects(runOnboarding(ctx, { ...args, complete: true }), /No Sproutjar profile/);
  } finally {
    if (previousKey === undefined) delete process.env.SPROUTJAR_SERVER_KEY;
    else process.env.SPROUTJAR_SERVER_KEY = previousKey;
  }
});

test("public deletion works without a session or a deletion request backend", () => {
  const html = renderToStaticMarkup(<PublicDeletionPage />);
  assert.match(html, /Delete my account/);
  assert.match(html, /href="\/sign-in\?redirect_url=%2Fdashboard%2Fyou"/);
  assert.ok(html.includes(`mailto:${SUPPORT_EMAIL}?subject=`));
  assert.match(html, /30 days on request/);
  assert.doesNotMatch(html, /<form|<input|email.*code|confirmation.*sent/i);
});

test("system screens have a way home, including for signed-in people", () => {
  const empty = renderToStaticMarkup(<SystemPage title="This page didn't grow." description="The link may be old. Your plan is safe." />);
  assert.match(empty, /href="\/"/);
  const error = renderToStaticMarkup(<SystemPage title="That was us, not you." description="Try again." homeHref="/dashboard"><button>Try again</button></SystemPage>);
  assert.match(error, /href="\/dashboard"/);
  assert.match(error, /<button>Try again<\/button>/);
});

test("page metadata includes a title, description and share image", () => {
  const metadata = pageMetadata("Today · Sproutjar");
  assert.equal(metadata.title, "Today · Sproutjar");
  assert.ok(metadata.description);
  assert.equal(metadata.openGraph?.title, metadata.title);
  assert.ok(metadata.openGraph?.images);
  assert.equal(pageMetadata("Help", "Support for Sproutjar").openGraph?.description, "Support for Sproutjar");
});

test("manifest and icons provide install sizes and a maskable safe zone", async () => {
  const data = manifest();
  assert.equal(data.display, "standalone");
  assert.equal(data.scope, "/");
  assert.equal(data.start_url, "/dashboard");
  assert.ok(data.icons?.some((icon) => icon.purpose === "maskable"));
  for (const icon of data.icons ?? []) {
    const png = await readFile(`public${icon.src}`);
    assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes);
  }
});

test("security headers keep the mic and required services available", async () => {
  const routes = await config.headers!();
  const headers = routes.find((route) => route.source === "/:path*")!.headers;
  const csp = headers.find((header) => header.key === "Content-Security-Policy-Report-Only")!.value;
  for (const host of ["clerk.sproutjar.app", "*.accounts.dev", "*.convex.cloud", "wss://*.convex.cloud", "wss://*.elevenlabs.io", "wss://*.livekit.cloud", "vercel.live"]) {
    assert.ok(csp.includes(host), host);
  }
  assert.ok(headers.some((header) => header.key === "X-Content-Type-Options" && header.value === "nosniff"));
  assert.ok(headers.some((header) => header.key === "X-Frame-Options" && header.value === "SAMEORIGIN"));
  assert.ok(headers.some((header) => header.key === "Permissions-Policy" && header.value.includes("microphone=(self)")));
});

type WorkerEvent = { request?: { url: string; method: string; mode: string }; waitUntil: (promise: Promise<unknown>) => void; respondWith: (response: Promise<Response>) => void };

async function worker(offline: Response | null = new Response("offline"), online = true) {
  const listeners: Record<string, (event: WorkerEvent) => void> = {};
  const added: string[] = [];
  const deleted: string[] = [];
  const network = new Response("network");
  let claimed = false;
  vm.runInNewContext(await readFile("public/sw.js", "utf8"), {
    URL, Response,
    self: {
      location: { origin: "https://www.sproutjar.app" },
      addEventListener: (name: string, listener: (event: WorkerEvent) => void) => { listeners[name] = listener; },
      skipWaiting() {},
      clients: { claim: () => { claimed = true; } },
    },
    fetch: async () => { if (!online) throw new Error("offline"); return network; },
    caches: {
      open: async () => ({ add: async (path: string) => { added.push(path); } }),
      keys: async () => ["sproutjar-offline-v0", "sproutjar-offline-v1", "another-app"],
      delete: async (key: string) => { deleted.push(key); },
      match: async () => offline,
    },
  });
  const dispatch = async (name: string, path = "/dashboard", method = "GET", mode = "navigate") => {
    let pending: Promise<unknown> = Promise.resolve();
    let response: Promise<Response> | undefined;
    listeners[name]({
      request: { url: new URL(path, "https://www.sproutjar.app").href, method, mode },
      waitUntil: (promise) => { pending = promise; },
      respondWith: (promise) => { response = promise; },
    });
    await pending;
    return response;
  };
  return { dispatch, added, deleted, network, claimed: () => claimed };
}

test("worker caches only the public offline page and removes only its old cache", async () => {
  const sw = await worker();
  await sw.dispatch("install");
  await sw.dispatch("activate");
  assert.deepEqual(sw.added, ["/offline.html"]);
  assert.deepEqual(sw.deleted, ["sproutjar-offline-v0"]);
  assert.ok(sw.claimed());
  assert.equal(await sw.dispatch("fetch"), sw.network);
  assert.deepEqual(sw.added, ["/offline.html"]);
});

test("worker does not intercept API, auth, demo, external or non-navigation requests", async () => {
  const sw = await worker();
  for (const path of ["/api/account", "/api/tools/payoff-plan", "/sign-in", "/sign-in/sso-callback", "/sign-up", "/onboarding", "/demo", "/demo/exit", "/__clerk", "/.well-known/clerk", "https://clerk.sproutjar.app/", "https://example.convex.cloud/"]) {
    assert.equal(await sw.dispatch("fetch", path), undefined, path);
  }
  assert.equal(await sw.dispatch("fetch", "/dashboard", "POST"), undefined);
  assert.equal(await sw.dispatch("fetch", "/dashboard", "GET", "cors"), undefined);
});

test("worker falls back on connection failure and handles an empty cache", async () => {
  const sw = await worker(new Response("Could not reach Sproutjar."), false);
  assert.equal(await (await sw.dispatch("fetch"))!.text(), "Could not reach Sproutjar.");
  const empty = await worker(null, false);
  assert.equal((await empty.dispatch("fetch"))?.type, "error");
  assert.equal((await empty.dispatch("fetch"))?.status, 0);
});
