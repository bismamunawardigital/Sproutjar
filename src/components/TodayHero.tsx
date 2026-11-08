import Link from "next/link";
import { Plant } from "./Plant";
import { Jar } from "./Jar";
import type { Snapshot } from "@/lib/user";
import { formatMoneyShort } from "@/lib/money";
import { todayHasDate } from "@/lib/today";

export function TodayHero({ snap }: { snap: Snapshot }) {
  const money = (value: number) => formatMoneyShort(value, snap.country.currency);
  const hasDate = todayHasDate(snap.plan);
  const building = snap.horizon === "building" && snap.openingPrincipal > 0;
  const [month, year] = snap.plan.debtFreeOn.split(" ");
  const partial = snap.user.onboardingProgress?.hasMore;
  const estimatedMinimums = snap.debts.some((debt) => debt.estimatedFields?.includes("minimum"));
  const link = "flex min-h-11 items-center justify-center rounded-full border border-rule px-4 py-3 text-[14px] font-bold";
  return (
    <>
      <section className="rounded-card border border-rule bg-card px-5 pb-5 pt-6 text-center">
        <Plant state={snap.growth} className="mx-auto h-36 w-32" />
        {building ? <>
          <p className="label mt-3">Debt-free</p>
          <h2 className="mt-2 text-[36px] font-bold leading-tight tracking-tight">Nothing left to pay.</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-400">{money(snap.cleared)} paid off. {money(snap.attack.amount)} a month that&apos;s yours now.</p>
        </> : snap.totals.debt <= 0 ? <>
          <h2 className="mt-3 text-[26px] font-bold">One card to start with?</h2>
          <p className="mt-2 text-[14px] text-ink-400">Add a balance to see where things stand.</p>
          <Link href="/dashboard/plan" className={`${link} mt-4`}>Add a card</Link>
        </> : hasDate ? <>
          <p className="label mt-3">{partial ? "These cards are paid off by" : "You're debt-free in"}</p>
          <h2 className="n mt-2 text-[46px] font-bold leading-[1.05] tracking-tight text-ink-900">{month}<br />{year}</h2>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2"><span className="rounded-full bg-leaf-100 px-2.5 py-1 text-[11px] font-bold">Estimated</span><p className="text-[13px] text-ink-400">{snap.plan.months} months at {money(snap.attack.amount)} a month</p></div>
        </> : <>
          <p className="label mt-3">Your date</p>
          <h2 className="mt-2 text-[29px] font-bold leading-tight">Not possible yet, on these numbers.</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-400">{snap.plan.shortfall > 0 ? estimatedMinimums ? `Estimated minimums may need ${money(snap.plan.shortfall)} more a month. Check your statement with Ren when you can.` : `The minimums need ${money(snap.plan.shortfall)} more a month. Ren can help you work through it.` : `Estimated interest is ${money(snap.plan.monthlyBleed)} a month and ${money(snap.attack.amount)} goes to the cards. The balance isn't coming down far enough for a date yet.`}</p>
        </>}
        {!building && snap.totals.debt > 0 ? <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-rule pt-4 text-left">
          <div><dt className="label">Left to pay</dt><dd className="n mt-2 text-[16px] font-bold">{money(snap.totals.debt)}</dd></div>
          <div><dt className="label">Paid off</dt><dd className="n mt-2 text-[16px] font-bold text-stem-700">{money(snap.cleared)}</dd></div>
          <div><dt className="label">Rent on the debt</dt><dd className="n mt-2 text-[16px] font-bold text-ink-800">{money(snap.plan.monthlyBleed)}</dd><dd className="mt-1 text-[11px] leading-snug text-ink-400">Estimated interest, every month</dd></div>
        </dl> : null}
      </section>
      {building ? <section className="rounded-card border border-rule bg-card p-5"><p className="label">Where it goes now</p><h2 className="mt-2 text-[22px] font-bold">{money(snap.totals.saved)} set aside so far.</h2>
        <div className="mt-3 divide-y divide-rule">{snap.jars.map((jar) => <div key={jar.id} className="flex items-center gap-4 py-3"><Jar pct={jar.pct} stage={jar.stage} className="h-20 w-14 shrink-0" /><div><h3 className="text-[16px] font-bold">{jar.name}</h3><p className="mt-1 text-[13px] text-ink-400">{money(jar.saved)} of {money(jar.target)}</p></div></div>)}</div>
        <Link href="/dashboard/plan" className={`${link} mt-4`}>{snap.jars.length ? "See your jars" : "Start a jar"}</Link></section> : !hasDate && snap.totals.debt > 0 ? <div className="space-y-2"><Link href="/dashboard/ren" className={`${link} border-ink-800 bg-ink-800 text-cream`}>Talk it through with Ren, your AI coach</Link><Link href="/dashboard/you" className={link}>Change my monthly figure</Link><Link href="/dashboard/plan" className={link}>Check the card figures</Link></div> : null}
    </>
  );
}
