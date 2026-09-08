/**
 * Reads the handful of figures a review needs off the text of a card
 * statement. Statements differ bank to bank, so every field is best-effort and
 * the person confirms each one before anything is saved. Nothing here talks to
 * a bank: live account linking (CBUAE open finance) needs a licensed provider
 * relationship this build does not have, so the statement is the honest source.
 */
export type StatementReading = {
  issuer: string | null;
  name: string | null;
  balance: number | null;
  minimumPayment: number | null;
  interestCharged: number | null;
  /** Purchases and cash advances in the period: the "new borrowing" line of a review. */
  newBorrowing: number | null;
  paymentsReceived: number | null;
  monthlyRatePct: number | null;
  dueDay: number | null;
  statementDay: number | null;
  /** Which fields were found, for the confirmation screen. */
  found: string[];
};

const ISSUERS = [
  "Emirates NBD",
  "ADCB",
  "RAKBANK",
  "FAB",
  "First Abu Dhabi Bank",
  "Mashreq",
  "Dubai Islamic Bank",
  "Emirates Islamic",
  "CBD",
  "Commercial Bank of Dubai",
  "HSBC",
  "Citi",
  "Standard Chartered",
  "QNB",
  "Qatar Islamic Bank",
  "QIB",
  "Commercial Bank of Qatar",
  "Doha Bank",
  "Tabby",
  "Postpay",
  "Tamara",
];

const MONEY = String.raw`(?:AED|QAR|SAR|KWD|BHD|OMR|USD|Dhs\.?|QR)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,3})?|[0-9]+(?:\.[0-9]{1,3})?)`;

function amountAfter(text: string, labels: string[]): number | null {
  for (const label of labels) {
    const re = new RegExp(`${label}[^0-9\\n]{0,40}${MONEY}`, "i");
    const match = text.match(re);
    if (match) {
      const value = Number(match[1].replace(/,/g, ""));
      if (Number.isFinite(value)) return value;
    }
  }
  return null;
}

const DATE = String.raw`(\d{1,2})[\s/\-.]+(?:(\d{1,2})|([A-Za-z]{3,9}))[\s/\-.,]+(\d{2,4})`;

function dayAfter(text: string, labels: string[]): number | null {
  for (const label of labels) {
    const match = text.match(new RegExp(`${label}[^0-9\\n]{0,40}${DATE}`, "i"));
    if (match) {
      const day = Number(match[1]);
      if (day >= 1 && day <= 31) return day;
    }
  }
  return null;
}

function rateNear(text: string): number | null {
  const match =
    text.match(/(?:monthly|per month|p\.?m\.?)[^0-9\n]{0,40}([0-9]{1,2}(?:\.[0-9]{1,3})?)\s*%/i) ??
    text.match(/([0-9]{1,2}(?:\.[0-9]{1,3})?)\s*%\s*(?:per month|monthly|p\.?m\.?)/i);
  if (!match) return null;
  const value = Number(match[1]);
  return value > 0 && value < 10 ? value : null;
}

export function readStatement(raw: string): StatementReading {
  const text = raw.replace(/\u00a0/g, " ");
  const issuer = ISSUERS.find((i) => new RegExp(`\\b${i}\\b`, "i").test(text)) ?? null;
  const nameMatch = text.match(/\b(Platinum|Titanium|Signature|Infinite|World|Gold|Classic|Traveller|Cashback|Skywards|Touchpoints)\b[^\n]{0,20}?\bCard\b/i);

  const reading: StatementReading = {
    issuer,
    name: nameMatch ? `${issuer ?? ""} ${nameMatch[1]}`.trim() : issuer,
    balance: amountAfter(text, [
      "Total Amount Due",
      "Total Outstanding",
      "Outstanding Balance",
      "Closing Balance",
      "New Balance",
      "Statement Balance",
      "Current Balance",
      "Balance Due",
    ]),
    minimumPayment: amountAfter(text, ["Minimum Amount Due", "Minimum Payment", "Minimum Due", "Min\\.? Due"]),
    interestCharged: amountAfter(text, [
      "Finance Charges?",
      "Interest Charged",
      "Interest Charges?",
      "Retail Interest",
      "Profit Charged",
      "Profit Amount",
      "Total Interest",
    ]),
    newBorrowing: amountAfter(text, [
      "New Purchases",
      "Purchases (?:and|&) (?:Cash )?Advances",
      "Total Purchases",
      "Retail Purchases",
      "New Transactions",
      "Debits",
    ]),
    paymentsReceived: amountAfter(text, ["Payments? Received", "Payments? (?:and|&) Credits", "Total Payments?", "Credits"]),
    monthlyRatePct: rateNear(text),
    dueDay: dayAfter(text, ["Payment Due Date", "Due Date", "Pay By", "Due On"]),
    statementDay: dayAfter(text, ["Statement Date", "Statement Period[^\\n]{0,30}?to", "Closing Date", "Statement Closing"]),
    found: [],
  };

  reading.found = (Object.keys(reading) as (keyof StatementReading)[]).filter(
    (key) => key !== "found" && reading[key] !== null,
  );
  return reading;
}
