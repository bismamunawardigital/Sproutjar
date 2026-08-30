"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatMoney } from "@/lib/money";

type Option = {
  key: "snowball" | "avalanche";
  title: string;
  months: number;
  interest: number;
  blurb: string;
};

export function StrategyPicker({
  current,
  options,
  currency,
}: {
  current: "snowball" | "avalanche";
  options: Option[];
  currency: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function choose(strategy: Option["key"]) {
    if (strategy === current) return;
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ strategy }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <section className="rounded-card border border-rule bg-card p-5 sm:p-6">
      <p className="label">The order you clear them in</p>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-400">
        Same money either way. One gets a card gone sooner, the other costs less. Neither is wrong.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const active = option.key === current;
          return (
            <button
              key={option.key}
              onClick={() => choose(option.key)}
              disabled={saving}
              aria-pressed={active}
              className={`rounded-card border p-4 text-left transition disabled:opacity-60 ${
                active ? "border-stem bg-leaf-50" : "border-rule bg-cream hover:border-ink-300"
              }`}
            >
              <p className="flex items-center justify-between gap-2 text-[15px] font-bold text-ink-900">
                {option.title}
                {active ? <span className="chip c-grow">Chosen</span> : null}
              </p>
              {option.months > 0 ? (
                <>
                  <p className="n mt-3 text-[22px] text-ink-900">{option.months} months</p>
                  <p className="mt-1 text-[13px] text-root">
                    <span className="n">{formatMoney(option.interest, currency)}</span> in interest
                  </p>
                </>
              ) : (
                <p className="mt-3 text-[15px] text-ink-400">
                  No timeline yet — the surplus doesn&rsquo;t cover the minimums.
                </p>
              )}
              <p className="mt-3 text-[13px] leading-relaxed text-ink-400">{option.blurb}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
