"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Three ways a call can end, in descending order of certainty: something was
 * committed to, something concrete was explored, or the topic was opened and
 * left open. The middle case quotes the person back to themselves rather than
 * summarising them, so nothing is put in their mouth.
 */
export function SessionClose({
  commitment,
  saidByYou = [],
  nextAgenda = null,
}: {
  commitment: { wish: string; trigger: string } | null;
  saidByYou?: string[];
  nextAgenda?: { id: string; title: string } | null;
}) {
  const router = useRouter();
  const explored = longestThingYouSaid(saidByYou);
  const [wish, setWish] = useState(explored ?? "");
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

  if (existing) {
    return (
      <Shell grown>
        <p className="label">What you&rsquo;re taking away</p>
        <p className="mt-2 text-[17px] font-bold leading-snug text-ink-900">{existing.wish}</p>
        {existing.trigger ? (
          <p className="mt-1 text-[13px] text-ink-400">{existing.trigger}</p>
        ) : null}
        <p className="mt-3 text-[13px] text-stem-700">
          It&rsquo;s on your Home screen now. However it goes, the plant holds.
        </p>
      </Shell>
    );
  }

  if (explored) {
    return (
      <Shell grown={false}>
        <p className="label">What you worked through</p>
        <p className="mt-2 text-[16px] leading-relaxed text-ink-900">
          &ldquo;{explored}&rdquo;
        </p>
        <p className="mt-2 text-[13px] text-ink-400">
          Your words, not Ren&rsquo;s. Make it the thing you try this week, or edit it first.
        </p>
        <form onSubmit={save} className="mt-3 space-y-2">
          <input
            value={wish}
            onChange={(e) => setWish(e.target.value)}
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
      </Shell>
    );
  }

  return (
    <Shell grown={false}>
      <p className="label">Where this got to</p>
      <p className="mt-2 text-[17px] font-bold leading-snug text-ink-900">
        You opened it up. That was the work today.
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-400">
        Nothing to carry out of this one, and that&rsquo;s a fine place to stop. It&rsquo;s
        usually the second conversation on a subject where something lands.
      </p>
      {nextAgenda ? (
        <Link
          href={`/dashboard/ren?agenda=${nextAgenda.id}`}
          className="mt-4 inline-flex rounded-full bg-stem px-5 py-2.5 text-[14px] font-bold text-white transition hover:opacity-90"
        >
          Next time: {nextAgenda.title}
        </Link>
      ) : (
        <Link
          href="/dashboard"
          className="mt-4 inline-flex rounded-full bg-stem px-5 py-2.5 text-[14px] font-bold text-white transition hover:opacity-90"
        >
          Pick what to talk about next
        </Link>
      )}
    </Shell>
  );
}

/**
 * The longest thing the person said, trimmed to a quotable sentence. Length is
 * a crude proxy for substance, but it never invents wording they didn't use.
 */
function longestThingYouSaid(saidByYou: string[]): string | null {
  const candidate = saidByYou
    .map((line) => line.trim())
    .filter((line) => line.length >= 40)
    .sort((a, b) => b.length - a.length)[0];
  if (!candidate) return null;
  if (candidate.length <= 140) return candidate;
  const cut = candidate.slice(0, 140);
  const stop = Math.max(cut.lastIndexOf("."), cut.lastIndexOf(","), cut.lastIndexOf(" "));
  return `${cut.slice(0, stop > 60 ? stop : 140).trim()}…`;
}

function Shell({ grown, children }: { grown: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-rule bg-card p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <Sprout grown={grown} />
        <div className="min-w-0 flex-1">{children}</div>
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
