import type { ReactNode } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { currentUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-20 border-b border-rule bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3">
          <Link href="/">
            <Logo />
          </Link>
          <p className="text-[13px] font-bold text-ink-400">{user.name}</p>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-5 py-5 pb-28">{children}</main>

      <BottomNav />
    </div>
  );
}
