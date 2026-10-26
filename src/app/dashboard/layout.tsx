import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { currentCaller, ensureCallerUser, isDemo } from "@/lib/caller";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const caller = await currentCaller();
  const demo = isDemo(caller);
  const user = await ensureCallerUser(caller);
  if (!demo && !user.onboardedAt) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-20 border-b border-rule bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3">
          <Link href="/">
            <Logo />
          </Link>
          <p className="max-w-[55%] truncate text-[13px] font-bold text-ink-400">{user.name}</p>
        </div>
        {demo ? (
          <div className="bg-ink-800 text-cream">
            <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-5 py-2 text-[12px]">
              <span>You are looking at Layla, the demo. Nothing here can be changed.</span>
              <a href="/demo/exit" className="shrink-0 font-bold text-leaf-300 underline underline-offset-2">
                Back to mine
              </a>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-md space-y-4 px-5 py-5 pb-28">{children}</main>

      <BottomNav />
    </div>
  );
}
