import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { DeleteAccount } from "@/components/DeleteAccount";

/** Account housekeeping: see Layla's demo, sign out, or leave for good. */
export function AccountActions({ demo }: { demo: boolean }) {
  return (
    <section className="rounded-card border border-rule bg-card p-5">
      <p className="label">Account</p>
      <div className="mt-3 flex flex-col gap-3 text-[14px]">
        {demo ? (
          <Link href="/demo/exit" className="font-bold text-stem-700 underline underline-offset-2">
            Back to my own numbers
          </Link>
        ) : (
          <Link href="/demo" className="font-bold text-stem-700 underline underline-offset-2">
            See a demo (Layla, 3 cards, 14 weeks in)
          </Link>
        )}
        <SignOutButton redirectUrl="/">
          <button className="text-left font-bold text-ink-500 underline underline-offset-2">Sign out</button>
        </SignOutButton>
        {demo ? null : <DeleteAccount />}
      </div>
    </section>
  );
}
