"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";

/** Two taps, then everything about this person is gone: cards, jars, calls, sign-in. */
export function DeleteAccount() {
  const { signOut } = useClerk();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/account", { method: "DELETE" });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not delete the account. Try again in a moment.");
      setBusy(false);
      return;
    }
    await signOut().catch(() => undefined);
    window.location.assign("/");
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="text-[13px] font-bold text-root underline underline-offset-2">
        Delete my account
      </button>
    );
  }

  return (
    <div className="rounded-sm border border-root/30 bg-root/5 p-4">
      <p className="text-[15px] font-bold text-ink-900">Delete everything?</p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
        Your cards, jars, commitments and every call with Ren go, along with your sign-in. There is no undo.
      </p>
      {error ? <p className="mt-2 text-[13px] text-root">{error}</p> : null}
      <div className="mt-3 flex gap-3">
        <button onClick={remove} disabled={busy} className="rounded-full bg-root px-4 py-2 text-[13px] font-bold text-white disabled:opacity-60">
          {busy ? "Deleting" : "Yes, delete it all"}
        </button>
        <button onClick={() => setConfirming(false)} disabled={busy} className="text-[13px] font-bold text-ink-400">
          Keep it
        </button>
      </div>
    </div>
  );
}
