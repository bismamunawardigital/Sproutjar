"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { planMoney, savePlanChange } from "@/lib/plan";

type Option = { key: "snowball" | "avalanche"; title: string; months: number; interest: number; blurb: string; date?: string };

export function StrategyPicker({ current, options, currency, readOnly = false }: { current: Option["key"]; options: Option[]; currency: string; readOnly?: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function choose(strategy: Option["key"]) {
    if (strategy === current || saving || readOnly) return;
    setSaving(true); setError(null);
    try { await savePlanChange("/api/profile", "PATCH", { strategy }); router.refresh(); }
    catch { setError("That didn't save. Your current order is unchanged. Try again."); }
    finally { setSaving(false); }
  }
  return <div><p className="mt-2 text-[14px] leading-relaxed text-ink-400">It&apos;s the same money either way. One clears a card sooner, the other saves you more. Pick whichever you&apos;ll actually stick to.</p><div role="radiogroup" aria-label="Which card goes first" className="mt-4 grid gap-3">
    {options.map((option) => <button key={option.key} role="radio" aria-checked={current === option.key} onClick={() => void choose(option.key)} disabled={saving || readOnly} className={`min-h-11 rounded-card border p-4 text-left disabled:opacity-70 ${current === option.key ? "border-stem bg-leaf-50" : "border-rule bg-cream"}`}><span className="flex items-center justify-between gap-2 text-[15px] font-bold">{option.title}{current === option.key ? <span className="chip c-grow">Your pick</span> : null}</span><span className="mt-1 block text-[13px] text-ink-500">{option.blurb}</span><span className="n mt-2 block text-[14px]">{option.months > 0 && option.months < 600 ? `${option.date ?? option.months + " months"} · ${planMoney(option.interest, currency)} in interest · Estimated` : "No date yet on these numbers."}</span></button>)}
  </div>{error ? <p role="alert" className="mt-3 text-[13px] text-root">{error}</p> : null}</div>;
}
