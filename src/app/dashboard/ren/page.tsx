import { SessionDeck } from "@/components/SessionDeck";
import { SessionImpact } from "@/components/SessionImpact";
import { agendasFor } from "@/lib/session-agendas";
import { isGuestDemo } from "@/lib/caller";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function RenPage({
  searchParams,
}: {
  searchParams: Promise<{ agenda?: string }>;
}) {
  const [snap, params, guest] = await Promise.all([buildSnapshot(), searchParams, isGuestDemo()]);
  const agendas = agendasFor(snap);
  const picked = agendas.find((agenda) => agenda.id === params.agenda) ?? null;
  const suggested = agendas.find((agenda) => agenda.id !== picked?.id) ?? null;

  const talks = snap.sessions.map((session) => {
    const produced = session.commitments[0];
    return {
      id: session.id,
      agenda: session.agenda,
      mode: session.mode,
      startedAt: session.startedAt,
      wish: produced ? produced.wish : null,
      status: produced ? produced.status : null,
    };
  });

  return (
    <>
      <SessionDeck
        guest={guest}
        userName={snap.user.name}
        initialAgenda={picked}
        agendas={agendas}
        contracted={typeof snap.user.contractedAt === "number" || snap.sessions.length > 0}
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
