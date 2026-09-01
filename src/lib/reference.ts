/**
 * Static market reference: published GCC card offers and regulator facts. This
 * never changes per user, so it lives in the codebase rather than the database.
 */
export type BankOffer = {
  country: string;
  bank: string;
  product: string;
  promoMonthlyRate: number;
  promoMonths: number;
  standardMonthlyRate: number;
  transferFeePct: number;
  isIslamic: boolean;
  notes: string;
};

export type CreditFact = {
  country: string;
  bureau: string;
  regulator: string;
  dbrCapPct: number;
  minPaymentPct: number;
  notes: string;
};

export const OFFERS: BankOffer[] = [
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

export const FACTS: CreditFact[] = [
  { country: "AE", bureau: "Al Etihad Credit Bureau", regulator: "Central Bank of the UAE", dbrCapPct: 50, minPaymentPct: 5, notes: "Total monthly debt repayments are capped at 50% of income. Credit card minimum is typically 5% of the outstanding balance." },
  { country: "QA", bureau: "Qatar Credit Bureau", regulator: "Qatar Central Bank", dbrCapPct: 75, minPaymentPct: 5, notes: "Debt burden ratio cap is 75% for nationals and 50% for expatriates. Card rates are capped at 1.25% per month." },
  { country: "SA", bureau: "SIMAH", regulator: "SAMA", dbrCapPct: 45, minPaymentPct: 5, notes: "SAMA caps deductions at 33% of salary, rising to 45% where a mortgage is involved." },
  { country: "KW", bureau: "Ci-Net", regulator: "Central Bank of Kuwait", dbrCapPct: 40, minPaymentPct: 5, notes: "Instalments are capped at 40% of net salary, 30% for retirees." },
  { country: "BH", bureau: "BENEFIT Credit Reference Bureau", regulator: "Central Bank of Bahrain", dbrCapPct: 50, minPaymentPct: 5, notes: "Total repayments are capped at 50% of net income." },
  { country: "OM", bureau: "Mala'a", regulator: "Central Bank of Oman", dbrCapPct: 50, minPaymentPct: 5, notes: "Personal loan instalments are capped at 50% of salary, 60% including housing finance." },
];
