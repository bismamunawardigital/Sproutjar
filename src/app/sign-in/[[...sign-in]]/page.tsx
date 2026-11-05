import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-rule bg-cream/95">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3">
          <Link href="/">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="mx-auto flex max-w-md flex-col items-center px-5 py-8">
        <p className="label">Sproutjar</p>
        <h1 className="mt-2 text-center text-[24px] font-bold leading-snug text-ink-900">
          Your numbers stay yours.
        </h1>
        <p className="mt-2 max-w-xs text-center text-[14px] leading-relaxed text-ink-400">
          Sign in so Ren remembers you between calls. No passwords: Google, Apple, or a link to your email.
        </p>
        <div className="mt-6 w-full">
          <SignIn withSignUp fallbackRedirectUrl="/onboarding" />
        </div>
        <p className="mt-6 max-w-xs text-center text-[12px] leading-relaxed text-ink-300">
          Coaching, not financial advice. Nothing connects to your bank.
        </p>
      </main>
    </div>
  );
}
