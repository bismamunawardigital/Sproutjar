import { CommitmentBoard } from "@/components/CommitmentBoard";
import { HomeAgendas } from "@/components/HomeAgendas";
import { PaydayInvitation } from "@/components/PaydayInvitation";
import { TodayHero } from "@/components/TodayHero";
import { TodayPayments } from "@/components/TodayPayments";
import { agendasFor } from "@/lib/session-agendas";
import { buildSnapshot } from "@/lib/user";
import { pageMetadata } from "@/lib/metadata";
import { currentCaller, isDemo } from "@/lib/caller";
import { todayHasDate, todayPayments } from "@/lib/today";

export const metadata = pageMetadata("Today · Sproutjar");

export const dynamic = "force-dynamic";

export default async function Today() {
  const caller = await currentCaller();
  const snap = await buildSnapshot(caller);
  const now = new Date();
  const hasDate = todayHasDate(snap.plan);
  const building = snap.horizon === "building";
  const next = hasDate ? snap.plan.milestones[0] : null;
  const last = snap.recentCommitments.find((commitment) => commitment.status !== "open") ?? null;
  const rows = hasDate ? todayPayments(snap.debts, snap.split.toDebt, snap.strategy) : [];
  const reviewAge = snap.lastReview ? now.getTime() - snap.lastReview.completedAt.getTime() : Infinity;
  const reviewDue = snap.reviewCadence === "weekly"
    ? reviewAge >= 7 * 24 * 60 * 60 * 1000
    : snap.payday.isWindow && reviewAge >= 3 * 24 * 60 * 60 * 1000;

  return (
    <>
      <h1 className="text-[27px] font-bold tracking-tight text-ink-900">Today</h1>
      <TodayHero snap={snap} />
      {!building && reviewDue ? <PaydayInvitation daysUntil={snap.payday.daysUntil} cadence={snap.reviewCadence} /> : null}
      {!building ? <TodayPayments rows={rows} currency={snap.country.currency} readOnly={isDemo(caller)} /> : null}
      {!building || snap.commitments.length > 0 ? (
        <CommitmentBoard
          commitments={snap.commitments.map((commitment) => ({ ...commitment, dueAt: commitment.dueAt?.toISOString() ?? null }))}
          last={last}
          growth={snap.growth}
          now={now.toISOString()}
          readOnly={isDemo(caller)}
        />
      ) : null}
      <HomeAgendas agendas={agendasFor(snap)} hasHistory={snap.sessions.length > 0} />
      {next ? (
        <section className="rounded-card border border-rule bg-card p-5">
          <p className="label">The next card you finish with</p>
          <h2 className="mt-2 text-[19px] font-bold text-ink-900">{next.name}</h2>
          <p className="mt-1 text-[14px] text-ink-400">Estimated payoff: {next.clearedOn}</p>
        </section>
      ) : null}
    </>
  );
}
