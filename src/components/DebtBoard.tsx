"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney, formatRate } from "@/lib/money";

export type DebtRow = {
  id: string;
  name: string;
  issuer: string;
  balance: number;
  openingBalance: number;
  monthlyRate: number;
  minimumPayment: number;
  isIslamic: boolean;
  isEstimated: boolean;
};

const EMPTY = { name: "", issuer: "", balance: "", monthlyRatePct: "", minimumPayment: "" };

export function DebtBoard({
  debts,
  currency,
  focusName,
}: {
  debts: DebtRow[];
  currency: string;
  focusName: string | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function addDebt(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    await fetch("/api/debts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        issuer: form.issuer || form.name,
        balance: Number(form.balance),
        monthlyRate: Number(form.monthlyRatePct) / 100,
        minimumPayment: Number(form.minimumPayment),
      }),
    });
    setForm(EMPTY);
    setOpen(false);
    setBusy(false);
    router.refresh();
  }

  async function removeDebt(id: string, name: string) {
    if (
      !window.confirm(
        `Remove ${name}? You'll lose its history too. If you've paid it off, set it to zero instead so you keep the record.`,
      )
    )
      return;
    await fetch(`/api/debts/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <section className="rounded-card border border-rule bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="label">Your cards</p>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-rule px-3.5 py-1.5 text-[13px] font-bold text-ink-700 transition hover:border-ink-300"
        >
          {open ? "Never mind" : "Add a card"}
        </button>
      </div>

      {open ? (
        <form onSubmit={addDebt} className="mt-4 grid gap-3 rounded-sm bg-cream p-4 sm:grid-cols-2">
          {(
            [
              ["name", "What do you call it", "text"],
              ["issuer", "Which bank", "text"],
              ["balance", `What you owe on it (${currency})`, "number"],
              ["monthlyRatePct", "Monthly interest %", "number"],
              ["minimumPayment", `Minimum payment (${currency})`, "number"],
            ] as const
          ).map(([key, label, type]) => (
            <label key={key} className="text-[12px] font-bold text-ink-500">
              {label}
              <input
                required
                type={type}
                step="any"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="mt-1 w-full rounded-sm border border-rule bg-card px-3 py-2 text-[15px] text-ink-800 outline-none focus:border-stem"
              />
            </label>
          ))}
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-ink-800 px-4 py-2.5 text-sm font-bold text-cream transition hover:bg-ink-700 disabled:opacity-60 sm:col-span-2"
          >
            {busy ? "Saving" : "Save it"}
          </button>
        </form>
      ) : null}

      {debts.length === 0 ? (
        <p className="mt-4 text-[15px] leading-relaxed text-ink-400">
          Nothing here yet. Add your first card — the number is what it is, and seeing it is how
          this starts.
        </p>
      ) : null}

      <div className="mt-4 divide-y divide-rule">
        {debts.map((debt) => {
          const bleed = debt.balance * debt.monthlyRate;
          const cleared = Math.max(0, debt.openingBalance - debt.balance);
          const isFocus = debt.name === focusName;
          return (
            <div key={debt.id} className="flex items-start justify-between gap-4 py-4 first:pt-0">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-[15px] font-bold text-ink-900">
                  {debt.name}
                  {isFocus ? <span className="chip c-grow">Start here</span> : null}
                  {debt.isEstimated ? <span className="chip c-neutral">Estimated</span> : null}
                </p>
                <p className="mt-1 text-[13px] text-ink-400">
                  {debt.issuer} · {formatRate(debt.monthlyRate)}
                  {debt.isIslamic ? " profit rate" : ""}
                </p>
                <p className="mt-1.5 text-[13px] text-root">
                  Costs you <span className="n">{formatMoney(bleed, currency)}</span> in interest
                  this month
                </p>
                {cleared > 0 ? (
                  <p className="text-[13px] text-stem-700">
                    You&rsquo;ve paid off <span className="n">{formatMoney(cleared, currency)}</span>{" "}
                    of it
                  </p>
                ) : null}
              </div>
              <div className="shrink-0 text-right">
                <p className="n text-[19px] text-ink-900">{formatMoney(debt.balance, currency)}</p>
                <button
                  onClick={() => removeDebt(debt.id, debt.name)}
                  className="mt-1 text-[12px] text-ink-300 underline underline-offset-2 transition hover:text-ink-500"
                >
                  Take it off
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
