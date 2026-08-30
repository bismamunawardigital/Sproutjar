import { SessionDeck } from "@/components/SessionDeck";
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

  return (
    <SessionDeck
      userName={snap.user.name}
      initialAgenda={picked}
      commitment={
        snap.commitments[0]
          ? { wish: snap.commitments[0].wish, trigger: snap.commitments[0].trigger }
          : null
      }
    />
  );
}
