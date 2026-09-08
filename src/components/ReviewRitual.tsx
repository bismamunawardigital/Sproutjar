"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatementImport, type StatementReading } from "@/components/StatementImport";
import { formatMoney, formatMoneyShort } from "@/lib/money";

export type ReviewRow = {
  id: string;
  cadence: string;
  completedAt: string;
  openingDebt: number;
  closingDebt: number;
  paid: number;
  principalRepaid: number;
  interestCharged: number;
  newBorrowing: number;
  debtFreeBefore: string;
  debtFreeAfter: string;
  reflection: string;
};

type Card = { id: string; name: string; balance: number; minimumPayment: number };

type Entry = { paid: string; newBorrowing: string; balance: string };

/**
 * The review is where the plan meets what happened. Four numbers, one per card
 * reading, one line in the person's own words, and the date recomputed. No
 * score, no streak: the numbers are the feedback.
 */
export function ReviewRitual({
  reviews,
  cards,
  cadence,
  currency,
  debtFreeOn,
  payday,
}: {
  reviews: ReviewRow[];
  cards: Card[];
  cadence: "weekly" | "payday";
  currency: string;
  debtFreeOn: string;
  payday: { day: number | null; daysUntil: number | null; isWindow: boolean };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [chosenCadence, setChosenCadence] = useState<"weekly" | "payday">(cadence);
  const [entries, setEntries] = useState<Record<string, Entry>>(() =>
    Object.fromEntries(cards.map((c) => [c.id, { paid: "", newBorrowing: "", balance: "" }])),
  );
  const [reflection, setReflection] = useState("");
  const [reading, setReading] = useState<string | null>(null);
  const [result, setResult] = useState<{ before: string; after: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const last = reviews[0] ?? null;

  function update(id: string, patch: Partial<Entry>) {
    setEntries((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function applyReading(id: string, r: StatementReading) {
    update(id, {
      balance: r.balance !== null ? String(r.balance) : entries[id].balance,
      paid: r.paymentsReceived !== null ? String(r.paymentsReceived) : entries[id].paid,
      newBorrowing: r.newBorrowing !== null ? String(r.newBorrowing) : entries[id].newBorrowing,
    });
    setReading(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const body = {
      cadence: chosenCadence,
      reflection,
      entries: cards.map((c) => ({
        debtId: c.id,
        paid: Number(entries[c.id].paid || 0),
        newBorrowing: Number(entries[c.id].newBorrowing || 0),
        balance: Number(entries[c.id].balance || c.balance),
      })),
    };
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      setError("That didn't save. Check the figures are numbers and try again.");
      return;
    }
    const json = (await res.json()) as { review: { debtFreeBefore: string; debtFreeAfter: string } | null };
    setResult(
      json.review
        ? { before: json.review.debtFreeBefore, after: json.review.debtFreeAfter }
        : { before: debtFreeOn, after: debtFreeOn },
    );
    setOpen(false);
    router.refresh();
  }

  const when =
    cadence === "payday"
      ? payday.day
        ? payday.isWindow
          ? "It's payday. A good moment for this."
          : payday.daysUntil !== null
            ? `Next one around payday, in ${payday.daysUntil} days.`
            : "Once a month, around payday."
        : "Once a month, around payday. Add your payday in You and this will know when."
      : "Once a week, whenever suits.";

  const input =
    "mt-1 w-full rounded-sm border border-rule bg-card px-3 py-2 text-[15px] text-ink-800 outline-none focus:border-stem";

  return (
    <section className="rounded-card border border-rule bg-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label">Your review</p>
          <p className="mt-1 text-[13px] text-ink-400">{when}</p>
        </div>
        {cards.length > 0 ? (
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="shrink-0 rounded-full border border-rule px-3.5 py-1.5 text-[13px] font-bold text-ink-700 transition hover:border-ink-300"
          >
            {open ? "Not now" : "Do this month's"}
          </button>
        ) : null}
      </div>

      {result ? (
        <div className="mt-4 rounded-sm bg-cream px-4 py-3">
          <p className="text-[15px] font-bold text-ink-900">Saved.</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
            {result.before === result.after
              ? `Debt-free date holds at ${result.after}.`
              : `Debt-free date was ${result.before}, now ${result.after}.`}{" "}
            Ren has these numbers for next time.
          </p>
        </div>
      ) : null}

      {open ? (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <p className="text-[13px] leading-relaxed text-ink-500">
            One reading per card, off the statement or the app. Interest is worked out from what
            the balance did that the payment and anything new don&rsquo;t explain.
          </p>

          {cards.map((card) => (
            <fieldset key={card.id} className="rounded-sm bg-cream p-4">
              <legend className="px-1 text-[14px] font-bold text-ink-900">{card.name}</legend>
              <p className="text-[12px] text-ink-400">
                Last known <span className="n">{formatMoney(card.balance, currency)}</span>
                {" · "}
                <button
                  type="button"
                  onClick={() => setReading(reading === card.id ? null : card.id)}
                  className="font-bold text-stem-700 underline decoration-stem/40 underline-offset-2 hover:decoration-stem"
                >
                  read it off the statement
                </button>
              </p>
              {reading === card.id ? (
                <StatementImport
                  currency={currency}
                  title={`${card.name} statement`}
                  onRead={(r) => applyReading(card.id, r)}
                  onClose={() => setReading(null)}
                />
              ) : null}
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="text-[12px] font-bold text-ink-500">
                  Paid to it ({currency})
                  <input
                    type="number"
                    step="any"
                    min={0}
                    inputMode="decimal"
                    value={entries[card.id].paid}
                    onChange={(e) => update(card.id, { paid: e.target.value })}
                    className={input}
                  />
                </label>
                <label className="text-[12px] font-bold text-ink-500">
                  New on it ({currency})
                  <input
                    type="number"
                    step="any"
                    min={0}
                    inputMode="decimal"
                    value={entries[card.id].newBorrowing}
                    onChange={(e) => update(card.id, { newBorrowing: e.target.value })}
                    className={input}
                    placeholder="0"
                  />
                </label>
                <label className="text-[12px] font-bold text-ink-500">
                  Balance now ({currency})
                  <input
                    required
                    type="number"
                    step="any"
                    min={0}
                    inputMode="decimal"
                    value={entries[card.id].balance}
                    onChange={(e) => update(card.id, { balance: e.target.value })}
                    className={input}
                  />
                </label>
              </div>
            </fieldset>
          ))}

          <label className="block text-[12px] font-bold text-ink-500">
            One line, in your words. What was this month like?
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={2}
              maxLength={600}
              className={input}
            />
          </label>

          <fieldset>
            <legend className="text-[12px] font-bold text-ink-500">How often do you want to do this</legend>
            <div className="mt-1.5 flex gap-2">
              {(
                [
                  ["payday", "Around payday"],
                  ["weekly", "Every week"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={chosenCadence === key}
                  onClick={() => setChosenCadence(key)}
                  className={`rounded-full border px-3 py-1 text-[12px] font-bold transition ${
                    chosenCadence === key
                      ? "border-ink-800 bg-ink-800 text-cream"
                      : "border-rule text-ink-500 hover:border-ink-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {error ? <p className="text-[13px] text-root">{error}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-ink-800 px-4 py-2.5 text-sm font-bold text-cream transition hover:bg-ink-700 disabled:opacity-60"
          >
            {busy ? "Saving" : "Save the review"}
          </button>
        </form>
      ) : null}

      {last ? (
        <div className="mt-4 border-t border-rule pt-4">
          <p className="text-[13px] text-ink-400">
            Last review ·{" "}
            {new Date(last.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
            <div>
              <dt className="label">Owed at the start</dt>
              <dd className="n mt-1 text-[16px] text-ink-900">{formatMoneyShort(last.openingDebt, currency)}</dd>
            </div>
            <div>
              <dt className="label">New on the cards</dt>
              <dd className={`n mt-1 text-[16px] ${last.newBorrowing > 0 ? "text-ink-900" : "text-ink-400"}`}>
                {formatMoneyShort(last.newBorrowing, currency)}
              </dd>
            </div>
            <div>
              <dt className="label">Came off the balance</dt>
              <dd className="n mt-1 text-[16px] text-stem-700">{formatMoneyShort(last.principalRepaid, currency)}</dd>
            </div>
            <div>
              <dt className="label">Went on interest</dt>
              <dd className="n mt-1 text-[16px] text-root">{formatMoneyShort(last.interestCharged, currency)}</dd>
            </div>
          </dl>
          {last.reflection ? (
            <p className="mt-3 text-[14px] leading-relaxed text-ink-700">&ldquo;{last.reflection}&rdquo;</p>
          ) : null}
          <p className="mt-2 text-[12px] text-ink-400">
            Debt-free date{" "}
            {last.debtFreeBefore === last.debtFreeAfter
              ? `held at ${last.debtFreeAfter}`
              : `moved from ${last.debtFreeBefore} to ${last.debtFreeAfter}`}
            .
          </p>
        </div>
      ) : (
        <p className="mt-4 text-[13px] leading-relaxed text-ink-400">
          No reviews yet. The first one takes about five minutes with the statements open.
        </p>
      )}
    </section>
  );
}
