"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import { Plant } from "@/components/Plant";
import { SessionLog } from "@/components/SessionLog";
import { RenContract } from "@/components/RenContract";
import type { Snapshot } from "@/lib/user";
import { planMoney, savePlanChange } from "@/lib/plan";
import { STORY_FIELDS } from "@/lib/you";

const card = "rounded-card border border-rule bg-card p-5";
const button = "flex min-h-12 w-full items-center justify-center rounded-full border border-rule px-4 py-3 text-[14px] font-bold text-ink-800 disabled:opacity-50";
type View = "home" | "edit" | "story" | "privacy" | "membership" | "language" | "install" | "ren";

export function YouScreen({ snap, readOnly = false, account }: { snap: Snapshot; readOnly?: boolean; account: ReactNode }) {
  const router = useRouter();
  const [tab, setTab] = useState<"story" | "numbers">("story");
  const [view, setView] = useState<View>("home");
  const [storyKey, setStoryKey] = useState<(typeof STORY_FIELDS)[number]["key"]>("moneyPurpose");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [view, tab]);
  const currency = snap.country.currency;
  const money = (value: number) => planMoney(value, currency);
  function go(next: View) { setError(null); setView(next); }
  async function saveStory(event: React.FormEvent) {
    event.preventDefault();
    if (readOnly || busy) return;
    setBusy(true); setError(null);
    try { await savePlanChange("/api/profile", "PATCH", { [storyKey]: draft.trim() }); router.refresh(); setView("home"); }
    catch { setError("That didn't save. Your words are still here. Try again."); }
    finally { setBusy(false); }
  }
  const titles: Record<View, string> = { home: "You", edit: "Edit what Ren works from", story: "In your words", privacy: "Your data and privacy", membership: "Membership", language: "Language", install: "Add to your phone", ren: "Ren and quiet mode" };
  const rows = [
    ["Take-home", money(snap.user.monthlyIncome)], ["Essentials", money(snap.user.monthlyEssentials)],
    ["Other commitments", money(snap.user.priorityObligations ?? 0)], ["Family support · protected", money(snap.user.remittances ?? 0)],
    ["Set aside for known costs", money(snap.user.sinkingFunds ?? 0)], ["Payday", snap.payday.day ? `Day ${snap.payday.day}` : "Not set"],
    ["To the cards", `${money(snap.attack.amount)} a month · ${snap.attack.source}`],
    ["Order", snap.strategy === "avalanche" ? "Highest rate first" : "Smallest balance first"],
    ["Review", snap.reviewCadence === "weekly" ? "Every week" : "Around payday"], ["Windfalls", snap.user.windfallRule || "No rule yet"],
  ];
  return <>
    {view !== "home" ? <button onClick={() => go("home")} className="min-h-11 text-[14px] font-bold text-stem-700">← Back to You</button> : null}
    <h1 className="text-[27px] font-bold tracking-tight text-ink-900">{titles[view]}</h1>
    {view === "home" ? <>
      <section className={card}>
        <div className="flex items-center gap-3"><span aria-hidden="true" className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-leaf-100 text-[21px] font-bold text-stem-700">{snap.user.name.trim().charAt(0) || "?"}</span><div className="min-w-0 flex-1"><h2 className="truncate text-[23px] font-bold text-ink-900">{snap.user.name}</h2><p className="text-[13px] text-ink-400">{snap.user.weeksActive > 0 ? `${snap.user.weeksActive} weeks in` : "Day one"} · {snap.country.name}</p></div><div className="w-12 shrink-0"><Plant state={snap.growth} /></div></div>
        <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-rule pt-4"><div><dt className="label">Paid off</dt><dd className="n mt-1 text-[20px] text-stem-700">{money(snap.cleared)}</dd></div><div><dt className="label">Set aside</dt><dd className="n mt-1 text-[20px] text-ink-900">{money(snap.totals.saved)}</dd></div></dl>
      </section>
      <div role="group" aria-label="You view" className="flex rounded-full border border-rule bg-card p-1">{(["story", "numbers"] as const).map((key) => <button key={key} aria-pressed={tab === key} onClick={() => setTab(key)} className={`min-h-11 flex-1 rounded-full px-2 py-2 text-[14px] font-bold ${tab === key ? "bg-ink-800 text-cream" : "text-ink-500"}`}>{key === "story" ? "Your story" : "Numbers & settings"}</button>)}</div>
      {tab === "story" ? <>
        {STORY_FIELDS.map((field) => <section key={field.key} className={card}><div className="flex items-start justify-between gap-3"><p className="label">{field.label}</p><button disabled={readOnly} aria-label={`Edit ${field.label.toLowerCase()}`} onClick={() => { setStoryKey(field.key); setDraft(snap.user[field.key] ?? ""); go("story"); }} className="-mr-2 -mt-2 flex min-h-11 min-w-11 items-center justify-center text-[14px] font-bold text-stem-700 disabled:opacity-40">Edit</button></div><p className={`mt-1 text-[18px] leading-snug ${snap.user[field.key] ? "font-semibold text-ink-900" : "text-ink-400"}`}>{snap.user[field.key] || "Nothing yet. It comes up on calls, or you can add it."}</p>{field.note ? <p className="mt-2 text-[13px] text-ink-400">{field.note}</p> : null}</section>)}
        <section className={card}><p className="label">Things you&apos;ve said out loud</p><p className="mt-2 text-[13px] text-ink-400">Naming one is most of the work. They&apos;re here so you can see whether they still hold.</p>{snap.beliefs.length ? snap.beliefs.map((belief) => <div key={belief.id} className="mt-4 border-l-2 border-leaf-300 pl-3"><p className="text-[16px] text-ink-900">&ldquo;{belief.text}&rdquo;</p><p className="mt-1 text-[12px] text-ink-400">{belief.namedOn.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p></div>) : <p className="mt-3 text-[14px] text-ink-400">Nothing yet.</p>}</section>
        {snap.sessions.length ? <section className={card}><p className="label">Your talks with Ren</p><p className="mt-2 text-[13px] text-ink-400">Saved summaries from your AI voice coach.</p><SessionLog sessions={snap.sessions.slice(0, 3).map((session) => { const step = session.commitments[0]; return { id: session.id, agenda: session.agenda, on: session.startedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), contract: session.contractChoice, minutes: session.plannedMinutes, reflection: session.closingReflection, commitment: step ? { wish: step.wish, ifThenPlan: step.ifThenPlan, trigger: step.trigger, status: step.status } : null }; })} /><Link className={button} href="/dashboard/ren">See saved talks with Ren</Link></section> : null}
      </> : <>
        <section className={card}><p className="label">What Ren works from</p><p className="mt-2 text-[13px] text-ink-400">Every number below is yours to correct. Ren is an AI voice coach, not a financial adviser.</p><dl className="mt-3 divide-y divide-rule">{rows.map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-3 text-[14px]"><dt className="text-ink-500">{label}</dt><dd className="max-w-[58%] text-right font-bold text-ink-900">{value}</dd></div>)}</dl><p className="my-3 text-[13px] text-ink-400">{snap.attack.source === "chosen" ? `Your own figure. The sums say ${money(snap.attack.derived)}.` : "Derived from salary, less essentials, commitments, protected family support and known costs."}</p><button onClick={() => go("edit")} className={button}>Edit what Ren works from</button></section>
        <section className={card}>{([["ren", "Ren and quiet mode", "Choose before each call"], ["language", "Language", "English"], ["install", "Add to your phone", "Keep it one tap away"], ["membership", "Membership", "Preview · placeholder prices"], ["privacy", "Your data and privacy", "Read it or delete it"]] as const).map(([next, title, note]) => <button key={next} onClick={() => go(next)} className="flex min-h-16 w-full items-center justify-between gap-3 border-b border-rule py-3 text-left last:border-0"><span><b className="text-[15px] text-ink-900">{title}</b><span className="mt-1 block text-[13px] text-ink-400">{note}</span></span><span aria-hidden="true">→</span></button>)}</section>
        {account}
        <p className="px-1 text-[12px] text-ink-400">Sproutjar is a coach, not a financial adviser. Sproutjar never moves money.</p>
      </>}
    </> : null}
    {view === "story" ? <form onSubmit={saveStory} className={`${card} space-y-4`}><label className="block text-[14px] font-bold text-ink-700">Ren works from what you write here<textarea maxLength={300} rows={5} value={draft} onChange={(event) => setDraft(event.target.value)} className="mt-2 w-full rounded-sm border border-rule bg-cream p-3 text-[16px]" /></label>{error ? <p role="alert" className="text-[14px] text-amber-900">{error}</p> : null}<button disabled={busy || readOnly} className={`${button} bg-ink-800 !text-cream`}>{busy ? "Saving" : "Save"}</button><button type="button" disabled={busy} onClick={() => go("home")} className={button}>Cancel</button></form> : null}
    {view === "edit" ? <section className={card}><ProfileForm key={snap.user.id} initial={{ ...snap.user, strategy: snap.strategy }} currency={currency} readOnly={readOnly} /></section> : null}
    {view === "ren" ? <><RenContract contracted compact /><section className={`${card} space-y-4`}><p className="text-[16px] text-ink-700">Quiet mode lets you whisper while Ren writes back instead of speaking. Typed mode needs no microphone.</p><p className="text-[14px] text-ink-400">Choose your mode in Ren before each call. It is not saved as an account preference.</p><Link href="/dashboard/ren" className={button}>Open Ren · AI voice coach</Link></section></> : null}
    {view === "language" ? <section className={`${card} space-y-3`}><button aria-pressed="true" className={button}>English · selected</button><button disabled className={button}><span lang="ar" dir="rtl">العربية</span> · Not available yet</button><p className="text-[13px] text-ink-400">Ren and the app currently use English.</p></section> : null}
    {view === "install" ? <section className={`${card} space-y-4`}><h2 className="text-[24px] font-bold text-ink-900">Keep it one tap away.</h2><p className="text-[15px] text-ink-700">In Chrome on Android, open the menu, choose Add to Home screen, then Install.</p><p className="text-[15px] text-ink-700">On iPhone, open Sproutjar in Safari, tap Share, then Add to Home Screen.</p><p className="text-[13px] text-ink-400">Availability depends on your browser. No approved store listing is linked yet.</p></section> : null}
    {view === "membership" ? <><section className={`${card} border-amber-300`}><p className="label">Membership preview</p><h2 className="mt-2 text-[24px] font-bold text-ink-900">A place to keep going.</h2><p className="mt-3 text-[15px] text-ink-600">Prices are placeholders. No billing, trial clock or checkout is active.</p></section><section className={card}><p className="label">Your cards, for comparison</p><p className="n mt-2 text-[24px] text-ink-900">{money(snap.plan.monthlyBleed)} / month</p><p className="mt-2 text-[13px] text-ink-400">Estimated interest at the saved rates. Membership does not lower your bank&apos;s interest.</p></section>{["Monthly", "Yearly"].map((period) => <section key={period} className={card}><h2 className="text-[18px] font-bold text-ink-900">{period}</h2><p className="mt-2 text-[24px] text-ink-900">{currency} —</p><p className="my-3 text-[13px] font-bold text-amber-900">Placeholder price · not for sale</p><button disabled className={button}>Checkout unavailable</button></section>)}</> : null}
    {view === "privacy" ? <><section className={card}><p className="label">What Sproutjar keeps</p><dl className="mt-3 space-y-4 text-[14px]">{[["Cards and jars", "The figures you confirmed"], ["Statements", "The extracted figures, not the file"], ["Ren", "Saved summaries and the words you keep"], ["Bank access", "None"]].map(([key, value]) => <div key={key} className="flex justify-between gap-4"><dt className="text-ink-500">{key}</dt><dd className="max-w-[60%] text-right font-bold text-ink-900">{value}</dd></div>)}</dl><p className="mt-4 text-[13px] text-ink-400">Call transcripts held by ElevenLabs follow the privacy policy. No per-talk removal or data download is available in this app yet.</p></section><div className="space-y-3"><Link href="/dashboard/ren" className={button}>Read saved talks</Link><Link href="/privacy" className={button}>Read the privacy policy</Link><Link href="/delete-public" className={button}>Account deletion and transcript requests</Link></div>{account}</> : null}
  </>;
}
