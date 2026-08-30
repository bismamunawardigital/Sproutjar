"use client";

import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export type CommitmentRow = {
  id: string;
  wish: string;
  outcome: string;
  obstacle: string;
  ifThenPlan: string;
  dueAt: string | null;
  status: string;
};

export function CommitmentBoard({ commitments }: { commitments: CommitmentRow[] }) {
  const router = useRouter();

  async function mark(id: string, status: "kept" | "missed") {
    await fetch("/api/commitments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-sand bg-cream p-6">
      <h3 className="font-display text-xl font-semibold">This month&rsquo;s commitment</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
        Ren writes these here at the end of a call. One at a time, in your words.
      </p>

      <div className="mt-5 space-y-3">
        {commitments.length === 0 ? (
          <p className="rounded-xl bg-white/60 p-6 text-sm text-ink-soft">
            Nothing open. Your next session with Ren will close with one.
          </p>
        ) : null}
        {commitments.map((commitment) => (
          <div key={commitment.id} className="rounded-xl border border-sand bg-white/60 p-5">
            <p className="font-medium">{commitment.wish}</p>
            {commitment.obstacle ? (
              <p className="mt-1.5 text-sm text-ink-soft">
                <span className="font-medium text-bark">The real obstacle:</span>{" "}
                {commitment.obstacle}
              </p>
            ) : null}
            {commitment.ifThenPlan ? (
              <p className="mt-2 rounded-lg bg-moss/10 px-3.5 py-2.5 text-sm text-moss">
                {commitment.ifThenPlan}
              </p>
            ) : null}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => mark(commitment.id, "kept")}
                className="inline-flex items-center gap-1.5 rounded-full bg-moss px-4 py-1.5 text-sm font-medium text-white transition hover:bg-bark"
              >
                <Check size={15} /> Kept it
              </button>
              <button
                onClick={() => mark(commitment.id, "missed")}
                className="inline-flex items-center gap-1.5 rounded-full border border-bark/15 px-4 py-1.5 text-sm transition hover:border-clay hover:text-clay"
              >
                <X size={15} /> Not this time
              </button>
              {commitment.dueAt ? (
                <span className="ml-auto text-xs text-ink-soft">
                  Due {new Date(commitment.dueAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
