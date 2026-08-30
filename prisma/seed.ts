import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const OFFERS = [
  { country: "AE", bank: "Emirates NBD", product: "Balance Transfer 12M", promoMonthlyRate: 0.0042, promoMonths: 12, standardMonthlyRate: 0.0329, transferFeePct: 1.5, isIslamic: false, notes: "Minimum transfer AED 3,000. Rate reverts to standard on any unpaid balance after the promo window." },
  { country: "AE", bank: "ADCB", product: "0% Balance Transfer 6M", promoMonthlyRate: 0, promoMonths: 6, standardMonthlyRate: 0.0325, transferFeePct: 2.0, isIslamic: false, notes: "Zero percent for six months, 2% upfront fee taken from the transferred amount." },
  { country: "AE", bank: "RAKBANK", product: "Balance Conversion Plan", promoMonthlyRate: 0.0079, promoMonths: 12, standardMonthlyRate: 0.0349, transferFeePct: 1.0, isIslamic: false, notes: "Fixed monthly instalment plan. Early settlement fee applies." },
  { country: "AE", bank: "FAB", product: "Balance Transfer 12M", promoMonthlyRate: 0.0058, promoMonths: 12, standardMonthlyRate: 0.0325, transferFeePct: 1.5, isIslamic: false, notes: "Available on FAB credit cards only." },
  { country: "AE", bank: "Dubai Islamic Bank", product: "Sharia Balance Transfer", promoMonthlyRate: 0.005, promoMonths: 12, standardMonthlyRate: 0.0299, transferFeePct: 1.5, isIslamic: true, notes: "Profit rate, not interest. Structured as a Murabaha instalment plan." },
  { country: "QA", bank: "QNB", product: "Balance Transfer 6M", promoMonthlyRate: 0.0033, promoMonths: 6, standardMonthlyRate: 0.0125, transferFeePct: 1.0, isIslamic: false, notes: "Qatar Central Bank caps credit card rates at 1.25% per month." },
  { country: "QA", bank: "Doha Bank", product: "Easy Payment Transfer", promoMonthlyRate: 0.0042, promoMonths: 12, standardMonthlyRate: 0.0125, transferFeePct: 1.0, isIslamic: false, notes: "Fixed instalments over twelve months." },
  { country: "QA", bank: "Commercial Bank", product: "Balance Transfer 12M", promoMonthlyRate: 0.005, promoMonths: 12, standardMonthlyRate: 0.0125, transferFeePct: 1.25, isIslamic: false, notes: "Transfer must be at least QAR 2,000." },
  { country: "SA", bank: "Al Rajhi Bank", product: "Tayseer Transfer", promoMonthlyRate: 0.0058, promoMonths: 12, standardMonthlyRate: 0.0275, transferFeePct: 1.0, isIslamic: true, notes: "Profit rate. SAMA rules cap total cost of borrowing." },
  { country: "SA", bank: "SNB", product: "Balance Transfer 12M", promoMonthlyRate: 0.0067, promoMonths: 12, standardMonthlyRate: 0.0285, transferFeePct: 1.5, isIslamic: true, notes: "Sharia compliant instalment structure." },
  { country: "KW", bank: "NBK", product: "Balance Transfer 12M", promoMonthlyRate: 0.0025, promoMonths: 12, standardMonthlyRate: 0.0125, transferFeePct: 1.0, isIslamic: false, notes: "Central Bank of Kuwait caps consumer lending rates." },
  { country: "BH", bank: "Bank of Bahrain and Kuwait", product: "Balance Transfer 12M", promoMonthlyRate: 0.0042, promoMonths: 12, standardMonthlyRate: 0.0175, transferFeePct: 1.0, isIslamic: false, notes: "Transfer fee waived above BHD 1,000." },
  { country: "OM", bank: "Bank Muscat", product: "Balance Transfer 12M", promoMonthlyRate: 0.005, promoMonths: 12, standardMonthlyRate: 0.02, transferFeePct: 1.0, isIslamic: false, notes: "Requires salary transfer to Bank Muscat." },
];

const FACTS = [
  { country: "AE", bureau: "Al Etihad Credit Bureau", regulator: "Central Bank of the UAE", dbrCapPct: 50, minPaymentPct: 5, notes: "Total monthly debt repayments are capped at 50% of income. Credit card minimum is typically 5% of the outstanding balance." },
  { country: "QA", bureau: "Qatar Credit Bureau", regulator: "Qatar Central Bank", dbrCapPct: 75, minPaymentPct: 5, notes: "Debt burden ratio cap is 75% for nationals and 50% for expatriates. Card rates are capped at 1.25% per month." },
  { country: "SA", bureau: "SIMAH", regulator: "SAMA", dbrCapPct: 45, minPaymentPct: 5, notes: "SAMA caps deductions at 33% of salary, rising to 45% where a mortgage is involved." },
  { country: "KW", bureau: "Ci-Net", regulator: "Central Bank of Kuwait", dbrCapPct: 40, minPaymentPct: 5, notes: "Instalments are capped at 40% of net salary, 30% for retirees." },
  { country: "BH", bureau: "BENEFIT Credit Reference Bureau", regulator: "Central Bank of Bahrain", dbrCapPct: 50, minPaymentPct: 5, notes: "Total repayments are capped at 50% of net income." },
  { country: "OM", bureau: "Mala'a", regulator: "Central Bank of Oman", dbrCapPct: 50, minPaymentPct: 5, notes: "Personal loan instalments are capped at 50% of salary, 60% including housing finance." },
];

async function main() {
  for (const offer of OFFERS) {
    await prisma.bankOffer.upsert({
      where: { bank_product: { bank: offer.bank, product: offer.product } },
      update: offer,
      create: offer,
    });
  }

  for (const fact of FACTS) {
    await prisma.creditFact.upsert({
      where: { country: fact.country },
      update: fact,
      create: fact,
    });
  }

  const user = await prisma.user.upsert({
    where: { email: "demo@sproutjar.app" },
    update: { weeksActive: 11 },
    create: {
      name: "Layla",
      email: "demo@sproutjar.app",
      country: "AE",
      monthlyIncome: 18000,
      monthlyEssentials: 11500,
      strategy: "snowball",
      weeksActive: 11,
      upbringing:
        "Nobody talked about it. My father handled everything and my mother found out what we could afford by being told no.",
      moneyPurpose: "Not having to ask anyone for anything. That's it, really.",
      goodDecision:
        "I paid off my sister's tuition instalment before mine. Nobody asked me to and I'd do it again.",
    },
  });

  const existingDebts = await prisma.debt.count({ where: { userId: user.id } });
  if (existingDebts === 0) {
    // Eleven weeks of history. Opening balances are what the plant grows against.
    const seededDebts = [
      { name: "Emirates NBD Platinum", issuer: "Emirates NBD", openingBalance: 29500, balance: 12400, monthlyRate: 0.0329, minimumPayment: 620 },
      { name: "ADCB Traveller", issuer: "ADCB", openingBalance: 11000, balance: 4800, monthlyRate: 0.0325, minimumPayment: 240 },
      { name: "RAKBANK Titanium", issuer: "RAKBANK", openingBalance: 52000, balance: 21900, monthlyRate: 0.0349, minimumPayment: 1095 },
    ];

    for (const seeded of seededDebts) {
      const debt = await prisma.debt.create({ data: { ...seeded, userId: user.id } });
      const step = (seeded.openingBalance - seeded.balance) / 11;
      for (let week = 1; week <= 11; week += 1) {
        const balance = Math.round(seeded.openingBalance - step * week);
        const interest = Math.round(balance * seeded.monthlyRate * 0.25);
        await prisma.balanceEntry.create({
          data: {
            userId: user.id,
            debtId: debt.id,
            balance,
            amountPaid: Math.round(step + interest),
            principalCleared: Math.round(step),
            interestCharged: interest,
            loggedAt: new Date(Date.now() - (11 - week) * 7 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }

  const existingJars = await prisma.jar.count({ where: { userId: user.id } });
  if (existingJars === 0) {
    await prisma.jar.createMany({
      data: [
        { userId: user.id, name: "One month buffer", purpose: "emergency", target: 11500, saved: 2300 },
        { userId: user.id, name: "Eid gifts, on purpose", purpose: "planned", target: 2000, saved: 750 },
      ],
    });
  }

  const existingBeliefs = await prisma.belief.count({ where: { userId: user.id } });
  if (existingBeliefs === 0) {
    await prisma.belief.createMany({
      data: [
        {
          userId: user.id,
          text: "If I can't do it properly there's no point starting.",
          namedOn: new Date(Date.now() - 52 * 24 * 60 * 60 * 1000),
        },
        {
          userId: user.id,
          text: "Saying no to my family costs more than the money does.",
          namedOn: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
        },
      ],
    });
  }

  const existingSessions = await prisma.coachSession.count({ where: { userId: user.id } });
  if (existingSessions === 0) {
    const history = [
      { agenda: "Where this actually stands", technique: "Reality before resources", plannedMinutes: 20, contractChoice: "clarity", daysAgo: 74, commitment: "Write down all three balances on Sunday morning", trigger: "Sunday, before anyone else is up", status: "kept" },
      { agenda: "The last plan that didn't stick", technique: "Past-success and exception questions", plannedMinutes: 20, contractChoice: "clarity", daysAgo: 60, commitment: "Move the RAKBANK card out of my wallet", trigger: "Tonight, when I get home", status: "kept" },
      { agenda: "What you'd be uncomfortable for", technique: "Values clarification", plannedMinutes: 40, contractChoice: "space", daysAgo: 45, commitment: "", trigger: "", status: "" },
      { agenda: "The months this didn't happen", technique: "Solution-focused exceptions", plannedMinutes: 10, contractChoice: "decision", daysAgo: 31, commitment: "Pay ADCB the day salary lands, before anything else", trigger: "The 25th, from the bank app", status: "kept" },
      { agenda: "Payday to week three", technique: "Behaviour chain analysis", plannedMinutes: 15, contractChoice: "plan", daysAgo: 17, commitment: "Leave the grocery run to Thursday, not the day after payday", trigger: "Thursday evening", status: "missed" },
      { agenda: "Who else could carry some of this", technique: "Resource activation", plannedMinutes: 20, contractChoice: "plan", daysAgo: 6, commitment: "Ask Emirates NBD in writing what a reduced plan would look like", trigger: "Tuesday lunch break", status: "open" },
    ];

    for (const item of history) {
      const startedAt = new Date(Date.now() - item.daysAgo * 24 * 60 * 60 * 1000);
      const session = await prisma.coachSession.create({
        data: {
          userId: user.id,
          agenda: item.agenda,
          agendaReason: "",
          technique: item.technique,
          plannedMinutes: item.plannedMinutes,
          contractChoice: item.contractChoice,
          startedAt,
          endedAt: new Date(startedAt.getTime() + item.plannedMinutes * 60 * 1000),
        },
      });
      if (item.commitment) {
        await prisma.commitment.create({
          data: {
            userId: user.id,
            sessionId: session.id,
            wish: item.commitment,
            trigger: item.trigger,
            ownershipConfirmed: true,
            status: item.status,
            createdAt: startedAt,
            dueAt: new Date(startedAt.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
