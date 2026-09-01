import { SessionDeck } from "@/components/SessionDeck";
import { SessionImpact } from "@/components/SessionImpact";
import { agendasFor } from "@/lib/session-agendas";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function RenPage({
  searchParams,
}: {
  searchParams: Promise<{ agenda?: string }>;
}) {
  const [snap, params] = await Promise.all([buildSnapshot(), searchParams]);
  const agendas = agendasFor(snap);
  const picked = agendas.find((agenda) => agenda.id === params.agenda) ?? null;
  const suggested = agendas.find((agenda) => agenda.id !== picked?.id) ?? null;

  const talks = snap.sessions.map((session) => {
    const produced = session.commitments[0];
    return {
      id: session.id,
      agenda: session.agenda,
      startedAt: session.startedAt,
      wish: produced ? produced.wish : null,
      status: produced ? produced.status : null,
    };
  });

  return (
    <>
      <SessionDeck
        userName={snap.user.name}
        initialAgenda={picked}
        commitment={
          snap.commitments[0]
            ? { wish: snap.commitments[0].wish, trigger: snap.commitments[0].trigger }
            : null
        }
        nextAgenda={suggested ? { id: suggested.id, title: suggested.title } : null}
      />

      <SessionImpact
        history={snap.history}
        talks={talks}
        currency={snap.country.currency}
      />
    </>
  );
}
