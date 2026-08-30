import { generatedAgendas, shuffledStarters, type Agenda } from "@/lib/agendas";
import type { Snapshot } from "@/lib/user";

/** The same agenda set backs the Home prompt and Ren's own screen. */
export function agendasFor(snap: Snapshot): Agenda[] {
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

  return snap.sessions.length > 0 ? generated : shuffledStarters(snap.debts.length + 7);
}
