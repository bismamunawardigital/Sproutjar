"use client";

import { RenOrb } from "@/components/RenOrb";
import type { RenLine } from "@/lib/ren";
import type { Agenda } from "@/lib/agendas";

export type GlanceCard = { title: string; left_label: string; left_value: string; left_note?: string; right_label: string; right_value: string; right_note?: string; takeaway?: string };

export function RenCall({ agenda, minutes, elapsed, connecting, speaking, muted, quiet, typed, words, lines, level, glance, draft, onDraft, onSend, onStop, onMute, onQuiet, onWords, onHideGlance }: {
  agenda: Agenda | null; minutes: number; elapsed: number; connecting: boolean; speaking: boolean;
  muted: boolean; quiet: boolean; typed: boolean; words: boolean; lines: RenLine[]; level: number;
  glance: GlanceCard | null; draft: string; onDraft: (value: string) => void; onSend: () => void;
  onStop: () => void; onMute: () => void; onQuiet: () => void; onWords: () => void; onHideGlance: () => void;
}) {
  const transcript = words || quiet || typed;
  const writing = typed && !connecting;
  const state = connecting ? "Connecting to Ren" : typed ? speaking ? "Ren is writing" : "Ren is reading. Take your time." : muted ? "Your mic is off" : quiet ? speaking ? "Ren is answering below" : "Ren is listening. Whisper if you need to." : speaking ? "Ren is speaking" : "Ren is listening";
  return (
    <section role="dialog" aria-modal="true" aria-label={typed ? "Writing to Ren" : "Call with Ren"} className={`fixed inset-0 z-50 flex flex-col ${writing ? "bg-cream text-ink-900" : "bg-ink-800 text-cream"}`} data-ren-state={connecting ? "connecting" : typed ? "typing" : quiet ? "quiet" : "call"}>
      <header className="flex items-start justify-between gap-3 px-5 py-5">
        <div className="min-w-0"><p className={`text-[11px] font-bold uppercase tracking-widest ${writing ? "text-stem-700" : "text-leaf-300"}`}>Ren · Your AI voice coach</p><h2 className="mt-2 text-[14px] font-bold">{writing ? "Writing to Ren" : agenda?.title ?? "Open conversation"}</h2><p className={`mt-1 text-[12px] ${writing ? "text-ink-500" : "text-cream/60"}`}>{minutes} min · {agenda?.technique ?? "Your call"}</p></div>
        <span className={`n shrink-0 text-[13px] ${writing ? "text-ink-500" : "text-cream/70"}`}>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</span>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 text-center">
        {!writing ? <RenOrb small={transcript || !!glance} level={level} /> : null}
        <p role="status" className={`mt-3 text-[12px] font-bold uppercase tracking-wider ${writing ? "text-ink-500" : "text-cream/70"}`}>{state}</p>
        {connecting ? <p className="mx-auto mt-6 max-w-xs text-[16px] leading-relaxed text-cream/75">Take a breath. Nothing to get right here.</p> : transcript ? <div className="mx-auto mt-5 max-w-md space-y-3 text-left" aria-live="polite">{lines.map((line, index) => <p key={index} className={`rounded-card p-4 text-[15px] leading-relaxed ${writing ? line.role === "you" ? "ml-6 border border-leaf-300 bg-leaf-100 text-ink-900" : "mr-6 border border-rule bg-card text-ink-900" : line.role === "you" ? "ml-6 bg-white/5 text-cream/75" : "mr-6 bg-white/10 text-cream"}`}><span className={`mb-1 block text-[11px] font-bold ${writing ? "text-stem-700" : "text-leaf-300"}`}>{line.role === "ren" ? "Ren" : "You"}</span>{line.text}</p>)}</div> : <p aria-live="polite" className="mx-auto mt-7 max-w-md text-[25px] font-medium leading-snug">{lines.at(-1)?.text ?? "Take your time."}</p>}
        {glance ? <section className="mx-auto mt-5 max-w-md rounded-card bg-cream p-4 text-left text-ink-900"><div className="flex items-center justify-between gap-3"><h3 className="text-[14px] font-bold">{glance.title}</h3><button onClick={onHideGlance} className="min-h-11 min-w-11 text-[13px] font-bold">Hide</button></div><p className="text-[12px] text-ink-500">Estimated · a comparison, not a change to your plan.</p><div className="mt-3 grid grid-cols-2 gap-3">{[{ label: glance.left_label, value: glance.left_value, note: glance.left_note }, { label: glance.right_label, value: glance.right_value, note: glance.right_note }].map((side) => <div key={side.label} className="min-w-0 rounded-card border border-rule p-3"><p className="text-[12px] text-ink-500">{side.label}</p><p className="mt-1 break-words text-[18px] font-bold text-stem-700">{side.value}</p>{side.note ? <p className="mt-1 text-[12px] text-ink-500">{side.note}</p> : null}</div>)}</div>{glance.takeaway ? <p className="mt-3 text-[13px] text-ink-500">{glance.takeaway}</p> : null}</section> : null}
      </div>
      <footer className={`shrink-0 border-t px-5 pb-6 pt-3 ${writing ? "border-rule" : "border-white/10"}`}>
        {connecting ? <button onClick={onStop} className="min-h-12 w-full rounded-full border border-white/30 text-[14px] font-bold">Cancel</button> : typed ? <form onSubmit={(event) => { event.preventDefault(); onSend(); }}><label htmlFor="ren-typed" className="sr-only">Your message to Ren</label><div className="flex gap-2"><input id="ren-typed" value={draft} onChange={(event) => onDraft(event.target.value)} autoComplete="off" placeholder="Write to Ren" className="min-h-12 min-w-0 flex-1 rounded-full border border-rule bg-card px-4 text-ink-900 outline-none focus:border-stem-600" /><button disabled={!draft.trim()} className="min-h-12 rounded-full bg-leaf-300 px-5 text-[14px] font-bold text-ink-900 disabled:opacity-40">Send</button></div><button type="button" onClick={onStop} className="mt-3 min-h-11 w-full rounded-full bg-danger text-[14px] font-bold text-white">End call</button></form> : <div className="flex items-center justify-around gap-2"><Control onClick={onWords} pressed={words} label={words ? "Hide words" : "Words"} /><Control onClick={onMute} pressed={muted} label={muted ? "Unmute" : "Mute"} /><button onClick={onStop} className="min-h-14 rounded-full bg-danger px-4 text-[13px] font-bold text-white">End call</button><Control onClick={onQuiet} pressed={quiet} label="Quiet" /></div>}
      </footer>
    </section>
  );
}

function Control({ onClick, pressed, label }: { onClick: () => void; pressed: boolean; label: string }) {
  return <button onClick={onClick} aria-pressed={pressed} className="min-h-12 min-w-12 rounded-full border border-white/20 px-3 text-[12px] font-bold text-cream">{label}</button>;
}
