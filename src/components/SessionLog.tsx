"use client";

import { useState } from "react";

export type SessionEntry = {
  id: string;
  agenda: string;
  on: string;
  contract: string;
  minutes: number;
  /** What they said at the close, in their words. Empty when they said nothing. */
  reflection: string;
  commitment: {
    wish: string;
    ifThenPlan: string;
    trigger: string;
    status: string;
  } | null;
};

const CONTRACT_LINE: Record<string, string> = {
  clarity: "You wanted to understand what was happening.",
  decision: "You wanted to weigh it and choose.",
  plan: "You wanted something practical to do next.",
  space: "You wanted room to think, not advice.",
};

function statusChip(status: string) {
  if (status === "kept") return <span className="chip c-grow ml-2">Done</span>;
  if (status === "missed") return <span className="chip c-neutral ml-2">Another time</span>;
  if (status === "open") return <span className="chip c-neutral ml-2">Still open</span>;
  return null;
}

/**
 * Each talk opens into what the person themselves said and agreed to. Ren's own
 * read of the conversation is deliberately not here: it would be interpretation
 * presented back as record.
 */
export function SessionLog({ sessions }: { sessions: SessionEntry[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ul className="mt-3 divide-y divide-rule">
      {sessions.map((session) => {
        const isOpen = open === session.id;
        return (
          <li key={session.id} className="py-3.5 first:pt-0">
            <button
              onClick={() => setOpen(isOpen ? null : session.id)}
              aria-expanded={isOpen}
              className="flex w-full items-baseline justify-between gap-3 text-left"
            >
              <span className="text-[15px] font-bold text-ink-900">{session.agenda}</span>
              <span className="shrink-0 text-[12px] text-ink-300">{session.on}</span>
            </button>

            {session.commitment ? (
              <p className="mt-1 text-[13px] text-ink-400">
                {session.commitment.wish}
                {statusChip(session.commitment.status)}
              </p>
            ) : (
              <p className="mt-1 text-[13px] text-ink-300">
                You just wanted to think out loud. Nothing to do after it, and that was fine.
              </p>
            )}

            {isOpen ? (
              <div className="mt-3 space-y-3 rounded-sm bg-cream px-4 py-3.5">
                <div>
                  <p className="label">What you came for</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-700">
                    {CONTRACT_LINE[session.contract] ?? "You opened it up and talked."}{" "}
                    <span className="text-ink-400">
                      <span className="n">{session.minutes}</span> minutes.
                    </span>
                  </p>
                </div>

                {session.reflection ? (
                  <div>
                    <p className="label">In your words, at the end</p>
                    <p className="mt-1 text-[14px] italic leading-relaxed text-ink-800">
                      &ldquo;{session.reflection}&rdquo;
                    </p>
                  </div>
                ) : null}

                {session.commitment ? (
                  <div>
                    <p className="label">What you said you&rsquo;d do</p>
                    <p className="mt-1 text-[14px] leading-relaxed text-ink-800">
                      {session.commitment.ifThenPlan || session.commitment.wish}
                    </p>
                    {session.commitment.trigger ? (
                      <p className="mt-1 text-[13px] text-ink-400">
                        When: {session.commitment.trigger}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            <button
              onClick={() => setOpen(isOpen ? null : session.id)}
              className="mt-2 text-[12px] font-bold text-stem-700 transition hover:opacity-80"
            >
              {isOpen ? "Close" : "What was said"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
