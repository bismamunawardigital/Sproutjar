"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout } from "lucide-react";

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

const STAGE_COPY: Record<JarRow["stage"], string> = {
  seed: "Seed",
  sprout: "Sprouting",
  sapling: "Sapling",
  grown: "Grown",
};

export function JarBoard({ jars, currency }: { jars: JarRow[]; currency: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  const money = (value: number) =>
    `${currency} ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

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
    <div className="rounded-2xl border border-sand bg-cream p-6">
      <h3 className="font-display text-xl font-semibold">Jars</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
        One month of essentials fills first. Everything after that goes at the cards.
      </p>

      <div className="mt-5 space-y-4">
        {jars.map((jar) => (
          <div key={jar.id} className="rounded-xl border border-sand bg-white/60 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 font-medium">
                  <Sprout size={16} className="text-moss" />
                  {jar.name}
                </p>
                <p className="mt-0.5 text-sm text-ink-soft">
                  {money(jar.saved)} of {money(jar.target)} · {STAGE_COPY[jar.stage]}
                </p>
              </div>
              <span className="font-display text-2xl font-semibold text-moss">{jar.pct}%</span>
            </div>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-sand">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sprout to-moss transition-all duration-700"
                style={{ width: `${jar.pct}%` }}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {[100, 250, 500].map((amount) => (
                <button
                  key={amount}
                  disabled={pending === jar.id}
                  onClick={() => deposit(jar.id, amount)}
                  className="rounded-full border border-bark/15 px-3.5 py-1.5 text-sm transition hover:border-moss hover:text-moss disabled:opacity-50"
                >
                  +{money(amount)}
                </button>
              ))}
              {jar.monthsToFull !== null && jar.remaining > 0 ? (
                <span className="ml-auto text-xs text-ink-soft">
                  Full in {jar.monthsToFull} month{jar.monthsToFull === 1 ? "" : "s"} at this rate
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
