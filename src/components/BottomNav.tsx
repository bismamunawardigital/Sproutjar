"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Home, Mic, Sprout, User } from "lucide-react";

const TABS = [
  { href: "/dashboard", label: "Home", Icon: Home },
  { href: "/dashboard/ren", label: "Ren", Icon: Mic },
  { href: "/dashboard/debts", label: "Debts", Icon: CreditCard },
  { href: "/dashboard/jars", label: "Jars", Icon: Sprout },
  { href: "/dashboard/you", label: "You", Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-rule bg-cream/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold transition ${
                  active ? "text-stem-700" : "text-ink-300"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
