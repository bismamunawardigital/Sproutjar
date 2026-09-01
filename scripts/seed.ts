import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

/**
 * Lays Layla's eleven weeks into the live Convex deployment: three cards with
 * real movement behind them, two jars, two beliefs she named out loud, six
 * sessions and the commitments that came out of them. Idempotent.
 */
const url = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set.");

const convex = new ConvexHttpClient(url);

const debts = [
  { name: "Emirates NBD Platinum", issuer: "Emirates NBD", openingBalance: 29500, balance: 12400, monthlyRate: 0.0329, minimumPayment: 620, isIslamic: false, isEstimated: false },
  { name: "ADCB Traveller", issuer: "ADCB", openingBalance: 11000, balance: 4800, monthlyRate: 0.0325, minimumPayment: 240, isIslamic: false, isEstimated: true },
  { name: "RAKBANK Titanium", issuer: "RAKBANK", openingBalance: 52000, balance: 21900, monthlyRate: 0.0349, minimumPayment: 1095, isIslamic: false, isEstimated: false },
];

const jars = [
  { name: "One month buffer", purpose: "emergency", target: 11500, saved: 2300 },
  { name: "Eid gifts, on purpose", purpose: "planned", target: 2000, saved: 750 },
];

const beliefs = [
  { text: "If I can't do it properly there's no point starting.", daysAgo: 52 },
  { text: "Saying no to my family costs more than the money does.", daysAgo: 19 },
];

const sessions = [
  { agenda: "Where this actually stands", agendaReason: "", technique: "Reality before resources", plannedMinutes: 20, contractChoice: "clarity", daysAgo: 74 },
  { agenda: "The last plan that didn't stick", agendaReason: "", technique: "Past-success and exception questions", plannedMinutes: 20, contractChoice: "clarity", daysAgo: 60 },
  { agenda: "What you'd be uncomfortable for", agendaReason: "", technique: "Values clarification", plannedMinutes: 40, contractChoice: "space", daysAgo: 45 },
  { agenda: "The months this didn't happen", agendaReason: "", technique: "Solution-focused exceptions", plannedMinutes: 10, contractChoice: "decision", daysAgo: 31 },
  { agenda: "Payday to week three", agendaReason: "", technique: "Behaviour chain analysis", plannedMinutes: 20, contractChoice: "plan", daysAgo: 17 },
  { agenda: "Who else could carry some of this", agendaReason: "", technique: "Resource activation", plannedMinutes: 20, contractChoice: "plan", daysAgo: 6 },
];

const commitments = [
  { wish: "Write down all three balances on Sunday morning", trigger: "Sunday, before anyone else is up", status: "kept", daysAgo: 74, sessionIndex: 0 },
  { wish: "Move the RAKBANK card out of my wallet", trigger: "Tonight, when I get home", status: "kept", daysAgo: 60, sessionIndex: 1 },
  { wish: "Pay ADCB the day salary lands, before anything else", trigger: "The 25th, from the bank app", status: "kept", daysAgo: 31, sessionIndex: 3 },
  { wish: "Leave the grocery run to Thursday, not the day after payday", trigger: "Thursday evening", status: "missed", daysAgo: 17, sessionIndex: 4 },
  { wish: "Ask Emirates NBD in writing what a reduced plan would look like", trigger: "Tuesday lunch break", status: "open", daysAgo: 6, sessionIndex: 5 },
];

async function main() {
  const result = await convex.mutation(api.sproutjar.seed, {
    debts,
    jars,
    beliefs,
    sessions,
    commitments,
  });
  console.log("Seeded Convex:", result.userId);
}

main();
