import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Onboarding } from "@/components/Onboarding";
import { currentCaller, ensureCallerUser, isDemo } from "@/lib/caller";
import { pageMetadata } from "@/lib/metadata";
import { onboardingRedirect } from "@/lib/onboarding-route";

export const metadata = pageMetadata("Your first plan · Sproutjar");

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const caller = await currentCaller();
  if (isDemo(caller)) redirect("/dashboard");
  const user = await ensureCallerUser(caller);
  const destination = onboardingRedirect(user.onboardedAt);
  if (destination) redirect(destination);

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-rule bg-cream/95">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3">
          <Link href="/">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-md px-5 py-6">
        <Onboarding initialName={user.name === "there" ? "" : user.name} initialCountry={user.country} />
      </main>
    </div>
  );
}
