"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Jar } from "@/components/Jar";
import { formatMoney } from "@/lib/money";

export type JarRow = {
  id: string;
  name: string;
  purpose: string;
  target: number;
  saved: number;
  pct: number;
  remaining: number;
  monthsToFull: number | null;
  stage: "seed" | "sprout" | "sapling" | "grown";
};

export function JarBoard({ jars, currency }: { jars: JarRow[]; currency: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [custom, setCustom] = useState<Record<string, string>>({});

  async function deposit(jarId: string, amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    setPending(jarId);
    await fetch(`/api/jars/${jarId}/deposit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, note: "Added from the app" }),
    });
    setCustom((prev) => ({ ...prev, [jarId]: "" }));
    setPending(null);
    router.refresh();
  }

  return (
    <section className="rounded-card border border-rule bg-card p-5 sm:p-6">
      <p className="label">What you&rsquo;re building up</p>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-400">
        One month of the basics comes first. That&rsquo;s the cushion that means the next surprise
        doesn&rsquo;t go on a card.
      </p>

      <div className="mt-4 divide-y divide-rule">
        {jars.map((jar) => (
          <div key={jar.id} className="flex gap-4 py-5 first:pt-1">
            <Jar pct={jar.pct} stage={jar.stage} className="w-14 shrink-0" />

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[15px] font-bold text-ink-900">{jar.name}</p>
                <p className="n text-[17px] text-ink-900">{formatMoney(jar.saved, currency)}</p>
              </div>
              <p className="mt-0.5 text-[13px] text-ink-400">
                of <span className="n">{formatMoney(jar.target, currency)}</span> ·{" "}
                <span className="n">{jar.pct}%</span>
              </p>
              <p className="mt-0.5 text-[13px] text-stem-700">
                {jar.remaining <= 0
                  ? "This one is full — nicely done."
                  : jar.monthsToFull !== null
                    ? `Full in ${jar.monthsToFull} month${jar.monthsToFull === 1 ? "" : "s"} if you keep this up.`
                    : `${formatMoney(jar.remaining, currency)} more fills it.`}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {[100, 250, 500].map((amount) => (
                  <button
                    key={amount}
                    disabled={pending === jar.id}
                    onClick={() => deposit(jar.id, amount)}
                    className="rounded-full border border-rule px-3.5 py-1.5 text-[13px] font-bold text-ink-700 transition hover:border-stem disabled:opacity-50"
                  >
                    Add <span className="n">{amount}</span>
                  </button>
                ))}
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    deposit(jar.id, Number(custom[jar.id]));
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    inputMode="decimal"
                    value={custom[jar.id] ?? ""}
                    onChange={(event) =>
                      setCustom((prev) => ({ ...prev, [jar.id]: event.target.value }))
                    }
                    placeholder="Other"
                    aria-label={`Add another amount to ${jar.name}`}
                    className="w-20 rounded-full border border-rule bg-cream px-3 py-1.5 text-[13px] text-ink-800 outline-none focus:border-stem"
                  />
                  <button
                    type="submit"
                    disabled={pending === jar.id || !custom[jar.id]}
                    className="rounded-full bg-stem-600 px-3.5 py-1.5 text-[13px] font-bold text-white transition hover:bg-stem-700 disabled:opacity-40"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
