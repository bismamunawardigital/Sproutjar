"use client";

import { useRouter } from "next/navigation";

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
export function CommitmentBoard({ commitments }: { commitments: CommitmentRow[] }) {
  const router = useRouter();

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
      <p className="label">What you said you&rsquo;d try</p>

      {commitments.length === 0 ? (
        <p className="mt-3 text-[15px] leading-relaxed text-ink-400">
          Nothing yet. You and Ren will pick something small the next time you talk.
        </p>
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

            <p className="label mt-4">How did it go?</p>
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
                Didn&rsquo;t get to it
              </button>
              {commitment.dueAt ? (
                <span className="ml-auto text-[12px] text-ink-300">
                  Due{" "}
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
