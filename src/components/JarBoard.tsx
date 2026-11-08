"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Jar } from "@/components/Jar";
import { planMoney, savePlanChange } from "@/lib/plan";

export type JarRow = { id: string; name: string; purpose: string; target: number; saved: number; pct: number; remaining: number; monthsToFull: number | null; stage: "seed" | "sprout" | "sapling" | "grown" };
type Panel = "new" | { id: string; kind: "add" | "manage" | "remove" } | null;
const button = "min-h-11 rounded-full border border-rule px-4 py-2 text-[14px] font-bold disabled:opacity-50";
const input = "mt-2 min-h-12 w-full rounded-card border border-rule bg-cream px-3 text-[16px] outline-none focus:border-stem";

export function JarBoard({ jars, currency, starterTarget, readOnly = false }: { jars: JarRow[]; currency: string; starterTarget: number; readOnly?: boolean }) {
  const router = useRouter();
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [born, setBorn] = useState<string | null>(null);
  const selected = panel && typeof panel === "object" ? jars.find((jar) => jar.id === panel.id) : null;
  const money = (value: number) => planMoney(value, currency);
  useEffect(() => {
    if (!born) return;
    const timer = setTimeout(() => setBorn(null), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1100 : 2100);
    return () => clearTimeout(timer);
  }, [born]);
  function open(next: Panel) { setPanel(next); setAmount(""); setName(""); setTarget(""); setError(null); }
  async function write(url: string, method: "POST" | "DELETE", data?: unknown, newName?: string) {
    if (readOnly || pending.current) return;
    pending.current = true; setBusy(true); setError(null);
    try { await savePlanChange(url, method, data); setPanel(null); if (newName) setBorn(newName); router.refresh(); }
    catch { setError("That didn't save. Your figures are still here. Try again."); }
    finally { pending.current = false; setBusy(false); }
  }
  function create(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !Number.isFinite(Number(target)) || Number(target) <= 0) { setError("Add a name and a target greater than zero."); return; }
    void write("/api/jars", "POST", { name: name.trim(), purpose: "planned", target: Number(target) }, name.trim());
  }
  function record(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || !panel || typeof panel !== "object") return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || (panel.kind === "manage" && value > selected.saved)) { setError(panel.kind === "manage" ? "Add an amount up to what's in this jar." : "Add an amount greater than zero."); return; }
    void write(`/api/jars/${encodeURIComponent(selected.id)}/deposit`, "POST", { amount: panel.kind === "manage" ? -value : value, note: panel.kind === "manage" ? "Taken out, recorded in Plan" : "Added, recorded in Plan" });
  }
  return <section className="rounded-card border border-rule bg-card p-5"><h2 className="label">What you&apos;re building up</h2><p className="mt-2 text-[14px] leading-relaxed text-ink-400">One month of the basics comes first. That&apos;s the cushion that means the next surprise doesn&apos;t go on a card.</p>
    {born ? <div role="status" className="mt-4 rounded-card bg-leaf-50 p-5 text-center"><Jar pct={0} stage="seed" className="mx-auto w-20" /><p className="mt-3 text-[21px] font-bold">{born}</p><p className="mt-1 text-[14px]">Your jar has started.</p><button className={button} onClick={() => setBorn(null)}>Continue</button></div> : null}
    {!jars.length && panel !== "new" ? <div className="mt-5 text-center"><Jar pct={0} stage="seed" className="mx-auto w-16" /><h3 className="mt-3 text-[19px] font-bold">No jar yet</h3><p className="mt-2 text-[14px] text-ink-400">Start with a cushion of {money(starterTarget)}. You can choose a different target when starting a jar.</p><button className={`mt-4 ${button} bg-ink-800 text-cream`} disabled={readOnly || busy} onClick={() => void write("/api/jars", "POST", { name: "One month buffer", purpose: "emergency", target: starterTarget }, "One month buffer")}>Start the jar</button></div> : null}
    <div className="mt-4 divide-y divide-rule">{jars.map((jar) => <article key={jar.id} className="flex gap-4 py-5 first:pt-0"><Jar pct={jar.pct} stage={jar.stage} className="w-14 shrink-0 self-start" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="text-[17px] font-bold">{jar.name}</h3><button className={`${button} shrink-0 px-3 text-[12px]`} aria-label={`Manage ${jar.name}`} disabled={readOnly || busy} onClick={() => open({ id: jar.id, kind: "manage" })}>Manage</button></div><p className="n mt-1 text-[17px]"><b>{money(jar.saved)}</b> <span className="text-[13px] text-ink-400">of {money(jar.target)}</span></p><div className="mt-2 h-2 overflow-hidden rounded-full bg-leaf-100" role="progressbar" aria-label={jar.name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(0, Math.min(100, Math.round(jar.pct)))}><div className="h-full rounded-full bg-stem-600" style={{ width: `${Math.max(0, Math.min(100, jar.pct))}%` }} /></div><p className="mt-2 text-[13px] text-ink-400">{jar.remaining <= 0 ? "This one is full. Nicely done." : `${money(jar.remaining)} more fills it.`}</p>{jar.remaining > 0 ? <button className={`mt-3 ${button}`} disabled={readOnly || busy} onClick={() => open({ id: jar.id, kind: "add" })}>Add money</button> : null}</div></article>)}</div>
    {jars.length > 0 || panel !== "new" ? <button className={`mt-4 w-full ${button}`} disabled={readOnly || busy} onClick={() => open("new")}>Start another jar</button> : null}
    {panel === "new" ? <form onSubmit={create} className="mt-5 space-y-4 border-t border-rule pt-5"><h3 className="text-[22px] font-bold">Start a jar</h3><label className="block text-[14px] font-bold">What it&apos;s for<input className={input} value={name} onChange={(event) => setName(event.target.value)} placeholder="Eid gifts on purpose" disabled={busy} /></label><label className="block text-[14px] font-bold">Target ({currency})<input className={input} inputMode="decimal" value={target} onChange={(event) => setTarget(event.target.value)} disabled={busy} /></label><button className={`${button} bg-ink-800 text-cream`} disabled={busy || readOnly}>{busy ? "Saving" : "Start the jar"}</button><button type="button" className={button} disabled={busy} onClick={() => open(null)}>Cancel</button></form> : null}
    {selected && panel && typeof panel === "object" ? <div className="mt-5 border-t border-rule pt-5"><h3 className="text-[22px] font-bold">{panel.kind === "add" ? "Add to" : panel.kind === "remove" ? "Remove" : "Manage"} {selected.name}</h3>{panel.kind === "remove" ? <><p className="mt-2 text-[14px] text-ink-400">What&apos;s in it stays yours. Only the jar goes.</p><button className={`mt-3 ${button}`} disabled={busy || readOnly} onClick={() => void write(`/api/jars/${encodeURIComponent(selected.id)}`, "DELETE")}>Yes, remove the jar</button></> : <form onSubmit={record} className="mt-3 space-y-3"><p className="text-[13px] text-ink-400">{panel.kind === "add" ? "This records it. You move the money yourself." : `Target: ${money(selected.target)}. You don't need a reason to take money out. Life happens.`}</p>{panel.kind === "add" ? <div className="flex flex-wrap gap-2">{[100, 250, 500].map((value) => <button type="button" key={value} className={button} disabled={busy} onClick={() => setAmount(String(value))}>{money(value)}</button>)}</div> : null}<label className="block text-[14px] font-bold">{panel.kind === "add" ? "Amount" : "Take money out"} ({currency})<input className={input} inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={busy} /></label><button className={`${button} bg-ink-800 text-cream`} disabled={busy || readOnly}>{busy ? "Saving" : panel.kind === "add" ? "Add" : "Record withdrawal"}</button>{panel.kind === "manage" ? <button type="button" className={button} disabled={busy || readOnly} onClick={() => open({ id: selected.id, kind: "remove" })}>Remove this jar</button> : null}</form>}<button className={`mt-3 ${button}`} disabled={busy} onClick={() => open(null)}>{panel.kind === "remove" ? "Keep it" : "Cancel"}</button></div> : null}
    {error ? <p role="alert" className="mt-3 text-[14px] text-root">{error}</p> : null}
  </section>;
}
