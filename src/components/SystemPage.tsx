import Link from "next/link";
import { Plant } from "@/components/Plant";

export function SystemPage({ title, description, homeHref = "/", children }: {
  title: string;
  description: string;
  homeHref?: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <Plant state={{ stemPct: 0.2, leafPairs: 1, rootDepth: 1, sparks: false, cleared: false }} className="w-24" />
      <h1 className="mt-6 text-[26px] font-extrabold leading-tight text-ink-900">{title}</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-ink-500">{description}</p>
      {children}
      <Link href={homeHref} className="mt-8 flex min-h-12 w-full items-center justify-center rounded-full bg-ink-800 px-6 py-3 text-[16px] font-bold text-cream">
        Go back home
      </Link>
    </main>
  );
}
