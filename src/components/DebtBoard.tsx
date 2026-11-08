"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatementImport, type StatementReading } from "@/components/StatementImport";
import { formatRate } from "@/lib/money";
import { planMoney as formatMoney, savePlanChange } from "@/lib/plan";
import { paymentPresets } from "@/lib/today";

export type DebtRow = {
  id: string;
  name: string;
  issuer: string;
  kind: string;
  provider?: string;
  balance: number;
  paidSinceReview?: number;
  openingBalance: number;
  monthlyRate: number;
  minimumPayment: number;
  dueDay?: number;
  statementDay?: number;
  isIslamic: boolean;
  isEstimated: boolean;
  estimatedFields?: string;
  lastReviewed: { at: string; paid: number; interestCharged: number; newBorrowing: number } | null;
};

const KINDS = [
  { key: "credit_card", label: "Credit card" },
  { key: "bnpl", label: "Buy now, pay later" },
  { key: "personal_loan", label: "Personal loan" },
  { key: "overdraft", label: "Overdraft" },
] as const;

const BNPL_PROVIDERS = ["Tabby", "Postpay", "Tamara", "Cashew", "Spotii", "Other"];

const ESTIMABLE = [
  { key: "rate", label: "the rate" },
  { key: "minimum", label: "the minimum" },
  { key: "balance", label: "the balance" },
] as const;

type Form = {
  name: string;
  issuer: string;
  kind: string;
  provider: string;
  balance: string;
  monthlyRatePct: string;
  minimumPayment: string;
  dueDay: string;
  statementDay: string;
  estimated: string[];
};

const EMPTY: Form = {
  name: "",
  issuer: "",
  kind: "credit_card",
  provider: "",
  balance: "",
  monthlyRatePct: "",
  minimumPayment: "",
  dueDay: "",
  statementDay: "",
  estimated: [],
};

function formFor(debt: DebtRow): Form {
  return {
    name: debt.name,
    issuer: debt.issuer,
    kind: debt.kind,
    provider: debt.provider ?? "",
    balance: String(debt.balance),
    monthlyRatePct: (debt.monthlyRate * 100).toFixed(2),
    minimumPayment: String(debt.minimumPayment),
    dueDay: debt.dueDay ? String(debt.dueDay) : "",
    statementDay: debt.statementDay ? String(debt.statementDay) : "",
    estimated: debt.estimatedFields ? debt.estimatedFields.split(",").filter(Boolean) : [],
  };
}

function payload(form: Form) {
  return {
    name: form.name,
    issuer: form.issuer || form.name,
    kind: form.kind,
    provider: form.kind === "bnpl" && form.provider ? form.provider : undefined,
    balance: Number(form.balance),
    monthlyRate: form.monthlyRatePct.trim() ? Number(form.monthlyRatePct) / 100 : 0.0325,
    minimumPayment: form.minimumPayment.trim() ? Number(form.minimumPayment) : Number(form.balance) * 0.05,
    dueDay: form.dueDay ? Number(form.dueDay) : undefined,
    statementDay: form.statementDay ? Number(form.statementDay) : undefined,
    estimatedFields: [...new Set([...form.estimated, ...(!form.monthlyRatePct.trim() ? ["rate"] : []), ...(!form.minimumPayment.trim() ? ["minimum"] : [])])].join(","),
  };
}

function ordinal(day: number): string {
  const rest = day % 100;
  const suffix =
    rest >= 11 && rest <= 13 ? "th" : ["th", "st", "nd", "rd"][day % 10 > 3 ? 0 : day % 10];
  return `${day}${suffix}`;
}

function estimatedLabel(fields: string | undefined): string {
  const names = (fields ?? "")
    .split(",")
    .filter(Boolean)
    .map((k) => ESTIMABLE.find((e) => e.key === k)?.label ?? k);
  if (names.length === 0) return "Estimated";
  return `Estimated: ${names.join(" and ")}`;
}

export function DebtBoard({
  debts,
  currency,
  focusName,
  payments = [],
  readOnly = false,
}: {
  debts: DebtRow[];
  currency: string;
  focusName: string | null;
  payments?: { id: string; amount: number }[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [paidId, setPaidId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payError, setPayError] = useState<string | null>(null);
  const openCards = debts.filter((debt) => debt.balance > 0);
  const settled = debts.filter((debt) => debt.balance <= 0);

  function startNew() {
    setFormError(null); setImporting(false);
    setForm(EMPTY);
    setEditing(editing === "new" ? null : "new");
  }

  function startEdit(debt: DebtRow) {
    setFormError(null); setImporting(false);
    setForm(formFor(debt));
    setEditing(debt.id);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (readOnly || busy) return;
    setFormError(null);
    const fields = payload(form);
    if (!fields.name.trim() || !Number.isFinite(fields.balance) || fields.balance <= 0 || !Number.isFinite(fields.monthlyRate) || fields.monthlyRate < 0 || fields.monthlyRate > 1 || !Number.isFinite(fields.minimumPayment) || fields.minimumPayment < 0) { setFormError("Add a name, a balance above zero, and valid rate and minimum figures."); return; }
    setBusy(true);
    try {
      await savePlanChange(editing === "new" ? "/api/debts" : `/api/debts/${editing}`, editing === "new" ? "POST" : "PATCH", fields);
      setForm(EMPTY); setEditing(null); router.refresh();
    } catch { setFormError("That didn't save. Your figures are still here. Try again."); }
    finally { setBusy(false); }
  }

  function fromStatement(reading: StatementReading) {
    setForm({
      ...EMPTY,
      name: reading.name ?? "",
      issuer: reading.issuer ?? "",
      balance: reading.balance !== null ? String(reading.balance) : "",
      monthlyRatePct: reading.monthlyRatePct !== null ? reading.monthlyRatePct.toFixed(2) : "",
      minimumPayment: reading.minimumPayment !== null ? String(reading.minimumPayment) : "",
      dueDay: reading.dueDay !== null ? String(reading.dueDay) : "",
      statementDay: reading.statementDay !== null ? String(reading.statementDay) : "",
    });
    setImporting(false);
    setEditing("new");
  }

  function startPaying(debt: DebtRow) {
    setAsking(null);
    setPayError(null);
    const planned = payments.find((row) => row.id === debt.id);
    setPayAmount(planned ? String(Math.round(planned.amount * 1000) / 1000) : "");
    setPaying(debt.id);
  }

  async function logPayment(event: React.FormEvent, debt: DebtRow) {
    event.preventDefault();
    if (readOnly || busy) return;
    const amount = Number(payAmount);
    if (!Number.isFinite(amount) || !(amount > 0)) {
      setPayError("How much went to it?");
      return;
    }
    setBusy(true);
    setPayError(null);
    const response = await fetch(`/api/debts/${debt.id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    }).catch(() => null);
    setBusy(false);
    if (!response) {
      setPayError("Could not reach Sproutjar. Check your connection and try again.");
      return;
    }
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setPayError(data.error ?? "That did not save. Try again.");
      return;
    }
    setPaying(null);
    setPaidId(debt.id);
    router.refresh();
  }

  async function removeDebt(id: string) {
    if (readOnly || busy) return;
    setBusy(true); setFormError(null);
    try { await savePlanChange(`/api/debts/${encodeURIComponent(id)}`, "DELETE"); setAsking(null); setEditing(null); router.refresh(); }
    catch { setFormError("That didn't remove the card. Try again."); }
    finally { setBusy(false); }
  }

  const input =
    "mt-1 min-h-11 w-full rounded-sm border border-rule bg-card px-3 py-2 text-[15px] text-ink-800 outline-none focus:border-stem";

  const editor = (
    <form onSubmit={save} className="mt-4 grid gap-3 rounded-sm bg-cream p-4 sm:grid-cols-2">
      <label className="text-[12px] font-bold text-ink-500 sm:col-span-2">
        What kind of debt
        <select
          value={form.kind}
          onChange={(e) => setForm({ ...form, kind: e.target.value })}
          className={input}
        >
          {KINDS.map((k) => (
            <option key={k.key} value={k.key}>
              {k.label}
            </option>
          ))}
        </select>
      </label>
      {form.kind === "bnpl" ? (
        <label className="text-[12px] font-bold text-ink-500 sm:col-span-2">
          Which provider
          <select
            value={form.provider}
            onChange={(e) => setForm({ ...form, provider: e.target.value })}
            className={input}
          >
            <option value="">Pick one</option>
            {BNPL_PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {(
        [
          ["name", "What you call it", "text", true],
          ["issuer", form.kind === "bnpl" ? "Shop or app it was for" : "Which bank", "text", false],
          ["balance", `What you owe on it (${currency})`, "number", true],
          ["monthlyRatePct", "Monthly interest %", "number", false],
          ["minimumPayment", `Minimum payment (${currency})`, "number", false],
          ["dueDay", "Payment due on the (day of month)", "number", false],
          ["statementDay", "Statement arrives on the (day of month)", "number", false],
        ] as const
      ).map(([key, label, type, required]) => (
        <label key={key} className="text-[12px] font-bold text-ink-500">
          {label}
          <input
            required={required}
            type={type}
            step="any"
            min={key === "dueDay" || key === "statementDay" ? 1 : undefined}
            max={key === "dueDay" || key === "statementDay" ? 31 : undefined}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className={input}
          />
        </label>
      ))}
      <fieldset className="sm:col-span-2">
        <legend className="text-[12px] font-bold text-ink-500">
          Which of these are a guess for now
        </legend>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {ESTIMABLE.map((e) => {
            const on = form.estimated.includes(e.key);
            return (
              <button
                key={e.key}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setForm({
                    ...form,
                    estimated: on
                      ? form.estimated.filter((k) => k !== e.key)
                      : [...form.estimated, e.key],
                  })
                }
                className={`min-h-11 rounded-full border px-3 py-1 text-[12px] font-bold transition ${
                  on
                    ? "border-ink-800 bg-ink-800 text-cream"
                    : "border-rule text-ink-500 hover:border-ink-300"
                }`}
              >
                {e.label}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-[12px] leading-relaxed text-ink-400">
          A guess is fine to start. The statement has the real figure, and the date moves a little
          when you replace it.
        </p>
      </fieldset>
      <p className="text-[12px] text-ink-400 sm:col-span-2">Blank rate: 3.25% a month, Estimated. Blank minimum: 5% of the balance, Estimated. Check both against the statement.</p>
      {form.balance && form.monthlyRatePct && Number(form.minimumPayment) > 0 && Number(form.minimumPayment) <= Number(form.balance) * Number(form.monthlyRatePct) / 100 ? <p role="status" className="rounded-card bg-amber/10 p-3 text-[14px] sm:col-span-2">This minimum doesn&apos;t cover the Estimated interest. Worth checking against your statement.</p> : null}
      {editing !== "new" ? <div className="sm:col-span-2">{asking === editing ? <><p className="text-[14px]">Remove this card only if it was added by mistake. If it is paid off, record the payment instead.</p><button type="button" onClick={() => void removeDebt(editing!)} className="min-h-11 text-[14px] font-bold">Yes, remove this card</button><button type="button" onClick={() => setAsking(null)} className="min-h-11 px-4 text-[14px]">Keep it</button></> : <button type="button" onClick={() => setAsking(editing)} className="min-h-11 text-[14px] font-bold text-ink-500">Remove this card</button>}</div> : null}
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="min-h-11 rounded-full bg-ink-800 px-4 py-2.5 text-sm font-bold text-cream transition hover:bg-ink-700 disabled:opacity-60"
        >
          {busy ? "Saving" : editing === "new" ? "Save it" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="min-h-11 text-[13px] font-bold text-ink-300 transition hover:text-ink-500"
        >
          Never mind
        </button>
      </div>
    </form>
  );

  return (
    <section className="rounded-card border border-rule bg-card p-5 sm:p-6"><fieldset disabled={readOnly || busy} className="min-w-0">
      {formError ? <p role="alert" className="mb-4 text-[14px] text-root">{formError}</p> : null}
      {debts.some((debt) => debt.id === paidId && debt.balance <= 0) ? <div role="status" className="mb-5 rounded-card bg-leaf-50 p-5"><p className="label">Cleared</p><h3 className="mt-2 text-[24px] font-bold">{debts.find((debt) => debt.id === paidId)?.name} is paid off.</h3><p className="mt-2 text-[14px]">The stem keeps this. Your plan has been worked out again.</p><button onClick={() => setPaidId(null)} className="min-h-11 font-bold text-stem-700">Keep going</button></div> : null}
      <div className="flex flex-col items-start gap-3">
        <p className="label">Your cards</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setImporting((v) => !v);
              setEditing(null);
            }}
            aria-expanded={importing}
            className="min-h-11 rounded-full border border-rule px-3.5 py-1.5 text-[13px] font-bold text-ink-700 transition hover:border-ink-300"
          >
            Read a statement
          </button>
          <button
            onClick={startNew}
            aria-expanded={editing === "new"}
            className="min-h-11 rounded-full border border-rule px-3.5 py-1.5 text-[13px] font-bold text-ink-700 transition hover:border-ink-300"
          >
            {editing === "new" ? "Never mind" : "Add a card"}
          </button>
        </div>
      </div>

      {importing ? (
        <StatementImport currency={currency} onRead={fromStatement} onClose={() => setImporting(false)} />
      ) : null}

      {editing === "new" ? editor : null}

      {openCards.length === 0 && settled.length === 0 ? (
        <p className="mt-4 text-[15px] leading-relaxed text-ink-400">
          Nothing here yet. Add your first card. The number is what it is, and seeing it is how this
          starts.
        </p>
      ) : null}

      <div className="mt-4 divide-y divide-rule">{openCards.map((debt) => {
        const planned = payments.find((row) => row.id === debt.id);
        const cleared = Math.max(0, debt.openingBalance - debt.balance);
        const presets = planned ? paymentPresets({ ...debt, amount: planned.amount }) : [{ label: "All of it", value: String(debt.balance) }];
        return <article key={debt.id} className="py-5 first:pt-0">
          <div className="flex items-start justify-between gap-3"><h3 className="text-[17px] font-bold">{debt.name}</h3><b className="n shrink-0 text-[18px]">{formatMoney(debt.balance, currency)}</b></div>
          <div className="mt-2 flex flex-wrap gap-2">{debt.name === focusName && openCards.length > 1 ? <span className="chip c-grow">Start here</span> : null}{debt.isEstimated ? <span className="chip c-neutral">{estimatedLabel(debt.estimatedFields)}</span> : null}{debt.kind !== "credit_card" ? <span className="chip c-neutral">{KINDS.find((kind) => kind.key === debt.kind)?.label}{debt.provider ? ` · ${debt.provider}` : ""}</span> : null}</div>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-400">{formatRate(debt.monthlyRate)}{debt.isIslamic ? " profit rate" : ""}, Estimated {formatMoney(debt.balance * debt.monthlyRate, currency)} interest · minimum {formatMoney(debt.minimumPayment, currency)}{debt.dueDay ? ` · due on the ${ordinal(debt.dueDay)}` : ""}{debt.statementDay ? ` · statement on the ${ordinal(debt.statementDay)}` : ""}{cleared > 0 ? ` · ${formatMoney(cleared, currency)} paid off` : ""}</p>
          {(debt.paidSinceReview ?? 0) > 0 ? <p className="mt-2 text-[13px] text-stem-700">{formatMoney(debt.paidSinceReview!, currency)} logged since your last review</p> : null}
          {!debt.dueDay ? <button className="min-h-11 text-[13px] font-bold text-stem-700 underline" onClick={() => startEdit(debt)}>Add the due date</button> : null}
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-card bg-cream p-3"><div className="min-w-0 flex-1"><p className="text-[12px] text-ink-400">{planned ? "Pay this month · Estimated" : "No payment figure yet"}</p>{planned ? <b className="n text-[17px]">{formatMoney(planned.amount, currency)}</b> : null}</div><button onClick={() => paying === debt.id ? setPaying(null) : startPaying(debt)} className="min-h-11 rounded-full bg-ink-800 px-4 text-[13px] font-bold text-cream">I paid this</button><button aria-label={`Edit ${debt.name}`} onClick={() => editing === debt.id ? setEditing(null) : startEdit(debt)} className="min-h-11 rounded-full border border-rule px-3 text-[13px] font-bold">Edit</button></div>
          {paying === debt.id ? <form onSubmit={(event) => void logPayment(event, debt)} className="mt-4 space-y-3 rounded-card border border-rule p-4"><h4 className="text-[19px] font-bold">Paid to {debt.name}</h4><p className="text-[13px] text-ink-400">This records it. You make the payment with your bank.</p><div className="flex flex-wrap gap-2">{presets.map((preset) => <button type="button" key={preset.label} className="min-h-11 rounded-full border border-rule px-3 text-[13px]" onClick={() => setPayAmount(preset.value)}>{preset.label}</button>)}</div><label className="block text-[14px] font-bold">Amount ({currency})<input inputMode="decimal" className={input} value={payAmount} onChange={(event) => setPayAmount(event.target.value)} /></label>{payError ? <p role="alert" className="text-[14px] text-root">{payError}</p> : null}<button className="min-h-11 rounded-full bg-ink-800 px-4 text-[14px] font-bold text-cream">Log it</button><button type="button" className="min-h-11 px-4 text-[14px]" onClick={() => setPaying(null)}>Cancel</button></form> : null}
          {editing === debt.id ? editor : null}
        </article>;
      })}</div>

      {settled.length > 0 ? (
        <div className="mt-5 rounded-sm bg-cream px-4 py-4">
          <p className="label">Cleared · the stem keeps this</p>
          <ul className="mt-2.5 space-y-2">
            {settled.map((debt) => (
              <li key={debt.id} className="flex items-center justify-between gap-3 text-[14px]">
                <span className="min-w-0 truncate font-bold text-ink-700">
                  {debt.name}
                  <span className="ml-2 font-normal text-ink-400">
                    <span className="n">{formatMoney(debt.openingBalance, currency)}</span> paid off
                  </span>
                </span>
                {asking === debt.id ? (
                  <span className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => removeDebt(debt.id)}
                      className="min-h-11 text-[12px] font-bold text-root transition hover:opacity-80"
                    >
                      Remove it
                    </button>
                    <button
                      onClick={() => setAsking(null)}
                      className="min-h-11 text-[12px] font-bold text-ink-300 transition hover:text-ink-500"
                    >
                      Keep
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setAsking(debt.id)}
                    className="min-h-11 shrink-0 text-[12px] text-ink-300 transition hover:text-ink-500"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </fieldset></section>
  );
}
