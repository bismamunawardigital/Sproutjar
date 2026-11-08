"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { formatMoneyShort } from "@/lib/money";
import { paymentPresets } from "@/lib/today";

export type TodayPaymentRow = {
  id: string;
  name: string;
  balance: number;
  minimumPayment: number;
  dueDay?: number;
  amount: number;
  focus: boolean;
  estimatedFields?: string;
  paidSinceReview: number;
};

const button = "min-h-11 rounded-full border border-rule px-4 py-2 text-[13px] font-bold hover:border-stem disabled:opacity-60";

export function TodayPayments({ rows, currency, readOnly }: { rows: TodayPaymentRow[]; currency: string; readOnly: boolean }) {
  const router = useRouter();
  const pending = useRef(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const focus = rows[0];
  if (!focus) return null;
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const money = (value: number) => formatMoneyShort(value, currency);

  async function logPayment(event: FormEvent, row: TodayPaymentRow) {
    event.preventDefault();
    if (pending.current || readOnly) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) { setError("Add the amount you paid, even if it was small."); return; }
    pending.current = true;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/debts/${row.id}/payments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: value }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "That did not save. Try again.");
      setSelected(null);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Check Plan before trying again.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="rounded-card border border-rule bg-card p-5" aria-labelledby="this-month">
      <div className="flex items-center justify-between gap-3"><h2 id="this-month" className="label">This month</h2><span className="rounded-full bg-leaf-100 px-2 py-1 text-[11px] font-bold text-ink-700">Estimated</span></div>
      <p className="mt-3 text-[22px] leading-snug text-ink-900">Pay <b className="n">{money(focus.amount)}</b> to {focus.name}.</p>
      {rows.length > 1 ? <p className="mt-2 text-[14px] leading-relaxed text-ink-400">And what the bank asks on {rows.length === 2 ? "the other card" : `the other ${rows.length - 1}`}. That&apos;s the whole {money(total)}.</p> : null}
      <p className="mt-2 text-[12px] leading-relaxed text-ink-400">Based on the balances and rates saved now. You make the payments with your bank. Sproutjar only records them.</p>
      <div className="mt-4 divide-y divide-rule">
        {rows.map((row) => (
          <div key={row.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-bold">{row.name}</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-400">{row.focus ? "Start here" : row.estimatedFields?.includes("minimum") ? "Estimated minimum" : "What the bank asks"}{row.dueDay ? ` · due on day ${row.dueDay}` : ""}</p>
                {row.paidSinceReview > 0 ? <p className="mt-2 text-[12px] text-ink-400">{money(row.paidSinceReview)} logged since your last review</p> : null}
              </div>
              <div className="shrink-0 text-right">
                <p className="n text-[16px] font-bold">{money(row.amount)}</p>
                <button className={`${button} mt-2 ${row.focus ? "border-ink-800 bg-ink-800 text-cream" : ""}`} disabled={busy || readOnly} onClick={() => { setSelected(row.id); setAmount(paymentPresets(row)[0].value); setError(null); }}>I paid this</button>
              </div>
            </div>
            {selected === row.id ? (
              <form className="mt-4 space-y-3 rounded-card bg-cream p-4" onSubmit={(event) => void logPayment(event, row)}>
                <h4 className="text-[16px] font-bold">How much did you pay to {row.name}?</h4>
                <p className="text-[13px] leading-relaxed text-ink-400">This only records it. You make the payment with your bank.</p>
                <label className="block text-[13px] font-bold">Amount ({currency})<input autoFocus inputMode="decimal" type="number" min="0.01" step="any" required value={amount} disabled={busy} onChange={(event) => setAmount(event.target.value)} className="mt-2 min-h-11 w-full rounded-sm border border-rule bg-card px-3 py-2" /></label>
                <div className="flex flex-wrap gap-2">{paymentPresets(row).map(({ label, value }) => <button className={button} type="button" key={label} disabled={busy} onClick={() => setAmount(value)}>{label}</button>)}</div>
                {Number(amount) >= row.balance ? <p role="status" className="text-[13px] font-bold">This clears the card.</p> : null}
                {error ? <p role="alert" className="text-[13px] text-ink-800">{error}</p> : null}
                <div className="grid grid-cols-2 gap-2"><button className={`${button} border-ink-800 bg-ink-800 text-cream`} disabled={busy}>{busy ? "Saving" : "Log it"}</button><button type="button" className={button} disabled={busy} onClick={() => setSelected(null)}>Cancel</button></div>
              </form>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
