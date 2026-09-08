import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

/**
 * Lays Layla's thirty-two weeks into a Convex deployment: three cards with
 * real movement behind them (one March bonus, one grocery slip), two jars,
 * two beliefs she named out loud, seven sessions and the commitments that
 * came out of them, and the payday review she did last month. Idempotent.
 *
 * Run against the dev deployment only; production keeps whatever it holds.
 */
const url = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set.");

const convex = new ConvexHttpClient(url);

/** 18,000 − 7,200 − 1,800 − 2,000 − 500 = 6,500 a month for the cards. */
const profile = {
  monthlyIncome: 18000,
  monthlyEssentials: 7200,
  payday: 25,
  priorityObligations: 1800,
  remittances: 2000,
  sinkingFunds: 500,
  debtAttack: 6500,
  debtAttackSource: "derived",
  windfallRule: "Anything that isn't salary goes to the card I'm working on, the day it lands.",
  reviewCadence: "payday",
};

// Opening 87,645 → today 39,100: 48,545 cleared, of which 15,000 was the March
// bonus sent straight to RAKBANK under the windfall rule.
const debts = [
  {
    name: "Emirates NBD Platinum",
    issuer: "Emirates NBD",
    kind: "credit_card",
    openingBalance: 26500,
    balance: 12400,
    monthlyRate: 0.0329,
    minimumPayment: 620,
    dueDay: 10,
    statementDay: 18,
    isIslamic: false,
    // The grocery run the week the Thursday commitment slipped.
    events: [{ week: 30, newBorrowing: 640 }],
  },
  {
    name: "ADCB Traveller",
    issuer: "ADCB",
    kind: "credit_card",
    openingBalance: 9845,
    balance: 4800,
    monthlyRate: 0.0325,
    minimumPayment: 240,
    dueDay: 5,
    statementDay: 12,
    isIslamic: false,
    estimatedFields: "rate",
    events: [],
  },
  {
    name: "RAKBANK Titanium",
    issuer: "RAKBANK",
    kind: "credit_card",
    openingBalance: 51300,
    balance: 21900,
    monthlyRate: 0.0349,
    minimumPayment: 1095,
    dueDay: 27,
    statementDay: 3,
    isIslamic: false,
    events: [{ week: 8, principal: 15000 }],
  },
];

const jars = [
  { name: "Starter reserve", purpose: "emergency", target: 3000, saved: 2300 },
  { name: "Eid gifts, on purpose", purpose: "planned", target: 2000, saved: 750 },
];

const beliefs = [
  { text: "If I can't do it properly there's no point starting.", daysAgo: 52 },
  { text: "Saying no to my family costs more than the money does.", daysAgo: 19 },
];

const sessions = [
  { agenda: "Where this actually stands", agendaReason: "", technique: "Reality before resources", plannedMinutes: 20, contractChoice: "clarity", daysAgo: 222 },
  { agenda: "The last plan that didn't stick", agendaReason: "", technique: "Past-success and exception questions", plannedMinutes: 20, contractChoice: "clarity", daysAgo: 205 },
  { agenda: "What you'd be uncomfortable for", agendaReason: "", technique: "Values clarification", plannedMinutes: 40, contractChoice: "space", daysAgo: 186 },
  { agenda: "What the bonus is for", agendaReason: "A one-off is coming. Deciding now is easier than deciding with it in the account.", technique: "Deciding before it arrives", plannedMinutes: 10, contractChoice: "decision", daysAgo: 172 },
  { agenda: "The months this didn't happen", agendaReason: "", technique: "Solution-focused exceptions", plannedMinutes: 10, contractChoice: "decision", daysAgo: 120 },
  { agenda: "Payday to week three", agendaReason: "", technique: "Behaviour chain analysis", plannedMinutes: 20, contractChoice: "plan", daysAgo: 17 },
  { agenda: "Who else could carry some of this", agendaReason: "", technique: "Resource activation", plannedMinutes: 20, contractChoice: "plan", mode: "text", daysAgo: 6 },
];

const commitments = [
  { wish: "Write down all three balances on Sunday morning", trigger: "Sunday, before anyone else is up", status: "kept", daysAgo: 222, sessionIndex: 0 },
  { wish: "Move the RAKBANK card out of my wallet", trigger: "Tonight, when I get home", status: "kept", daysAgo: 205, sessionIndex: 1 },
  { wish: "Send the whole bonus to RAKBANK the day it lands", trigger: "The 19th, before I tell anyone it came", status: "kept", daysAgo: 172, sessionIndex: 3 },
  { wish: "Pay ADCB the day salary lands, before anything else", trigger: "The 25th, from the bank app", status: "kept", daysAgo: 120, sessionIndex: 4 },
  { wish: "Leave the grocery run to Thursday, not the day after payday", trigger: "Thursday evening", status: "missed", daysAgo: 17, sessionIndex: 5 },
  { wish: "Ask Emirates NBD in writing what a reduced plan would look like", trigger: "Tuesday lunch break", status: "open", daysAgo: 6, sessionIndex: 6 },
];

/** Last payday's review: the four weeks before the 25th, including the grocery slip. */
const review = {
  fromWeek: 26,
  toWeek: 30,
  reflection:
    "The grocery run went on the Emirates NBD card again. Six hundred and forty. I knew on the Friday and didn't write it down until today.",
  daysAgo: 11,
};

async function main() {
  const result = await convex.mutation(api.sproutjar.seed, {
    profile,
    debts,
    jars,
    beliefs,
    sessions,
    commitments,
    review,
  });
  console.log("Seeded Convex:", result.userId);
}

main();
