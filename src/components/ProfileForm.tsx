"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { debtAttackFor } from "@/lib/cash-flow";
import { COUNTRIES } from "@/lib/money";

type Fields = {
  name: string;
  country: string;
  monthlyIncome: string;
  monthlyEssentials: string;
  payday: string;
  priorityObligations: string;
  remittances: string;
  sinkingFunds: string;
  debtAttackSource: "derived" | "chosen";
  debtAttack: string;
  windfallRule: string;
  reviewCadence: "payday" | "weekly";
  strategy: "snowball" | "avalanche";
  moneyPurpose: string;
  goodDecision: string;
  upbringing: string;
};

const field =
  "mt-1 w-full rounded-sm border border-rule bg-cream px-3 py-2 text-[15px] text-ink-800 outline-none focus:border-stem";
const label = "block text-[12px] font-bold text-ink-500";

function num(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/**
 * Everything Ren works from, in the person's hands. The monthly amount is
 * derived line by line, and can be overridden; the label always says which
 * figure the plan is running on.
 */
export function ProfileForm({
  initial,
  currency,
}: {
  initial: {
    name: string;
    country: string;
    monthlyIncome: number;
    monthlyEssentials: number;
    payday?: number;
    priorityObligations?: number;
    remittances?: number;
    sinkingFunds?: number;
    debtAttack?: number;
    debtAttackSource?: string;
    windfallRule?: string;
    reviewCadence?: string;
    strategy: string;
    moneyPurpose?: string;
    goodDecision?: string;
    upbringing?: string;
  };
  currency: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Fields>({
    name: initial.name,
    country: initial.country,
    monthlyIncome: String(initial.monthlyIncome),
    monthlyEssentials: String(initial.monthlyEssentials),
    payday: initial.payday ? String(initial.payday) : "",
    priorityObligations: initial.priorityObligations ? String(initial.priorityObligations) : "",
    remittances: initial.remittances ? String(initial.remittances) : "",
    sinkingFunds: initial.sinkingFunds ? String(initial.sinkingFunds) : "",
    debtAttackSource: initial.debtAttackSource === "chosen" ? "chosen" : "derived",
    debtAttack: initial.debtAttack ? String(initial.debtAttack) : "",
    windfallRule: initial.windfallRule ?? "",
    reviewCadence: initial.reviewCadence === "weekly" ? "weekly" : "payday",
    strategy: initial.strategy === "avalanche" ? "avalanche" : "snowball",
    moneyPurpose: initial.moneyPurpose ?? "",
    goodDecision: initial.goodDecision ?? "",
    upbringing: initial.upbringing ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const attack = debtAttackFor({
    monthlyIncome: num(form.monthlyIncome),
    monthlyEssentials: num(form.monthlyEssentials),
    priorityObligations: num(form.priorityObligations),
    remittances: num(form.remittances),
    sinkingFunds: num(form.sinkingFunds),
    debtAttack: form.debtAttack === "" ? undefined : num(form.debtAttack),
    debtAttackSource: form.debtAttackSource,
  });

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          country: form.country,
          monthlyIncome: num(form.monthlyIncome),
          monthlyEssentials: num(form.monthlyEssentials),
          payday: form.payday ? Number(form.payday) : undefined,
          priorityObligations: num(form.priorityObligations),
          remittances: num(form.remittances),
          sinkingFunds: num(form.sinkingFunds),
          debtAttackSource: attack.source,
          debtAttack: attack.source === "chosen" ? attack.amount : attack.derived,
          windfallRule: form.windfallRule,
          reviewCadence: form.reviewCadence,
          strategy: form.strategy,
          moneyPurpose: form.moneyPurpose,
          goodDecision: form.goodDecision,
          upbringing: form.upbringing,
        }),
      });
      if (!response.ok) throw new Error("not saved");
      setSaved(true);
      router.refresh();
    } catch {
      setError("That didn't save. Check the numbers and try again; nothing was changed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <fieldset>
        <legend className="label">About you</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className={label}>
            Name
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className={field} />
          </label>
          <label className={label}>
            Where you live
            <select value={form.country} onChange={(e) => set("country", e.target.value)} className={field}>
              {Object.values(COUNTRIES).map((option) => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">The month, in {currency}</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className={label}>
            Take-home salary
            <input inputMode="decimal" value={form.monthlyIncome} onChange={(e) => set("monthlyIncome", e.target.value)} className={field} />
          </label>
          <label className={label}>
            Payday (day of month)
            <input inputMode="numeric" placeholder="25" value={form.payday} onChange={(e) => set("payday", e.target.value)} className={field} />
          </label>
          <label className={label}>
            Essentials: food, transport, phone
            <input inputMode="decimal" value={form.monthlyEssentials} onChange={(e) => set("monthlyEssentials", e.target.value)} className={field} />
          </label>
          <label className={label}>
            Rent, school fees, instalments
            <input inputMode="decimal" placeholder="0" value={form.priorityObligations} onChange={(e) => set("priorityObligations", e.target.value)} className={field} />
          </label>
          <label className={label}>
            Sent home
            <input inputMode="decimal" placeholder="0" value={form.remittances} onChange={(e) => set("remittances", e.target.value)} className={field} />
          </label>
          <label className={label}>
            Set aside for known lumps (Eid, renewals)
            <input inputMode="decimal" placeholder="0" value={form.sinkingFunds} onChange={(e) => set("sinkingFunds", e.target.value)} className={field} />
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-card border border-rule bg-cream-2 p-4">
        <legend className="label px-1">What goes to the cards each month</legend>
        <dl className="mt-2 space-y-1.5">
          {attack.lines.map((line) => (
            <div key={line.label} className="flex items-baseline justify-between gap-3 text-[13px]">
              <dt className="text-ink-500">{line.label}</dt>
              <dd className={`n ${line.amount < 0 ? "text-ink-400" : "text-ink-800"}`}>
                {line.amount < 0 ? "−" : ""}
                {Math.abs(line.amount).toLocaleString("en-US")}
              </dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-3 border-t border-rule pt-2 text-[14px] font-bold">
            <dt className="text-ink-800">Derived</dt>
            <dd className="n text-stem-700">
              {currency} {attack.derived.toLocaleString("en-US")}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => set("debtAttackSource", "derived")}
            aria-pressed={form.debtAttackSource === "derived"}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold transition ${
              form.debtAttackSource === "derived"
                ? "bg-stem-600 text-white"
                : "border border-rule bg-card text-ink-600 hover:border-stem"
            }`}
          >
            Use the derived figure
          </button>
          <button
            type="button"
            onClick={() => set("debtAttackSource", "chosen")}
            aria-pressed={form.debtAttackSource === "chosen"}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold transition ${
              form.debtAttackSource === "chosen"
                ? "bg-stem-600 text-white"
                : "border border-rule bg-card text-ink-600 hover:border-stem"
            }`}
          >
            Choose my own
          </button>
        </div>

        {form.debtAttackSource === "chosen" ? (
          <label className={`${label} mt-3`}>
            Your figure ({currency})
            <input
              inputMode="decimal"
              value={form.debtAttack}
              onChange={(e) => set("debtAttack", e.target.value)}
              className={field}
            />
          </label>
        ) : null}

        <p className="mt-3 text-[13px] text-ink-500">
          The plan runs on{" "}
          <span className="n font-bold text-ink-800">
            {currency} {attack.amount.toLocaleString("en-US")}
          </span>{" "}
          a month, the{" "}
          <span className="chip c-neutral">{attack.source === "chosen" ? "chosen" : "derived"}</span>{" "}
          figure.
          {attack.source === "chosen" && attack.chosen !== null && attack.chosen !== attack.derived
            ? ` The formula would say ${currency} ${attack.derived.toLocaleString("en-US")}.`
            : ""}
        </p>
      </fieldset>

      <fieldset>
        <legend className="label">How you want to work it</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className={label}>
            Order of the cards
            <select value={form.strategy} onChange={(e) => set("strategy", e.target.value === "avalanche" ? "avalanche" : "snowball")} className={field}>
              <option value="snowball">Smallest balance first (a card closes sooner)</option>
              <option value="avalanche">Highest rate first (less interest overall)</option>
            </select>
          </label>
          <label className={label}>
            When you sit down with the numbers
            <select value={form.reviewCadence} onChange={(e) => set("reviewCadence", e.target.value === "weekly" ? "weekly" : "payday")} className={field}>
              <option value="payday">Payday, once a month</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>
          <label className={`${label} sm:col-span-2`}>
            Your rule for money that isn&rsquo;t salary
            <input
              value={form.windfallRule}
              onChange={(e) => set("windfallRule", e.target.value)}
              placeholder="A bonus or a refund goes to the card I'm working on, the day it lands."
              className={field}
            />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">In your words</legend>
        <div className="mt-3 grid gap-3">
          <label className={label}>
            What the money is for
            <textarea rows={2} value={form.moneyPurpose} onChange={(e) => set("moneyPurpose", e.target.value)} className={field} />
          </label>
          <label className={label}>
            Something you already did that worked
            <textarea rows={2} value={form.goodDecision} onChange={(e) => set("goodDecision", e.target.value)} className={field} />
          </label>
          <label className={label}>
            Where your money story starts
            <textarea rows={2} value={form.upbringing} onChange={(e) => set("upbringing", e.target.value)} className={field} />
          </label>
        </div>
      </fieldset>

      {error ? <p className="text-[13px] text-amber-900">{error}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-ink-800 px-5 py-2.5 text-[14px] font-bold text-cream transition hover:bg-ink-700 disabled:opacity-60"
      >
        {busy ? "Saving" : saved ? "Saved" : "Save"}
      </button>
    </form>
  );
}
