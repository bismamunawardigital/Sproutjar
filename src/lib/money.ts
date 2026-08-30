export type CountryCode = "AE" | "QA" | "SA" | "KW" | "BH" | "OM";

export type CountryProfile = {
  code: CountryCode;
  name: string;
  currency: string;
  currencyWord: string;
  bureau: string;
  regulator: string;
  /** Regulatory cap on the share of income that may go to debt repayment. */
  dbrCapPct: number;
};

export const COUNTRIES: Record<CountryCode, CountryProfile> = {
  AE: {
    code: "AE",
    name: "United Arab Emirates",
    currency: "AED",
    currencyWord: "dirhams",
    bureau: "Al Etihad Credit Bureau",
    regulator: "Central Bank of the UAE",
    dbrCapPct: 50,
  },
  QA: {
    code: "QA",
    name: "Qatar",
    currency: "QAR",
    currencyWord: "riyals",
    bureau: "Qatar Credit Bureau",
    regulator: "Qatar Central Bank",
    dbrCapPct: 75,
  },
  SA: {
    code: "SA",
    name: "Saudi Arabia",
    currency: "SAR",
    currencyWord: "riyals",
    bureau: "SIMAH",
    regulator: "SAMA",
    dbrCapPct: 45,
  },
  KW: {
    code: "KW",
    name: "Kuwait",
    currency: "KWD",
    currencyWord: "dinars",
    bureau: "Ci-Net",
    regulator: "Central Bank of Kuwait",
    dbrCapPct: 40,
  },
  BH: {
    code: "BH",
    name: "Bahrain",
    currency: "BHD",
    currencyWord: "dinars",
    bureau: "BENEFIT Credit Reference Bureau",
    regulator: "Central Bank of Bahrain",
    dbrCapPct: 50,
  },
  OM: {
    code: "OM",
    name: "Oman",
    currency: "OMR",
    currencyWord: "rials",
    bureau: "Mala'a",
    regulator: "Central Bank of Oman",
    dbrCapPct: 50,
  },
};

export function countryProfile(code: string): CountryProfile {
  return COUNTRIES[(code as CountryCode) in COUNTRIES ? (code as CountryCode) : "AE"];
}

/** Currencies worth far more per unit are quoted with three decimals locally. */
const THREE_DECIMAL = new Set(["KWD", "BHD", "OMR"]);

/** Exact figures always carry their decimals: AED 14,900.00. */
export function formatMoney(amount: number, currency: string): string {
  const digits = THREE_DECIMAL.has(currency) ? 3 : 2;
  return `${currency} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

/** For headline figures where the decimals are noise. */
export function formatMoneyShort(amount: number, currency: string): string {
  return `${currency} ${Math.round(amount).toLocaleString("en-US")}`;
}

/**
 * A monthly rate never appears without its annual equivalent. Quoting the
 * monthly figure alone is the comprehension failure the product exists to fix.
 */
export function formatRate(monthlyRate: number): string {
  const monthly = (monthlyRate * 100).toFixed(2);
  const annual = ((Math.pow(1 + monthlyRate, 12) - 1) * 100).toFixed(2);
  return `${monthly}% monthly · ${annual}% a year`;
}

/** Rounds the way a coach speaks a number out loud. */
export function speakableAmount(amount: number, currency: string): string {
  const profile = Object.values(COUNTRIES).find((c) => c.currency === currency);
  const word = profile?.currencyWord ?? currency;
  const rounded = THREE_DECIMAL.has(currency)
    ? Math.round(amount * 10) / 10
    : Math.round(amount / 10) * 10;
  return `about ${rounded.toLocaleString("en-US")} ${word}`;
}
