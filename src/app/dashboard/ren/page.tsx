import { SessionDeck } from "@/components/SessionDeck";
import { OPEN_AGENDA, generatedAgendas, shuffledStarters } from "@/lib/agendas";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function RenPage() {
  const snap = await buildSnapshot();
  const belief = snap.beliefs[0] ?? null;
  const missed = snap.recentCommitments.find((c) => c.status === "missed") ?? null;

  const generated = generatedAgendas({
    name: snap.user.name,
    currency: snap.country.currency,
    monthlyBleed: snap.plan.monthlyBleed,
    missedCommitment: missed ? { wish: missed.wish, createdAt: missed.createdAt } : null,
    belief: belief ? { text: belief.text, namedOn: belief.namedOn } : null,
    sessionsHeld: snap.sessions.length,
  });

  const agendas = snap.sessions.length > 0 ? generated : shuffledStarters(snap.debts.length + 7);

  return <SessionDeck userName={snap.user.name} agendas={agendas} openAgenda={OPEN_AGENDA} />;
}
