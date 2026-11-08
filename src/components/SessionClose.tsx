"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RenOrb } from "@/components/RenOrb";
import { keepRenStep, wordsToKeep } from "@/lib/ren";

export function SessionClose({ commitment, saidByYou = [], readOnly = false }: {
  commitment: { wish: string; trigger: string } | null;
  saidByYou?: string[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const explored = wordsToKeep(saidByYou);
  const [wish, setWish] = useState(explored ?? "");
  const [trigger, setTrigger] = useState("");
  const [saved, setSaved] = useState<{ wish: string; trigger: string } | null>(null);
  const [left, setLeft] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const existing = saved ?? commitment;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (readOnly || busy) return;
    setBusy(true);
    setError(null);
    try {
      await keepRenStep(wish, trigger);
      setSaved({ wish: wish.trim(), trigger: trigger.trim() });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That didn't save. Your words are still here.");
    } finally {
      setBusy(false);
    }
  }

  const nothing = !existing && (left || !explored);
  return (
    <section className="rounded-card bg-ink-800 p-5 text-cream shadow-sh-3" data-ren-state={existing ? "end-kept" : nothing ? "end-nothing" : "end-words"}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-cream/65">End of the call · Ren, your AI coach</p>
      <RenOrb small />
      <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-widest text-leaf-300">{existing ? "That's the one" : nothing ? "Nothing to carry" : "In your words"}</p>
      <h2 className="mt-3 text-center text-[26px] font-bold leading-tight">{existing ? "One thing, chosen by you." : nothing ? "Thinking out loud counts too." : <>“{explored}”</>}</h2>
      {existing ? <><p className="mt-5 text-[19px] font-bold">{existing.wish}</p>{existing.trigger ? <p className="mt-2 text-[14px] text-cream/70">{existing.trigger}</p> : null}<p className="mt-4 text-[14px] text-cream/70">It shows up on Today. Ren can ask how it went. No wrong answer.</p></> : nothing ? <p className="mt-4 text-center text-[15px] leading-relaxed text-cream/70">No commitment from this one. There&rsquo;s nothing to do after it.</p> : <><p className="mt-4 text-center text-[14px] text-cream/70">Worth keeping? Nothing is saved unless you choose it.</p><form onSubmit={save} className="mt-5 space-y-4"><label className="block text-[13px] font-bold" htmlFor="ren-wish">In your words</label><textarea id="ren-wish" value={wish} onChange={(event) => setWish(event.target.value)} rows={3} disabled={busy || readOnly} className="w-full rounded-card border border-white/20 bg-white/10 p-3 text-[16px] text-cream outline-none focus:border-leaf-300" /><label className="block text-[13px] font-bold" htmlFor="ren-when">When (optional)</label><input id="ren-when" value={trigger} onChange={(event) => setTrigger(event.target.value)} disabled={busy || readOnly} className="min-h-12 w-full rounded-full border border-white/20 bg-white/10 px-4 text-[16px] text-cream outline-none focus:border-leaf-300" />{error ? <p role="alert" className="text-[14px] text-leaf-300">{error}</p> : null}<button disabled={busy || readOnly || !wish.trim()} className="min-h-12 w-full rounded-full bg-leaf-300 px-5 text-[16px] font-bold text-ink-900 disabled:opacity-50">{busy ? "Saving" : "Keep this"}</button><button type="button" disabled={busy} onClick={() => setLeft(true)} className="min-h-11 w-full text-[14px] font-bold text-cream/70">Actually, nothing to carry</button></form></>}
      {nothing || existing ? <Link href="/dashboard" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-leaf-300 px-5 text-[16px] font-bold text-ink-900">Back to Today</Link> : null}
    </section>
  );
}
