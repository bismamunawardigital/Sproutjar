import { NextResponse } from "next/server";
import { assertToolKey } from "@/lib/tool-auth";
import { COUNTRIES, countryProfile, type CountryCode } from "@/lib/money";
import { FACTS } from "@/lib/reference";

export const dynamic = "force-dynamic";

const ALIASES: Record<string, CountryCode> = {
  uae: "AE",
  "united arab emirates": "AE",
  dubai: "AE",
  "abu dhabi": "AE",
  sharjah: "AE",
  emirates: "AE",
  aed: "AE",
  dirhams: "AE",
  qatar: "QA",
  doha: "QA",
  qar: "QA",
  "saudi arabia": "SA",
  saudi: "SA",
  ksa: "SA",
  riyadh: "SA",
  jeddah: "SA",
  sar: "SA",
  kuwait: "KW",
  kwd: "KW",
  bahrain: "BH",
  manama: "BH",
  bhd: "BH",
  oman: "OM",
  muscat: "OM",
  omr: "OM",
};

function resolveCountry(raw: string): CountryCode | null {
  const key = raw.trim().toLowerCase();
  if (!key) return null;
  if (key.toUpperCase() in COUNTRIES) return key.toUpperCase() as CountryCode;
  return ALIASES[key] ?? null;
}

export async function GET(request: Request) {
  const denied = assertToolKey(request);
  if (denied) return denied;

  const raw = new URL(request.url).searchParams.get("country") ?? "";
  const code = resolveCountry(raw);
  if (!code) {
    return NextResponse.json(
      {
        error: `Could not resolve "${raw}" to a supported country.`,
        supported: Object.values(COUNTRIES).map((c) => c.name),
      },
      { status: 400 },
    );
  }

  const profile = countryProfile(code);
  const fact = FACTS.find((f) => f.country === code);

  return NextResponse.json({
    country: profile.name,
    currency: profile.currency,
    currency_spoken: profile.currencyWord,
    credit_bureau: fact?.bureau ?? profile.bureau,
    regulator: fact?.regulator ?? profile.regulator,
    debt_burden_ratio_cap_pct: fact?.dbrCapPct ?? profile.dbrCapPct,
    typical_minimum_payment_pct: fact?.minPaymentPct ?? 5,
    notes: fact?.notes ?? "",
  });
}
