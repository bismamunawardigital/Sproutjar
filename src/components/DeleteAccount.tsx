"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { deletionConfirmed, deleteSproutjarAccount } from "@/lib/you";

export function DeleteAccount() {
  const { signOut } = useClerk();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [word, setWord] = useState("");

  async function remove() {
    if (!deletionConfirmed(word) || busy) return;
    setBusy(true);
    setError(null);
    try { await deleteSproutjarAccount(); }
    catch (error) {
      setError(error instanceof Error ? error.message : "Could not delete the account. Try again in a moment.");
      setBusy(false);
      return;
    }
    await signOut().catch(() => undefined);
    // Full page load on purpose: the signed-out person must not re-render the dashboard layout.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/account-deleted");
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="min-h-11 text-left text-[14px] font-bold text-ink-700 underline underline-offset-2">
        Delete my account
      </button>
    );
  }

  return (
    <div className="rounded-sm border border-root/30 bg-root/5 p-4">
      <p className="text-[15px] font-bold text-ink-900">Delete everything?</p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
        Your Sproutjar cards, jars, commitments and saved talks go, along with your sign-in. There is no undo. This does not touch your bank or your actual debt. Provider-held transcripts follow the privacy policy.
      </p>
      <label className="mt-4 block text-[14px] font-bold text-ink-700">Type delete to confirm<input value={word} onChange={(event) => setWord(event.target.value)} className="mt-2 min-h-11 w-full rounded-sm border border-rule bg-cream px-3 text-[16px]" autoComplete="off" /></label>
      {error ? <p role="alert" className="mt-2 text-[13px] text-amber-900">{error}</p> : null}
      <div className="mt-3 flex gap-3">
        <button onClick={remove} disabled={busy || !deletionConfirmed(word)} className="min-h-12 flex-1 rounded-full bg-ink-800 px-4 py-2 text-[13px] font-bold text-cream disabled:opacity-60">
          {busy ? "Deleting" : "Yes, delete it all"}
        </button>
        <button onClick={() => { setConfirming(false); setWord(""); setError(null); }} disabled={busy} className="min-h-12 flex-1 rounded-full border border-rule px-4 text-[13px] font-bold text-ink-700">
          Keep it
        </button>
      </div>
    </div>
  );
}
