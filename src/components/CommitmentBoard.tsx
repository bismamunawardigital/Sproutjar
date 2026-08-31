"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

/**
 * The weekly ask is one tap. A missed commitment gets no red, no warning icon
 * and no sad copy — the plant holds exactly where it was and Ren asks what
 * happened between deciding and the moment it didn't.
 */
export type LastCommitment = {
  wish: string;
  trigger: string;
  ifThenPlan: string;
  status: string;
  agenda: string | null;
  on: string | null;
};

export function CommitmentBoard({
  commitments,
  last = null,
}: {
  commitments: CommitmentRow[];
  last?: LastCommitment | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  // Nothing is invented here: carrying forward reuses the words from the call
  // it came from, and only when the user taps it.
  async function carryForward(source: LastCommitment) {
    setBusy(true);
    await fetch("/api/commitments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wish: source.wish,
        trigger: source.trigger,
        ifThenPlan: source.ifThenPlan,
        days: 7,
      }),
    });
    setBusy(false);
    router.refresh();
  }

  async function mark(id: string, status: "kept" | "partial" | "missed") {
    await fetch("/api/commitments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    router.refresh();
  }

  return (
    <section className="rounded-card border border-rule bg-card p-5 sm:p-6">
      <p className="label">A commitment you&rsquo;re working towards this week</p>

      {commitments.length === 0 && last ? (
        <div className="mt-3">
          <p className="text-[12px] text-ink-300">
            Nothing open. On {last.agenda ? `“${last.agenda}”` : "your last call"} you said:
          </p>
          <p className="mt-1.5 text-[17px] font-bold leading-snug text-ink-900">{last.wish}</p>
          {last.trigger ? (
            <p className="mt-1 text-[13px] text-ink-400">{last.trigger}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => carryForward(last)}
              disabled={busy}
              className="rounded-full bg-stem-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-stem-700 disabled:opacity-60"
            >
              {busy
                ? "Saving"
                : last.status === "kept"
                  ? "Do it again this week"
                  : "Carry it into this week"}
            </button>
            <Link
              href="/dashboard/ren"
              className="text-[14px] font-bold text-stem-700 underline underline-offset-4 transition hover:text-stem"
            >
              Or find a new one with Ren
            </Link>
          </div>
          {last.on ? (
            <p className="mt-2 text-[12px] text-ink-300">
              {last.status === "kept"
                ? "You did this one"
                : last.status === "partial"
                  ? "Partly done"
                  : "You left this one for another time"}{" "}
              · {last.on}
            </p>
          ) : null}
        </div>
      ) : null}

      {commitments.length === 0 && !last ? (
        <>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-400">
            Nothing open right now. One thing, chosen on a call, is how the next few weeks move.
          </p>
          <Link
            href="/dashboard/ren"
            className="mt-3 inline-block text-[14px] font-bold text-stem-700 underline underline-offset-4 transition hover:text-stem"
          >
            Find one with Ren
          </Link>
        </>
      ) : null}

      <div className="mt-3 space-y-4">
        {commitments.map((commitment) => (
          <div key={commitment.id}>
            <p className="text-[17px] font-bold leading-snug text-ink-900">{commitment.wish}</p>
            {commitment.trigger ? (
              <p className="mt-1 text-[13px] text-ink-400">{commitment.trigger}</p>
            ) : null}
            {commitment.ifThenPlan ? (
              <p className="mt-2 rounded-sm bg-leaf-50 px-3.5 py-2.5 text-[13px] text-stem-700">
                {commitment.ifThenPlan}
              </p>
            ) : null}

            <p className="label mt-4">How did it go? No wrong answer.</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => mark(commitment.id, "kept")}
                className="rounded-full bg-stem-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-stem-700"
              >
                Done
              </button>
              <button
                onClick={() => mark(commitment.id, "partial")}
                className="rounded-full border border-rule px-4 py-2 text-sm font-bold text-ink-700 transition hover:border-ink-300"
              >
                Partly
              </button>
              <button
                onClick={() => mark(commitment.id, "missed")}
                className="rounded-full border border-rule px-4 py-2 text-sm font-bold text-ink-700 transition hover:border-ink-300"
              >
                Not this week
              </button>
              {commitment.dueAt ? (
                <span className="ml-auto text-[12px] text-ink-300">
                  Around{" "}
                  {new Date(commitment.dueAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
