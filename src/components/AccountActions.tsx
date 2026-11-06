import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { DeleteAccount } from "@/components/DeleteAccount";

/** Account housekeeping: see Layla's demo, sign out, or leave for good. */
export function AccountActions({ demo, guest }: { demo: boolean; guest: boolean }) {
  return (
    <section className="rounded-card border border-rule bg-card p-5">
      <p className="label">Account</p>
      <div className="mt-3 flex flex-col gap-3 text-[14px]">
        {demo ? (
          guest ? (
            <Link href="/sign-in" className="font-bold text-stem-700 underline underline-offset-2">
              Sign up for your own
            </Link>
          ) : (
            <a href="/demo/exit" className="font-bold text-stem-700 underline underline-offset-2">
              Back to my own numbers
            </a>
          )
        ) : (
          <a href="/demo" className="font-bold text-stem-700 underline underline-offset-2">
            See a demo (Layla, 3 cards, 14 weeks in)
          </a>
        )}
        {guest ? null : (
          <SignOutButton redirectUrl="/">
            <button className="text-left font-bold text-ink-500 underline underline-offset-2">Sign out</button>
          </SignOutButton>
        )}
        {guest || demo ? null : <DeleteAccount />}
        <div className="flex flex-wrap gap-4 border-t border-rule pt-3 text-[13px] font-bold text-ink-400">
          <Link href="/help" className="underline underline-offset-2 hover:text-ink-700">Help</Link>
          <Link href="/privacy" className="underline underline-offset-2 hover:text-ink-700">Privacy</Link>
          <Link href="/terms" className="underline underline-offset-2 hover:text-ink-700">Terms</Link>
        </div>
      </div>
    </section>
  );
}
