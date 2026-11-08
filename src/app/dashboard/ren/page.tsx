import { SessionDeck } from "@/components/SessionDeck";
import { SessionImpact } from "@/components/SessionImpact";
import { PendingTransfers } from "@/components/PendingTransfers";
import { agendasFor, renAgendasFor, requestedAgenda } from "@/lib/session-agendas";
import { currentCaller, isDemo } from "@/lib/caller";
import { buildSnapshot } from "@/lib/user";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Ren, your AI coach · Sproutjar");

export const dynamic = "force-dynamic";

export default async function RenPage({
  searchParams,
}: {
  searchParams: Promise<{ agenda?: string }>;
}) {
  const caller = await currentCaller();
  const [snap, params] = await Promise.all([buildSnapshot(caller), searchParams]);
  const guest = isDemo(caller);
  const agendas = renAgendasFor(snap);
  const picked = requestedAgenda([...agendas, ...agendasFor(snap)], params.agenda);

  const talks = snap.sessions.map((session) => {
    const produced = session.commitments[0];
    return {
      id: session.id,
      agenda: session.agenda,
      mode: session.mode,
      summary: session.summary,
      startedAt: session.startedAt,
      wish: produced ? produced.wish : null,
      status: produced ? produced.status : null,
    };
  });

  return (
    <>
      <h1 className="text-[27px] font-bold tracking-tight text-ink-900">Ren</h1>
      <SessionDeck
        key={params.agenda ?? "room"}
        guest={guest}
        userName={snap.user.name}
        initialAgenda={picked}
        agendas={agendas}
        contracted={typeof snap.user.contractedAt === "number" || snap.sessions.length > 0}
        commitments={snap.recentCommitments.map(({ id, wish, trigger }) => ({ id, wish, trigger }))}
      />

      <PendingTransfers transfers={snap.proposals.filter((proposal) => proposal.kind === "balance_move").map((proposal) => ({ ...proposal, on: proposal.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) }))} currency={snap.country.currency} monthlyAttack={snap.attack.amount} readOnly={guest} />
      <SessionImpact
        history={snap.history}
        talks={talks}
        currency={snap.country.currency}
      />
    </>
  );
}
