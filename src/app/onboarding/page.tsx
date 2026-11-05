import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Onboarding } from "@/components/Onboarding";
import { currentCaller, ensureCallerUser, isDemo } from "@/lib/caller";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const caller = await currentCaller();
  if (isDemo(caller)) redirect("/dashboard");
  const user = await ensureCallerUser(caller);

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-rule bg-cream/95">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3">
          <Link href="/">
            <Logo />
          </Link>
          {user.onboardedAt ? (
            <Link href="/dashboard" className="text-[13px] font-bold text-ink-300">
              Skip
            </Link>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-md px-5 py-6">
        <Onboarding initialName={user.name === "there" ? "" : user.name} initialCountry={user.country} />
      </main>
    </div>
  );
}
