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
};

export function PendingTransfers({
  transfers,
  currency,
}: {
  transfers: PendingTransfer[];
  currency: string;
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
      <p className="label">Waiting on you · from your talk with Ren</p>

      <div className="mt-4 space-y-5 divide-y divide-rule">
        {transfers.map((move) => {
          const nowBleed = move.amount * move.fromRate;
          const thenBleed = move.amount * move.monthlyRate;
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

              {move.note ? (
                <p className="mt-3 text-[13px] leading-relaxed text-ink-500">{move.note}</p>
              ) : null}

              <p className="mt-3 text-[12px] text-ink-400">
                Nothing has moved. Apply this once the bank has actually done it — {move.on}.
              </p>

              <div className="mt-3 flex items-center gap-3">
                <button
                  disabled={busy === move.id}
                  onClick={() => decide(move.id, "apply")}
                  className="rounded-full bg-stem-600 px-4 py-2 text-[13px] font-bold text-white transition hover:bg-stem-700 disabled:opacity-60"
                >
                  {busy === move.id ? "Working" : "The bank did it — apply"}
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
