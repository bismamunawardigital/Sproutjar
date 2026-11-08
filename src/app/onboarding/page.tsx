import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Onboarding } from "@/components/Onboarding";
import { currentCaller, ensureCallerUser, isDemo } from "@/lib/caller";
import { pageMetadata } from "@/lib/metadata";
import { onboardingRedirect } from "@/lib/onboarding-route";
import { INITIAL_ONBOARDING, onboardingProgressSchema } from "@/lib/onboarding";
import { convexClient } from "@/lib/convex";
import { api } from "../../../convex/_generated/api";

export const metadata = pageMetadata("Your first plan · Sproutjar");

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const caller = await currentCaller();
  if (isDemo(caller)) redirect("/dashboard");
  const user = await ensureCallerUser(caller);
  const destination = onboardingRedirect(user.onboardedAt);
  if (destination) redirect(destination);
  const snapshot = await convexClient().query(api.sproutjar.snapshot, { caller });
  const saved = onboardingProgressSchema.safeParse(user.onboardingProgress);
  const progress = saved.success ? saved.data : INITIAL_ONBOARDING;
  const ids = user.onboardingCardIds ?? snapshot.debts.map((debt) => debt._id);
  const cards = ids.flatMap((id) => {
    const debt = snapshot.debts.find((item) => item._id === id);
    return debt ? [{ id: debt._id, name: debt.name, issuer: debt.issuer, balance: debt.balance, monthlyRate: debt.monthlyRate, minimumPayment: debt.minimumPayment, estimatedFields: debt.estimatedFields, dueDay: debt.dueDay, statementDay: debt.statementDay }] : [];
  });

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
        <Onboarding initialName={user.name === "there" ? "" : user.name} initialCountry={user.country} initialAnswers={user.onboarding} initialProgress={progress} initialCards={cards} />
      </main>
    </div>
  );
}
