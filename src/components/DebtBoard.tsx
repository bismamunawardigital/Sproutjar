"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

export type DebtRow = {
  id: string;
  name: string;
  issuer: string;
  balance: number;
  monthlyRate: number;
  minimumPayment: number;
  isIslamic: boolean;
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

  const money = (value: number) =>
    `${currency} ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

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

  async function removeDebt(id: string) {
    await fetch(`/api/debts/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-sand bg-cream p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold">Every number, faced</h3>
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-bark/15 px-4 py-2 text-sm font-medium transition hover:border-moss hover:text-moss"
        >
          <Plus size={16} /> Add a card
        </button>
      </div>

      {open ? (
        <form onSubmit={addDebt} className="mt-5 grid gap-3 rounded-xl bg-white/60 p-4 sm:grid-cols-5">
          {(
            [
              ["name", "Card name", "text"],
              ["issuer", "Bank", "text"],
              ["balance", `Balance (${currency})`, "number"],
              ["monthlyRatePct", "Monthly rate %", "number"],
              ["minimumPayment", "Minimum", "number"],
            ] as const
          ).map(([key, label, type]) => (
            <label key={key} className="text-xs font-medium text-ink-soft">
              {label}
              <input
                required
                type={type}
                step="any"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="mt-1 w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm text-bark outline-none focus:border-moss"
              />
            </label>
          ))}
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-moss px-4 py-2 text-sm font-medium text-white transition hover:bg-bark disabled:opacity-60 sm:col-span-5"
          >
            {busy ? "Saving…" : "Save card"}
          </button>
        </form>
      ) : null}

      <div className="mt-5 space-y-2">
        {debts.length === 0 ? (
          <p className="rounded-xl bg-white/60 p-6 text-sm leading-relaxed text-ink-soft">
            Nothing logged yet. The number is already true whether you look or not — looking just
            makes it yours.
          </p>
        ) : null}
        {debts.map((debt) => {
          const bleed = debt.balance * debt.monthlyRate;
          const isFocus = debt.name === focusName;
          return (
            <div
              key={debt.id}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${
                isFocus ? "border-moss/50 bg-moss/5" : "border-sand bg-white/60"
              }`}
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-medium">
                  {debt.name}
                  {isFocus ? (
                    <span className="rounded-full bg-moss px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Focus
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-ink-soft">
                  {debt.issuer} · {(debt.monthlyRate * 100).toFixed(2)}% per month ·{" "}
                  {debt.isIslamic ? "profit rate" : "interest"}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-display text-lg font-semibold">{money(debt.balance)}</p>
                  <p className="text-xs text-clay">costs {money(bleed)} a month to exist</p>
                </div>
                <button
                  onClick={() => removeDebt(debt.id)}
                  aria-label={`Remove ${debt.name}`}
                  className="text-ink-soft transition hover:text-clay"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
