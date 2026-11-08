"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plant, type PlantState } from "@/components/Plant";
import { StatementImport, type StatementReading } from "@/components/StatementImport";
import { planMoney as formatMoney, planMoney as formatMoneyShort, planReviewEntry, planReviewSplit, savePlanChange, type PlanReviewEntry } from "@/lib/plan";

export type ReviewRow = {
  estimatedSplit?: boolean;
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

type Card = { id: string; name: string; balance: number; monthlyRate: number; reviewElapsedDays: number; minimumPayment: number; paidSinceReview?: number; reductionSinceReview?: number };

/**
 * The review is where the plan meets what happened. Four numbers, one per card
 * reading, one line in the person's own words, and the date recomputed. No
 * score, no streak: the numbers are the feedback.
 */
/** An empty date means the plan does not close yet (payments below the minimums). */
function dateLine(before: string, after: string): string {
  if (!after) return "No debt-free date yet: what goes to the cards is under the minimums.";
  if (!before) return `Debt-free date is now ${after}.`;
  return before === after ? `Debt-free date holds at ${after}.` : `Debt-free date was ${before}, now ${after}.`;
}

export function ReviewRitual({
  reviews,
  cards,
  cadence,
  currency,
  debtFreeOn,
  payday,
  growth,
  readOnly = false,
}: {
  readOnly?: boolean;
  growth?: PlantState;
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
  const [entries, setEntries] = useState<Record<string, PlanReviewEntry>>({});
  const [reflection, setReflection] = useState("");
  const [reading, setReading] = useState<string | null>(null);
  const [result, setResult] = useState<{ before: string; after: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const last = reviews[0] ?? null;
  const entryFor = (card: Card) => planReviewEntry(card, entries);
  const splitFor = (card: Card) => {
    const entry = entryFor(card);
    return planReviewSplit(card.balance + (card.reductionSinceReview ?? card.paidSinceReview ?? 0), Math.max(card.paidSinceReview ?? 0, Number(entry.paid || 0)), Number(entry.balance), card.monthlyRate, card.reviewElapsedDays, entry.newBorrowing.trim() ? Number(entry.newBorrowing) : undefined);
  };

  function update(id: string, patch: Partial<PlanReviewEntry>) {
    const card = cards.find((card) => card.id === id);
    if (!card) return;
    setEntries((prev) => ({ ...prev, [id]: { ...planReviewEntry(card, prev), ...patch } }));
  }

  function applyReading(id: string, r: StatementReading) {
    const card = cards.find((card) => card.id === id);
    if (!card) return;
    const current = entryFor(card);
    const balance = r.balance ?? Number(current.balance);
    const paid = Math.max(card.paidSinceReview ?? 0, r.paymentsReceived ?? Number(current.paid || 0));
    const opening = card.balance + (card.reductionSinceReview ?? card.paidSinceReview ?? 0);
    update(id, {
      balance: r.balance !== null ? String(r.balance) : (entries[id]?.balance ?? String(cards.find((card) => card.id === id)?.balance ?? "")),
      paid: r.paymentsReceived !== null ? String(r.paymentsReceived) : (entries[id]?.paid ?? ""),
      newBorrowing: r.newBorrowing !== null ? String(r.newBorrowing) : r.interestCharged !== null ? String(Math.max(0, balance - Math.max(0, opening - paid) - r.interestCharged)) : current.newBorrowing,
    });
    setReading(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (readOnly || busy) return;
    setBusy(true);
    setError(null);
    const body = {
      cadence: chosenCadence,
      reflection,
      entries: cards.map((c) => ({
        debtId: c.id,
        paid: Number(entryFor(c).paid || 0),
        ...(entryFor(c).newBorrowing.trim() ? { newBorrowing: Number(entryFor(c).newBorrowing) } : {}),
        balance: Number(entryFor(c).balance),
      })),
    };
    let json: { review: { debtFreeBefore: string; debtFreeAfter: string } | null };
    try { json = await savePlanChange("/api/reviews", "POST", body); }
    catch { setError("That didn't save. Your figures are still here. Check your connection and try again."); setBusy(false); return; }
    setBusy(false);
    setResult(
      json.review
        ? { before: json.review.debtFreeBefore, after: json.review.debtFreeAfter }
        : { before: debtFreeOn, after: debtFreeOn },
    );
    setOpen(false);
    setEntries({});
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
    "mt-1 min-h-11 w-full rounded-sm border border-rule bg-card px-3 py-2 text-[15px] text-ink-800 outline-none focus:border-stem";

  return (
    <section className="rounded-card border border-rule bg-card p-5 sm:p-6"><fieldset disabled={readOnly || busy} className="min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label">Your review</p>
          <p className="mt-1 text-[13px] text-ink-400">{when}</p>
        </div>
        {cards.length > 0 ? (
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="min-h-11 shrink-0 rounded-full border border-rule px-3.5 py-1.5 text-[13px] font-bold text-ink-700 transition hover:border-ink-300"
          >
            {open ? "Not now" : "Do this month's"}
          </button>
        ) : null}
      </div>

      {result ? (
        <div role="status" className="mt-4 rounded-card bg-leaf-50 p-5 text-center">
          {growth ? <Plant state={growth} className="mx-auto mb-4 w-24" /> : null}
          <h3 className="text-[22px] font-bold text-ink-900">Saved. Now you know where it stands.</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
            Estimated: {dateLine(result.before, result.after)} Ren has these numbers for next time.
          </p>
          <Link href="/dashboard" className="mt-3 inline-flex min-h-11 items-center font-bold text-stem-700">Back to Today</Link>
        </div>
      ) : null}

      {open ? (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <p className="text-[13px] leading-relaxed text-ink-500">
            One reading per card, off the statement or the app. Logged payments already count. Without a spending figure, the saved rate estimates interest for the days since this card&apos;s last reading; the rest is Estimated new spending. Check and edit the split against your statement.
          </p>

          {cards.map((card) => (
            <fieldset key={card.id} className="rounded-sm bg-cream p-4">
              <legend className="px-1 text-[14px] font-bold text-ink-900">{card.name}</legend>
              {(card.paidSinceReview ?? 0) > 0 ? <p className="mb-2 text-[13px] text-stem-700">{formatMoney(card.paidSinceReview!, currency)} logged since your last review</p> : null}
              <p className="text-[12px] text-ink-400">
                Last known <span className="n">{formatMoney(card.balance, currency)}</span>
                {" · "}
                <button
                  type="button"
                  onClick={() => setReading(reading === card.id ? null : card.id)}
                  className="min-h-11 font-bold text-stem-700 underline decoration-stem/40 underline-offset-2 hover:decoration-stem"
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
              <div className="mt-3"><label className="text-[12px] font-bold text-ink-500">
                  Balance now ({currency})
                  <input
                    required
                    type="number"
                    step="any"
                    min={0}
                    inputMode="decimal"
                    value={entryFor(card).balance}
                    onChange={(e) => update(card.id, { balance: e.target.value })}
                    className={input}
                  />
                </label><p className="mt-3 text-[13px] text-ink-500">{splitFor(card).estimatedSplit ? "Estimated split" : "Split"}: {formatMoney(splitFor(card).interestCharged, currency)} interest, {formatMoney(splitFor(card).newBorrowing, currency)} new spending. Edit new spending below to adjust the split.</p><label className="mt-3 block text-[12px] font-bold text-ink-500">New spending ({currency}, optional)<input type="number" step="any" min={0} inputMode="decimal" value={entryFor(card).newBorrowing} placeholder={String(Number(splitFor(card).newBorrowing.toFixed(3)))} onChange={(e) => update(card.id, { newBorrowing: e.target.value })} className={input} /></label><details className="mt-3"><summary className="flex min-h-11 cursor-pointer items-center text-[13px] font-bold text-ink-500">Payments (optional)</summary><p className="mb-3 text-[12px] text-ink-400">Logged payments already count. Fill this only to replace them with the statement total.</p><div><label className="text-[12px] font-bold text-ink-500">
                  Payments on the statement ({currency}, optional)
                  <input
                    type="number"
                    step="any"
                    min={0}
                    inputMode="decimal"
                    value={entryFor(card).paid}
                    onChange={(e) => update(card.id, { paid: e.target.value })}
                    className={input}
                  />
                </label></div></details></div>
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
                  className={`min-h-11 rounded-full border px-3 py-1 text-[12px] font-bold transition ${
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
            className="min-h-11 rounded-full bg-ink-800 px-4 py-2.5 text-sm font-bold text-cream transition hover:bg-ink-700 disabled:opacity-60"
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
          {last.estimatedSplit ? <p className="mt-2 text-[13px] text-ink-500">Estimated split for interest and new spending. Check these against your statement.</p> : null}
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
          <p className="mt-2 text-[12px] text-ink-400">Estimated: {dateLine(last.debtFreeBefore, last.debtFreeAfter)}</p>
        </div>
      ) : (
        <p className="mt-4 text-[13px] leading-relaxed text-ink-400">
          No reviews yet. The first one takes about five minutes with the statements open.
        </p>
      )}
    </fieldset></section>
  );
}
