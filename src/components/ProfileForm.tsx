"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/money";

export function ProfileForm({
  name,
  country,
  monthlyIncome,
  monthlyEssentials,
  currency,
}: {
  name: string;
  country: string;
  monthlyIncome: number;
  monthlyEssentials: number;
  currency: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name,
    country,
    monthlyIncome: String(monthlyIncome),
    monthlyEssentials: String(monthlyEssentials),
  });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const surplus = Math.max(0, Number(form.monthlyIncome) - Number(form.monthlyEssentials));

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        country: form.country,
        monthlyIncome: Number(form.monthlyIncome),
        monthlyEssentials: Number(form.monthlyEssentials),
      }),
    });
    setBusy(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={save}>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-[12px] font-bold text-ink-500">
          Name
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-sm border border-rule bg-cream px-3 py-2 text-[15px] text-ink-800 outline-none focus:border-stem"
          />
        </label>
        <label className="text-[12px] font-bold text-ink-500">
          Where you live
          <select
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className="mt-1 w-full rounded-sm border border-rule bg-cream px-3 py-2 text-[15px] text-ink-800 outline-none focus:border-stem"
          >
            {Object.values(COUNTRIES).map((option) => (
              <option key={option.code} value={option.code}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[12px] font-bold text-ink-500">
          What comes in each month ({currency})
          <input
            inputMode="decimal"
            value={form.monthlyIncome}
            onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })}
            className="mt-1 w-full rounded-sm border border-rule bg-cream px-3 py-2 text-[15px] text-ink-800 outline-none focus:border-stem"
          />
        </label>
        <label className="text-[12px] font-bold text-ink-500">
          What the basics cost ({currency})
          <input
            inputMode="decimal"
            value={form.monthlyEssentials}
            onChange={(e) => setForm({ ...form, monthlyEssentials: e.target.value })}
            className="mt-1 w-full rounded-sm border border-rule bg-cream px-3 py-2 text-[15px] text-ink-800 outline-none focus:border-stem"
          />
        </label>
      </div>

      <p className="mt-3 text-[13px] text-ink-400">
        That leaves{" "}
        <span className="n text-stem-700">
          {currency} {surplus.toLocaleString("en-US")}
        </span>{" "}
        a month to work with.
      </p>

      <button
        type="submit"
        disabled={busy}
        className="mt-4 rounded-full bg-ink-800 px-5 py-2.5 text-[14px] font-bold text-cream transition hover:bg-ink-700 disabled:opacity-60"
      >
        {busy ? "Saving" : saved ? "Saved" : "Save"}
      </button>
    </form>
  );
}
