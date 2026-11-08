import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Account deleted · Sproutjar");

export default function AccountDeletedPage() {
  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-6 text-center"><h1 className="text-[32px] font-bold text-ink-900">It&apos;s gone.</h1><p className="text-[16px] text-ink-500">Your Sproutjar account and saved data have been deleted. This does not change your bank balance or your actual debt.</p><Link href="/delete-public" className="flex min-h-11 items-center justify-center text-[14px] font-bold text-stem-700 underline">Provider transcript requests</Link><Link href="/" className="flex min-h-12 items-center justify-center rounded-full bg-ink-800 px-5 font-bold text-cream">Back to the start</Link></main>;
}
