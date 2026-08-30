"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const money = (value: number) =>
    `${currency} ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

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
    <div className="rounded-2xl border border-sand bg-cream p-6">
      <h3 className="font-display text-xl font-semibold">Two honest routes</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
        Same money, different order. Snowball wins arrive sooner; avalanche costs less.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const active = option.key === current;
          return (
            <button
              key={option.key}
              onClick={() => choose(option.key)}
              disabled={saving}
              className={`rounded-xl border p-5 text-left transition disabled:opacity-60 ${
                active ? "border-moss bg-moss/8" : "border-sand bg-white/60 hover:border-moss/40"
              }`}
            >
              <p className="flex items-center justify-between font-medium">
                {option.title}
                {active ? (
                  <span className="rounded-full bg-moss px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Chosen
                  </span>
                ) : null}
              </p>
              <p className="mt-3 font-display text-2xl font-semibold">
                {option.months} months
              </p>
              <p className="mt-1 text-sm text-ink-soft">{money(option.interest)} in interest</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{option.blurb}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
