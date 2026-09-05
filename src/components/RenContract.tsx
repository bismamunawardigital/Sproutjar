"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const DOES = [
  "Remembers what you said last time and asks what happened, not why you failed.",
  "Asks before explaining something or pushing back on it.",
  "Works from your numbers: the balances, the rates, what you paid, what you decided.",
  "Ends a call with one thing you chose, or says plainly that nothing landed.",
];

const DOES_NOT = [
  "Move money, or tell you to pay something now.",
  "Give legal or investment advice, or tell you which bank to use.",
  "Score you, streak you, or keep a tally of what you did not do.",
  "Treat a proposal as done. A transfer or a plan stays a proposal until you apply it.",
];

/**
 * The contract a coach states before the first conversation: what Ren will do,
 * what it will not, and that nothing moves without the person. New users read
 * it once; afterwards it stays reachable as a link.
 */
export function RenContract({
  contracted,
  compact = false,
}: {
  /** Recorded once, the first time the person taps Understood. */
  contracted: boolean;
  /** As a link that unfolds, for people who have already agreed. */
  compact?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(!contracted && !compact);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agree = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/contract", { method: "POST" });
      if (!response.ok) throw new Error("not saved");
      router.refresh();
      setOpen(false);
    } catch {
      setError("That didn't save. You can try again, or just start the call: this text stays here.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <p className="px-1 text-center text-[13px] text-ink-400">
        <button
          onClick={() => setOpen(true)}
          className="font-bold text-stem-700 underline underline-offset-4 transition hover:text-stem"
        >
          What Ren does and doesn&rsquo;t do
        </button>
      </p>
    );
  }

  return (
    <section className="rounded-card border border-rule bg-card p-5">
      <p className="label">{contracted ? "What Ren does and doesn't do" : "Before your first call"}</p>
      <h2 className="mt-1.5 text-[19px] font-bold leading-tight text-ink-900">
        Ren is a coach, not a bank and not a boss.
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-stem-700">Ren will</p>
          <ul className="mt-2 space-y-2">
            {DOES.map((line) => (
              <li key={line} className="flex gap-2 text-[14px] leading-relaxed text-ink-600">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-stem" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-ink-400">Ren won&rsquo;t</p>
          <ul className="mt-2 space-y-2">
            {DOES_NOT.map((line) => (
              <li key={line} className="flex gap-2 text-[14px] leading-relaxed text-ink-600">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-300" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 text-[13px] leading-relaxed text-ink-400">
        You can say &ldquo;not now&rdquo; to anything Ren raises, and you can correct anything Ren
        works from on the You screen.
      </p>

      {error ? <p className="mt-3 text-[13px] text-amber-900">{error}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {contracted ? (
          <button
            onClick={() => setOpen(false)}
            className="rounded-full border border-rule px-4 py-2 text-[14px] font-bold text-ink-600 transition hover:border-ink-300"
          >
            Close
          </button>
        ) : (
          <button
            onClick={agree}
            disabled={busy}
            className="rounded-full bg-stem-600 px-5 py-2.5 text-[15px] font-bold text-white transition hover:bg-stem-700 disabled:opacity-60"
          >
            {busy ? "Saving" : "Understood"}
          </button>
        )}
      </div>
    </section>
  );
}
