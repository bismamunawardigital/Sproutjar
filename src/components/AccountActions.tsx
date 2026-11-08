"use client";

import { useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { DeleteAccount } from "@/components/DeleteAccount";

/** Account housekeeping: see Layla's demo, sign out, or leave for good. */
export function AccountActions({ demo, guest }: { demo: boolean; guest: boolean }) {
  const [signingOut, setSigningOut] = useState(false);
  return (
    <section className="rounded-card border border-rule bg-card p-5">
      <p className="label">Account</p>
      <div className="mt-3 flex flex-col gap-3 text-[14px]">
        {demo ? (
          guest ? (
            <Link href="/sign-in" className="flex min-h-11 items-center font-bold text-stem-700 underline underline-offset-2">
              Sign up for your own
            </Link>
          ) : (
            <a href="/demo/exit" className="flex min-h-11 items-center font-bold text-stem-700 underline underline-offset-2">
              Back to my own numbers
            </a>
          )
        ) : (
          <a href="/demo" className="flex min-h-11 items-center font-bold text-stem-700 underline underline-offset-2">
            See Layla&apos;s demo
          </a>
        )}
        {guest ? null : signingOut ? <div className="rounded-card border border-rule p-4"><h2 className="text-[18px] font-bold text-ink-900">Sign out?</h2><p className="mt-2 text-[14px] text-ink-500">Your plan stays here for when you&apos;re back.</p><div className="mt-3 flex gap-3"><SignOutButton redirectUrl="/"><button className="min-h-12 flex-1 rounded-full bg-ink-800 px-4 font-bold text-cream">Yes, sign out</button></SignOutButton><button onClick={() => setSigningOut(false)} className="min-h-12 flex-1 rounded-full border border-rule px-4 font-bold">Stay</button></div></div> : <button onClick={() => setSigningOut(true)} className="min-h-11 text-left font-bold text-ink-500 underline underline-offset-2">Sign out</button>}
        {guest || demo ? null : <DeleteAccount />}
        <div className="flex flex-wrap gap-4 border-t border-rule pt-3 text-[13px] font-bold text-ink-400">
          <Link href="/help" className="flex min-h-11 min-w-11 items-center underline underline-offset-2 hover:text-ink-700">Help</Link>
          <Link href="/privacy" className="flex min-h-11 items-center underline underline-offset-2 hover:text-ink-700">Privacy</Link>
          <Link href="/terms" className="flex min-h-11 min-w-11 items-center underline underline-offset-2 hover:text-ink-700">Terms</Link>
          <Link href="/delete-public" className="flex min-h-11 items-center underline underline-offset-2 hover:text-ink-700">Deletion help</Link>
        </div>
      </div>
    </section>
  );
}
