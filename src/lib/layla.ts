/** Layla is invented demo data from prototype/data.js. */
const profile = {
  monthlyIncome: 18000,
  monthlyEssentials: 8000,
  payday: 25,
  priorityObligations: 1500,
  remittances: 2000,
  sinkingFunds: 0,
  debtAttack: 6500,
  debtAttackSource: "derived",
  windfallRule: "A bonus or a refund goes to the card I am working on, the day it lands.",
  reviewCadence: "payday",
  strategy: "avalanche",
};

const debts = [
  { name: "ADCB Traveller", issuer: "ADCB", kind: "credit_card", openingBalance: 11000, balance: 4800, monthlyRate: 0.0325, minimumPayment: 240, dueDay: 28, statementDay: 3, isIslamic: false, estimatedFields: "rate", events: [] },
  { name: "Emirates NBD Platinum", issuer: "Emirates NBD", kind: "credit_card", openingBalance: 29500, balance: 12400, monthlyRate: 0.0329, minimumPayment: 620, dueDay: 10, statementDay: 16, isIslamic: false, events: [] },
  { name: "FAB Titanium", issuer: "FAB", kind: "credit_card", openingBalance: 52000, balance: 21900, monthlyRate: 0.0349, minimumPayment: 1095, dueDay: 21, statementDay: 27, isIslamic: false, events: [] },
];

const jars = [
  { name: "One month buffer", purpose: "emergency", target: 11500, saved: 2300 },
  { name: "Eid gifts on purpose", purpose: "planned", target: 2000, saved: 750 },
];

const beliefs = [
  { text: "If I can't do it properly there's no point starting.", daysAgo: 68 },
  { text: "Saying no to my family costs more than the money does.", daysAgo: 12 },
  { text: "I make a plan and it fades after a week or two.", daysAgo: 40 },
  { text: "When money comes up, I go quiet and deal with it later.", daysAgo: 82 },
];

const sessions = [
  { agenda: "Where this actually stands", agendaReason: "", technique: "Getting clear", plannedMinutes: 20, contractChoice: "clarity", daysAgo: 82, balanceAtStart: 87645 },
  { agenda: "The last plan that didn't stick", agendaReason: "", technique: "Looking back", plannedMinutes: 20, contractChoice: "clarity", daysAgo: 68, balanceAtStart: 78900 },
  { agenda: "What you'd be uncomfortable for", agendaReason: "", technique: "What matters to you", plannedMinutes: 40, contractChoice: "space", daysAgo: 54, balanceAtStart: 70200 },
  { agenda: "The months this didn't happen", agendaReason: "", technique: "What works", plannedMinutes: 10, contractChoice: "decision", daysAgo: 40, balanceAtStart: 61000 },
  { agenda: "Payday to week three", agendaReason: "", technique: "Working out what happened", plannedMinutes: 20, contractChoice: "plan", daysAgo: 26, balanceAtStart: 50300 },
  { agenda: "Who else could carry some of this", agendaReason: "", technique: "Finding support", plannedMinutes: 20, contractChoice: "plan", mode: "text", daysAgo: 12, balanceAtStart: 44200 },
];

const commitments = [
  { wish: "Write down all three balances on Sunday morning", trigger: "Sunday, before anyone else is up", status: "kept", daysAgo: 82, sessionIndex: 0 },
  { wish: "Move the FAB card out of my wallet", trigger: "Tonight, when I get home", status: "kept", daysAgo: 68, sessionIndex: 1 },
  { wish: "Pay ADCB the day salary lands, before anything else", trigger: "The 25th, from the bank app", status: "kept", daysAgo: 40, sessionIndex: 3 },
  { wish: "Leave the grocery run to Thursday, not the day after payday", trigger: "Thursday evening", status: "missed", daysAgo: 26, sessionIndex: 4 },
  { wish: "Ask Emirates NBD in writing what a reduced plan would look like", trigger: "Friday evening", status: "open", daysAgo: 12, sessionIndex: 5 },
];

/** Last payday's review: the four weeks before the 25th, including the grocery slip. */
const review = {
  fromWeek: 6,
  toWeek: 10,
  reflection:
    "The grocery run went on the Emirates NBD card again. Six hundred and forty. I knew on the Friday and didn't write it down until today.",
  daysAgo: 11,
};

export const LAYLA_SEED = { profile, debts, jars, beliefs, sessions, commitments, review };
