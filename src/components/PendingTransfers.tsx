"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney, formatRate } from "@/lib/money";

export type PendingTransfer = {
  id: string;
  fromName: string;
  fromRate: number;
  toIssuer: string;
  toName: string;
  amount: number;
  monthlyRate: number;
  promoMonths: number;
  fee: number;
  revertRate: number;
  note: string;
  on: string;
  /** Where the terms came from, when Ren pulled them live from the bank's own page. */
  sourceUrl?: string;
  sourceTitle?: string;
  retrievedAt?: string;
  publishedPromoRate?: string;
  publishedPromoPeriod?: string;
  publishedRevertRate?: string;
  publishedFee?: string;
  publishedEarlySettlementFee?: string;
};

/**
 * A transfer only helps when four things are true at once. The card states
 * them as conditions to be met, not boxes already ticked: the first two are
 * arithmetic, the last two are the person's.
 */
function conditionsFor(move: PendingTransfer, monthlyAttack: number, currency: string) {
  const months = Math.max(1, move.promoMonths);
  // Fee spread across the promo period and added to the promo rate.
  const effectiveMonthly = move.monthlyRate + (move.amount > 0 ? move.fee / move.amount / months : 0);
  const clearsInTime = monthlyAttack > 0 && move.amount / monthlyAttack <= months;
  const neededPerMonth = move.amount / months;
  return {
    effectiveMonthly,
    items: [
      {
        met: effectiveMonthly < move.fromRate,
        text: `Cheaper after the fee: ${formatRate(effectiveMonthly)} all in, against ${formatRate(
          move.fromRate,
        )} now`,
      },
      {
        met: clearsInTime,
        text: clearsInTime
          ? `Clears before the ${months} months are up at your current monthly amount`
          : `Needs about ${formatMoney(neededPerMonth, currency)} a month on it to clear before the ${months} months are up`,
      },
      { met: null, text: `Nothing new goes on ${move.fromName} or the new card while it runs` },
      { met: null, text: `${move.fromName} comes out of the wallet, or the limit comes down` },
    ],
  };
}

export function PendingTransfers({
  transfers,
  currency,
  monthlyAttack,
}: {
  transfers: PendingTransfer[];
  currency: string;
  monthlyAttack: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  if (transfers.length === 0) return null;

  async function decide(id: string, action: "apply" | "discard") {
    setBusy(id);
    await fetch(`/api/proposals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <section className="rounded-card border border-stem/30 bg-card p-5 sm:p-6">
      <p className="label">Explored with Ren · still a proposal</p>

      <div className="mt-4 space-y-5 divide-y divide-rule">
        {transfers.map((move) => {
          const nowBleed = move.amount * move.fromRate;
          const thenBleed = move.amount * move.monthlyRate;
          const conditions = conditionsFor(move, monthlyAttack, currency);
          const retrieved = move.retrievedAt ? new Date(move.retrievedAt) : null;
          return (
            <div key={move.id} className="pt-5 first:pt-0">
              <p className="text-[15px] font-bold leading-snug text-ink-900">
                Move <span className="n">{formatMoney(move.amount, currency)}</span> from{" "}
                {move.fromName} to {move.toIssuer}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-400">
                {formatRate(move.monthlyRate)} for {move.promoMonths} months
                {move.fee > 0 ? (
                  <>
                    {" · "}
                    <span className="n">{formatMoney(move.fee, currency)}</span> fee up front
                  </>
                ) : null}
                {move.revertRate > 0 ? (
                  <> · then back to {formatRate(move.revertRate)}</>
                ) : null}
              </p>

              <dl className="mt-3 grid grid-cols-2 gap-3 rounded-sm bg-cream px-4 py-3">
                <div>
                  <dt className="label">Interest now</dt>
                  <dd className="n mt-1 text-[17px] text-root">
                    {formatMoney(nowBleed, currency)}
                    <span className="ml-1 text-[12px] font-normal text-ink-400">/mo</span>
                  </dd>
                </div>
                <div>
                  <dt className="label">While the promo runs</dt>
                  <dd className="n mt-1 text-[17px] text-stem-700">
                    {formatMoney(thenBleed, currency)}
                    <span className="ml-1 text-[12px] font-normal text-ink-400">/mo</span>
                  </dd>
                </div>
              </dl>

              <p className="label mt-4">Only worth it if all four hold</p>
              <ul className="mt-2 space-y-2">
                {conditions.items.map((c) => (
                  <li key={c.text} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-700">
                    <span
                      aria-hidden
                      className={`mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full border ${
                        c.met === true
                          ? "border-stem-600 bg-stem-600"
                          : c.met === false
                            ? "border-ink-300 bg-transparent"
                            : "border-ink-300 bg-cream"
                      }`}
                    />
                    <span>
                      {c.text}
                      {c.met === null ? (
                        <span className="text-ink-400"> · yours to keep</span>
                      ) : c.met ? (
                        <span className="text-stem-700"> · holds</span>
                      ) : (
                        <span className="text-ink-400"> · doesn&rsquo;t yet</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              {move.note ? (
                <p className="mt-3 text-[13px] leading-relaxed text-ink-500">{move.note}</p>
              ) : null}

              {move.sourceUrl ? (
                <div className="mt-3 rounded-sm border border-rule px-4 py-3 text-[12px] leading-relaxed text-ink-500">
                  <p className="font-bold text-ink-700">What the bank publishes</p>
                  <p className="mt-1">
                    {[
                      move.publishedPromoRate ? `${move.publishedPromoRate} promo rate` : null,
                      move.publishedPromoPeriod ? `for ${move.publishedPromoPeriod}` : null,
                      move.publishedFee ? `${move.publishedFee} fee` : null,
                      move.publishedRevertRate ? `then ${move.publishedRevertRate}` : null,
                      move.publishedEarlySettlementFee
                        ? `${move.publishedEarlySettlementFee} early settlement`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Terms as read from the bank's page."}
                  </p>
                  <p className="mt-1">
                    <a
                      href={move.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-stem-700 underline decoration-stem/40 underline-offset-2 hover:decoration-stem"
                    >
                      {move.sourceTitle ?? new URL(move.sourceUrl).hostname}
                    </a>
                    {retrieved ? (
                      <>
                        {" · read "}
                        {retrieved.toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </>
                    ) : null}
                    . Banks change these; check the page before you apply.
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-[12px] leading-relaxed text-ink-400">
                  These terms are what was said on the call, not read from the bank&rsquo;s page.
                  Check them with the bank before you apply.
                </p>
              )}

              <p className="mt-3 text-[12px] text-ink-400">
                Nothing has moved. Apply this once the bank has actually done it. Proposed {move.on}.
              </p>

              <div className="mt-3 flex items-center gap-3">
                <button
                  disabled={busy === move.id}
                  onClick={() => decide(move.id, "apply")}
                  className="rounded-full bg-stem-600 px-4 py-2 text-[13px] font-bold text-white transition hover:bg-stem-700 disabled:opacity-60"
                >
                  {busy === move.id ? "Working" : "The bank did it, apply"}
                </button>
                <button
                  disabled={busy === move.id}
                  onClick={() => decide(move.id, "discard")}
                  className="text-[13px] font-bold text-ink-300 transition hover:text-ink-500 disabled:opacity-60"
                >
                  Not doing this
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
