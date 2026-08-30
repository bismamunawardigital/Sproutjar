"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

  async function deposit(jarId: string, amount: number) {
    setPending(jarId);
    await fetch(`/api/jars/${jarId}/deposit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, note: "Added from dashboard" }),
    });
    setPending(null);
    router.refresh();
  }

  return (
    <section className="rounded-card border border-rule bg-card p-5 sm:p-6">
      <p className="label">Money you&rsquo;re putting aside</p>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-400">
        One month of the basics comes first. Without it, the next surprise goes straight back on a
        card.
      </p>

      <div className="mt-4 divide-y divide-rule">
        {jars.map((jar) => (
          <div key={jar.id} className="py-4 first:pt-0">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-[15px] font-bold text-ink-900">{jar.name}</p>
              <p className="n text-[17px] text-ink-900">{formatMoney(jar.saved, currency)}</p>
            </div>
            <p className="mt-0.5 text-[13px] text-ink-400">
              of <span className="n">{formatMoney(jar.target, currency)}</span> ·{" "}
              <span className="n">{jar.pct}%</span>
              {jar.remaining <= 0
                ? " · that one’s done"
                : jar.monthsToFull !== null
                  ? ` · done in ${jar.monthsToFull} month${jar.monthsToFull === 1 ? "" : "s"} if you keep this up`
                  : ` · ${formatMoney(jar.remaining, currency)} still to go`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
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
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
