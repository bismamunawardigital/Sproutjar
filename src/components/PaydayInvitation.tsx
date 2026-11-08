import Link from "next/link";

export function PaydayInvitation({ daysUntil, cadence }: { daysUntil: number | null; cadence: string }) {
  return (
    <section className="rounded-card border border-stem/30 bg-leaf-100 p-5">
      <p className="label">{cadence === "weekly" ? "Weekly review" : daysUntil === 0 ? "It's payday" : daysUntil !== null && daysUntil <= 2 ? `Payday is in ${daysUntil} ${daysUntil === 1 ? "day" : "days"}` : "Payday review"}</p>
      <h2 className="mt-1 text-[19px] font-bold">Five minutes with the statements?</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-400">It keeps the date honest. Whenever suits you.</p>
      <Link href="/dashboard/plan" className="mt-4 flex min-h-11 items-center justify-center rounded-full bg-ink-800 px-4 py-3 text-[14px] font-bold text-cream">{cadence === "weekly" ? "Do this week's review" : "Do this month's review"}</Link>
    </section>
  );
}
