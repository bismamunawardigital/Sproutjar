import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Onboarding } from "@/components/Onboarding";

export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-rule bg-cream/95">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3">
          <Link href="/">
            <Logo />
          </Link>
          <Link href="/dashboard" className="text-[13px] font-bold text-ink-300">
            Skip
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-md px-5 py-6">
        <Onboarding />
      </main>
    </div>
  );
}
