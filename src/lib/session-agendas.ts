import {
  BUILDING_AGENDAS,
  generatedAgendas,
  shuffledStarters,
  type Agenda,
} from "@/lib/agendas";
import type { Snapshot } from "@/lib/user";

/** The same agenda set backs the Home prompt and Ren's own screen. */
export function agendasFor(snap: Snapshot): Agenda[] {
  // Cards gone: the interest agenda has nothing to point at, and the work turns
  // to where the money goes instead.
  if (snap.horizon === "building") {
    const cover = snap.runwayMonths;
    return [
      {
        ...BUILDING_AGENDAS[0],
        reason:
          cover < 3
            ? `The card payment is free now, and the jars would cover ${cover.toFixed(1)} months. Where that money goes next is the whole question.`
            : BUILDING_AGENDAS[0].reason,
      },
      ...BUILDING_AGENDAS.slice(1),
    ];
  }

  const belief = snap.beliefs[0] ?? null;
  const missed = snap.recentCommitments.find((c) => c.status === "missed") ?? null;

  const generated = generatedAgendas({
    name: snap.user.name,
    currency: snap.country.currency,
    monthlyBleed: snap.plan.monthlyBleed,
    missedCommitment: missed ? { wish: missed.wish, createdAt: missed.createdAt } : null,
    belief: belief ? { text: belief.text, namedOn: belief.namedOn } : null,
    sessionsHeld: snap.sessions.length,
    lastReview: snap.lastReview,
    weeksOnPlan: weeksOnPlan(snap),
    payday: { amount: snap.attack.amount, source: snap.attack.source, isWindow: snap.payday.isWindow },
  });

  return snap.sessions.length > 0 ? generated : shuffledStarters(snap.debts.length + 7);
}

/**
 * Of the last twelve weeks on record, how many saw the total come down by at
 * least the plan's weekly share of principal. Counted from what was logged, so
 * the line Ren opens with is always true of this person.
 */
function weeksOnPlan(snap: Snapshot): { onPlan: number; total: number } | null {
  const points = snap.history.slice(-13);
  if (points.length < 2) return null;
  const weeklyPrincipal = Math.max(0, (snap.surplus - snap.plan.monthlyBleed) * 12 / 52);
  let onPlan = 0;
  for (let i = 1; i < points.length; i += 1) {
    if (points[i - 1].total - points[i].total >= weeklyPrincipal * 0.9) onPlan += 1;
  }
  return { onPlan, total: points.length - 1 };
}
