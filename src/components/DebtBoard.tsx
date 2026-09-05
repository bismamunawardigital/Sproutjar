"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatementImport, type StatementReading } from "@/components/StatementImport";
import { formatMoney, formatRate } from "@/lib/money";

export type DebtRow = {
  id: string;
  name: string;
  issuer: string;
  kind: string;
  provider?: string;
  balance: number;
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
    monthlyRate: Number(form.monthlyRatePct) / 100,
    minimumPayment: Number(form.minimumPayment),
    dueDay: form.dueDay ? Number(form.dueDay) : undefined,
    statementDay: form.statementDay ? Number(form.statementDay) : undefined,
    estimatedFields: form.estimated.join(","),
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
  return `Guessed ${names.join(" and ")}`;
}

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
  const [form, setForm] = useState<Form>(EMPTY);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const openCards = debts.filter((debt) => debt.balance > 0);
  const settled = debts.filter((debt) => debt.balance <= 0);

  function startNew() {
    setForm(EMPTY);
    setEditing(editing === "new" ? null : "new");
  }

  function startEdit(debt: DebtRow) {
    setForm(formFor(debt));
    setEditing(debt.id);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const isNew = editing === "new";
    await fetch(isNew ? "/api/debts" : `/api/debts/${editing}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload(form)),
    });
    setForm(EMPTY);
    setEditing(null);
    setBusy(false);
    router.refresh();
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

  async function settleDebt(id: string) {
    setAsking(null);
    await fetch(`/api/debts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ balance: 0 }),
    });
    router.refresh();
  }

  async function removeDebt(id: string) {
    setAsking(null);
    await fetch(`/api/debts/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const input =
    "mt-1 w-full rounded-sm border border-rule bg-card px-3 py-2 text-[15px] text-ink-800 outline-none focus:border-stem";

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
          ["monthlyRatePct", "Monthly interest %", "number", true],
          ["minimumPayment", `Minimum payment (${currency})`, "number", true],
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
                className={`rounded-full border px-3 py-1 text-[12px] font-bold transition ${
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
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-ink-800 px-4 py-2.5 text-sm font-bold text-cream transition hover:bg-ink-700 disabled:opacity-60"
        >
          {busy ? "Saving" : editing === "new" ? "Save it" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="text-[13px] font-bold text-ink-300 transition hover:text-ink-500"
        >
          Never mind
        </button>
      </div>
    </form>
  );

  return (
    <section className="rounded-card border border-rule bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="label">Your cards</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setImporting((v) => !v);
              setEditing(null);
            }}
            aria-expanded={importing}
            className="rounded-full border border-rule px-3.5 py-1.5 text-[13px] font-bold text-ink-700 transition hover:border-ink-300"
          >
            Connect your bank
          </button>
          <button
            onClick={startNew}
            aria-expanded={editing === "new"}
            className="rounded-full border border-rule px-3.5 py-1.5 text-[13px] font-bold text-ink-700 transition hover:border-ink-300"
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

      <div className="mt-4 divide-y divide-rule">
        {openCards.map((debt) => {
          const bleed = debt.balance * debt.monthlyRate;
          const cleared = Math.max(0, debt.openingBalance - debt.balance);
          const isFocus = debt.name === focusName;
          const kind = KINDS.find((k) => k.key === debt.kind);
          return (
            <div key={debt.id} className="py-4 first:pt-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-[15px] font-bold text-ink-900">
                    {debt.name}
                    {isFocus ? <span className="chip c-grow">Start here</span> : null}
                    {debt.kind === "bnpl" ? (
                      <span className="chip c-neutral">{debt.provider ?? "Pay later"}</span>
                    ) : null}
                    {debt.isEstimated ? (
                      <span className="chip c-neutral" title="Replace it from the statement when you can">
                        {estimatedLabel(debt.estimatedFields)}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-[13px] text-ink-400">
                    {debt.issuer}
                    {kind && debt.kind !== "credit_card" ? ` · ${kind.label}` : ""} ·{" "}
                    {formatRate(debt.monthlyRate)}
                    {debt.isIslamic ? " profit rate" : ""}
                  </p>
                  <p className="mt-1 text-[13px] text-ink-400">
                    {debt.lastReviewed ? (
                      <span className="text-root">
                        <span className="n">{formatMoney(debt.lastReviewed.interestCharged, currency)}</span>{" "}
                        interest on the last statement
                      </span>
                    ) : (
                      <span className="text-root">
                        about <span className="n">{formatMoney(bleed, currency)}</span> interest this month
                      </span>
                    )}
                    {cleared > 0 ? (
                      <>
                        {" · "}
                        <span className="text-stem-700">
                          <span className="n">{formatMoney(cleared, currency)}</span> paid off
                        </span>
                      </>
                    ) : null}
                  </p>
                  {debt.dueDay || debt.statementDay ? (
                    <p className="mt-1 text-[13px] text-ink-400">
                      {debt.dueDay ? `Due on the ${ordinal(debt.dueDay)}` : null}
                      {debt.dueDay && debt.statementDay ? " · " : null}
                      {debt.statementDay ? `statement on the ${ordinal(debt.statementDay)}` : null}
                      {" · "}minimum{" "}
                      <span className="n">{formatMoney(debt.minimumPayment, currency)}</span>
                    </p>
                  ) : (
                    <p className="mt-1 text-[13px] text-ink-400">
                      Minimum <span className="n">{formatMoney(debt.minimumPayment, currency)}</span>
                      {" · "}
                      <button
                        onClick={() => startEdit(debt)}
                        className="font-bold text-stem-700 underline decoration-stem/40 underline-offset-2 hover:decoration-stem"
                      >
                        add the due date
                      </button>
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="n text-[19px] text-ink-900">{formatMoney(debt.balance, currency)}</p>
                  {asking === debt.id ? (
                    <div className="mt-1.5 flex items-center justify-end gap-2">
                      <span className="text-[12px] text-ink-400">Cleared it?</span>
                      <button
                        onClick={() => settleDebt(debt.id)}
                        className="rounded-full bg-stem-600 px-3 py-1 text-[12px] font-bold text-white transition hover:bg-stem-700"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setAsking(null)}
                        className="text-[12px] font-bold text-ink-300 transition hover:text-ink-500"
                      >
                        Not yet
                      </button>
                    </div>
                  ) : (
                    <div className="mt-1.5 flex items-center justify-end gap-2">
                      <button
                        onClick={() => (editing === debt.id ? setEditing(null) : startEdit(debt))}
                        aria-expanded={editing === debt.id}
                        className="rounded-full border border-rule px-3 py-1 text-[12px] font-bold text-ink-500 transition hover:border-ink-300 hover:text-ink-700"
                      >
                        {editing === debt.id ? "Close" : "Edit"}
                      </button>
                      <button
                        onClick={() => setAsking(debt.id)}
                        className="rounded-full border border-rule px-3 py-1 text-[12px] font-bold text-ink-500 transition hover:border-stem hover:text-stem-700"
                      >
                        Mark settled
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {editing === debt.id ? editor : null}
            </div>
          );
        })}
      </div>

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
                      className="text-[12px] font-bold text-root transition hover:opacity-80"
                    >
                      Remove it
                    </button>
                    <button
                      onClick={() => setAsking(null)}
                      className="text-[12px] font-bold text-ink-300 transition hover:text-ink-500"
                    >
                      Keep
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setAsking(debt.id)}
                    className="shrink-0 text-[12px] text-ink-300 transition hover:text-ink-500"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
