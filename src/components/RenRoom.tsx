"use client";

import type { Agenda } from "@/lib/agendas";
import { RenOrb } from "@/components/RenOrb";

export const CALL_INTENTS = [
  { key: "clarity", label: "Clarity" }, { key: "decision", label: "A decision" },
  { key: "plan", label: "A plan" }, { key: "space", label: "Space to think" },
] as const;

export function RenRoom({ userName, agenda, agendas, onAgenda, intent, onIntent, quiet, onQuiet, typed, onTyped, onStart, guest = false, error, connecting = false }: {
  userName: string; agenda: Agenda | null; agendas: Agenda[]; onAgenda: (agenda: Agenda) => void;
  intent: string | null; onIntent: (intent: string) => void; quiet: boolean; onQuiet: () => void;
  typed: boolean; onTyped: () => void; onStart: () => void; guest?: boolean; error?: string | null; connecting?: boolean;
}) {
  const minutes = agenda?.minutes ?? 20;
  return (
    <div className="space-y-5" data-ren-state="room">
      <section className="rounded-card bg-ink-800 px-5 pb-6 pt-3 text-center text-cream shadow-sh-3">
        <RenOrb />
        <p className="text-[11px] font-bold uppercase tracking-widest text-leaf-300">Ren · Your AI voice coach</p>
        <p className="mt-3 text-[12px] text-cream/65">{minutes} minutes · your call</p>
        <h2 className="mx-auto mt-2 max-w-xs text-[26px] font-bold leading-tight">Nothing to prepare{userName ? `, ${userName.split(" ")[0]}` : ""}. Just talk.</h2>
        {guest ? <a href="/demo/exit" className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-leaf-300 px-5 py-3 text-[16px] font-bold text-ink-900">Start your own plan with Ren</a> : (
          <button onClick={onStart} disabled={connecting} className="mt-5 min-h-12 w-full rounded-full bg-leaf-300 px-5 py-3 text-[16px] font-bold text-ink-900 disabled:opacity-50">{typed ? "Write to Ren" : "Call Ren"}<span className="ml-2 text-[13px] font-normal">{minutes} min</span></button>
        )}
        <p className="mt-3 text-[12px] text-cream/65">{guest ? "Read-only demo · hear a sample below" : "You decide when to end the call."}</p>
      </section>
      {error ? <section role="alert" className="rounded-card border border-rule bg-card p-5"><h3 className="font-bold text-ink-900">The call couldn&rsquo;t continue.</h3><p className="mt-2 text-[14px] text-ink-600">{error}</p><p className="mt-2 text-[13px] text-ink-400">Try again above, or choose Type instead. Your plan hasn&rsquo;t changed.</p></section> : null}
      <section>
        <p className="label">Ren would raise</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
          {agendas.map((choice) => <button key={choice.id} onClick={() => onAgenda(choice)} disabled={guest} aria-pressed={choice.id === agenda?.id} className={`min-h-11 shrink-0 rounded-full border px-4 py-2 text-[13px] font-bold disabled:opacity-50 ${choice.id === agenda?.id ? "border-stem bg-stem text-white" : "border-rule bg-card text-ink-600"}`}>{choice.title}<span className="ml-2 font-normal">{choice.minutes} min</span></button>)}
        </div>
        <p className="mt-1 text-[14px] leading-relaxed text-ink-500">{agenda?.reason.split("\n")[0] ?? "Tell Ren where you want to start."}</p>
      </section>
      <section className="rounded-card border border-rule bg-card p-5">
        <h3 className="text-[17px] font-bold text-ink-900">What would make these {minutes} minutes worth it?</h3>
        <div className="mt-3 flex flex-wrap gap-2">{CALL_INTENTS.map((choice) => <button key={choice.key} onClick={() => onIntent(choice.key)} disabled={guest} aria-pressed={intent === choice.key} className={`min-h-11 rounded-full border px-4 py-2 text-[13px] font-bold disabled:opacity-50 ${intent === choice.key ? "border-stem bg-stem text-white" : "border-rule text-ink-600"}`}>{choice.label}</button>)}</div>
        <p className="mt-2 text-[13px] text-ink-400">{intent ? "Ren will open there." : "Optional. Ren will ask if you skip it."}</p>
        <div className="mt-4 space-y-3 border-t border-rule pt-4">
          <Mode label={quiet ? "Quiet mode on" : "Somewhere public? Quiet mode"} note="You whisper. Ren writes back instead of speaking." checked={quiet} onClick={onQuiet} disabled={guest} />
          <Mode label={typed ? "Typing, no mic" : "Type instead"} note="Same Ren, same memory. You write, Ren writes back." checked={typed} onClick={onTyped} disabled={guest} />
        </div>
      </section>
    </div>
  );
}

function Mode({ label, note, checked, onClick, disabled }: { label: string; note: string; checked: boolean; onClick: () => void; disabled: boolean }) {
  return <button role="switch" aria-checked={checked} onClick={onClick} disabled={disabled} className="flex min-h-12 w-full items-center justify-between gap-4 text-left disabled:opacity-50"><span><span className="block text-[14px] font-bold text-ink-900">{label}</span><span className="mt-1 block text-[12px] text-ink-400">{note}</span></span><span aria-hidden className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 ${checked ? "justify-end bg-stem" : "bg-rule"}`}><span className="h-4 w-4 rounded-full bg-white" /></span></button>;
}
