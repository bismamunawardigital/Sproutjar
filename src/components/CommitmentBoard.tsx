"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Plant, type PlantState } from "./Plant";
import { CHECKIN_ANSWERS, commitmentHeading, type CheckinAnswer } from "@/lib/today";

export type CommitmentRow = {
  id: string;
  wish: string;
  trigger: string;
  outcome: string;
  obstacle: string;
  ifThenPlan: string;
  dueAt: string | null;
  status: string;
};

export type LastCommitment = Omit<CommitmentRow, "id" | "dueAt">;

const button = "flex min-h-11 items-center justify-center rounded-full border border-rule px-4 py-3 text-[14px] font-bold hover:border-stem disabled:opacity-60";

export function CommitmentBoard({ commitments, last, growth, now, readOnly }: {
  commitments: CommitmentRow[];
  last: LastCommitment | null;
  growth: PlantState;
  now: string;
  readOnly: boolean;
}) {
  const router = useRouter();
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<CheckinAnswer | null>(null);
  const [grown, setGrown] = useState(growth);
  const commitment = commitments[0] ?? null;

  async function save(body: unknown, method: "POST" | "PATCH", onSaved: (data: { growth: PlantState }) => void) {
    if (pending.current || readOnly) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/commitments", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "That did not save. Try again.");
      onSaved(data);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That did not save. Try again.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  function mark(status: CheckinAnswer) {
    if (!commitment) return;
    void save({ id: commitment.id, status }, "PATCH", (data) => { setGrown(data.growth); setAnswer(status); });
  }

  function carryForward(source: LastCommitment) {
    void save({ wish: source.wish, trigger: source.trigger, outcome: source.outcome, obstacle: source.obstacle, ifThenPlan: source.ifThenPlan, days: 7 }, "POST", () => {});
  }

  if (answer) {
    const feedback = CHECKIN_ANSWERS[answer];
    return (
      <section className="space-y-4 rounded-card border border-rule bg-card p-5" data-checkin-state={`done-${answer}`} aria-live="polite">
        <Plant state={grown} className="mx-auto w-32" />
        <p className="text-center text-[18px] font-bold">A new root, for telling the truth.</p>
        <div className="rounded-card border border-rule p-4">
          <p className="label">Your next call</p>
          <h2 className="mt-1 text-[19px] font-bold">{feedback.heading}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-400">{feedback.description}</p>
          <p className="mt-2 text-[12px] text-ink-400">Ren is your AI voice coach.</p>
        </div>
        <Link href={`/dashboard/ren?agenda=${feedback.agenda}`} className={`${button} border-ink-800 bg-ink-800 text-cream`}>Call Ren</Link>
        <button className={`${button} w-full`} onClick={() => setAnswer(null)}>Back to Today</button>
      </section>
    );
  }

  const due = commitment && (!commitment.dueAt || new Date(commitment.dueAt) <= new Date(now));
  return (
    <section className="space-y-3 rounded-card border border-rule bg-card p-5" data-checkin-state={due ? "checkin" : commitment ? "open" : last?.status ?? "empty"}>
      <p className="label">{commitment || !last ? "A commitment you're working towards" : commitmentHeading(last.status)}</p>
      {commitment ? <>
        <h2 className="text-[19px] font-bold leading-snug">{commitment.wish}</h2>
        {commitment.trigger ? <p className="text-[14px] text-ink-400">{commitment.trigger}</p> : null}
        {commitment.ifThenPlan ? <p className="rounded-sm bg-leaf-100 p-3 text-[14px] text-ink-800">{commitment.ifThenPlan}</p> : null}
        {due ? <>
          <h3 className="pt-2 text-[17px] font-bold">How did it go?</h3>
          <p className="text-[13px] text-ink-400">No score kept. Every answer helps Ren help you.</p>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(CHECKIN_ANSWERS) as CheckinAnswer[]).map((status) => <button key={status} className={`${button} px-2 text-[13px]`} disabled={busy || readOnly} onClick={() => mark(status)}>{CHECKIN_ANSWERS[status].button}</button>)}
          </div>
        </> : <p className="text-[14px] leading-relaxed text-ink-400">Ren will ask how it went around {new Date(commitment.dueAt!).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}.</p>}
      </> : last ? <>
        <h2 className="text-[19px] font-bold leading-snug">{last.wish}</h2>
        <p className="text-[14px] leading-relaxed text-ink-400">{last.status === "kept" ? "That's the kind of thing that moves the date. Ren will ask what made it possible." : last.status === "partial" ? "Partly still counts. What would you like to do with it?" : "That's allowed. Nothing is counted against you."}</p>
        {last.status !== "kept" ? <button className={`${button} w-full`} disabled={busy || readOnly} onClick={() => carryForward(last)}>Carry it into this week</button> : null}
        <Link href="/dashboard/ren" className={button}>{last.status === "kept" ? "Find the next one with Ren" : "Or find a new one with Ren"}</Link>
      </> : <>
        <p className="text-[15px] leading-relaxed text-ink-400">Nothing open right now. One thing, chosen on a call, is how the next few weeks move.</p>
        <Link href="/dashboard/ren" className={button}>Find one with Ren</Link>
      </>}
      {readOnly ? <p className="text-[12px] text-ink-400">This is Layla&apos;s read-only demo.</p> : null}
      {busy ? <p role="status" className="text-[13px] text-ink-400">Saving</p> : null}
      {error ? <p role="alert" className="text-[13px] text-ink-800">{error}</p> : null}
    </section>
  );
}
