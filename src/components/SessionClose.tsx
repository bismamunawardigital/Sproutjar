"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * How a call ends: one thing the person chose, written down, with the sprout
 * that grows as it lands. Nothing is required — leaving it empty is a choice too.
 */
export function SessionClose({
  commitment,
}: {
  commitment: { wish: string; trigger: string } | null;
}) {
  const router = useRouter();
  const [wish, setWish] = useState("");
  const [trigger, setTrigger] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!wish.trim()) return;
    setBusy(true);
    await fetch("/api/commitments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wish: wish.trim(), trigger: trigger.trim() }),
    });
    setBusy(false);
    setSaved(true);
    router.refresh();
  }

  const existing = commitment ?? (saved ? { wish, trigger } : null);

  return (
    <section className="rounded-card border border-rule bg-card p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <Sprout grown={Boolean(existing)} />
        <div className="min-w-0 flex-1">
          <p className="label">Before you go</p>
          {existing ? (
            <>
              <p className="mt-2 text-[17px] font-bold leading-snug text-ink-900">
                {existing.wish}
              </p>
              {existing.trigger ? (
                <p className="mt-1 text-[13px] text-ink-400">{existing.trigger}</p>
              ) : null}
              <p className="mt-3 text-[13px] text-stem-700">
                It&rsquo;s on your Home screen now. However it goes, the plant holds.
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-400">
                One small thing you want to try before the next call — in your words, not
                Ren&rsquo;s. Skip it if you&rsquo;d rather just sit with the conversation.
              </p>
              <form onSubmit={save} className="mt-3 space-y-2">
                <input
                  value={wish}
                  onChange={(e) => setWish(e.target.value)}
                  placeholder="Move 400 across on payday"
                  className="w-full rounded-sm border border-rule bg-cream px-3 py-2.5 text-[15px] text-ink-800 outline-none focus:border-stem"
                />
                <input
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  placeholder="When something already happens — after Friday lunch, say"
                  className="w-full rounded-sm border border-rule bg-cream px-3 py-2.5 text-[15px] text-ink-800 outline-none focus:border-stem"
                />
                <button
                  type="submit"
                  disabled={busy || !wish.trim()}
                  className="rounded-full bg-stem px-5 py-2.5 text-[14px] font-bold text-white transition hover:opacity-90 disabled:opacity-40"
                >
                  {busy ? "Saving" : "That's the one"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Sprout({ grown }: { grown: boolean }) {
  return (
    <svg viewBox="0 0 40 56" className="h-14 w-10 shrink-0" aria-hidden>
      <ellipse cx="20" cy="52" rx="12" ry="3" fill="#DED6C8" />
      <path
        d="M20 52 L20 20"
        stroke="#3D7A55"
        strokeWidth="3"
        strokeLinecap="round"
        className="sprout-stem"
        style={{ transform: grown ? "scaleY(1)" : "scaleY(0.25)" }}
      />
      <path
        d="M21 26 C 21 18 27 13 36 13 C 36 23 30 28 21 26 Z"
        fill="#5FA877"
        className="sprout-leaf"
        style={{ opacity: grown ? 1 : 0, transform: grown ? "scale(1)" : "scale(0.4)" }}
      />
      <path
        d="M19 34 C 19 26 13 21 4 21 C 4 31 10 36 19 34 Z"
        fill="#92D3A3"
        className="sprout-leaf"
        style={{
          opacity: grown ? 1 : 0,
          transform: grown ? "scale(1)" : "scale(0.4)",
          transitionDelay: "180ms",
        }}
      />
    </svg>
  );
}
