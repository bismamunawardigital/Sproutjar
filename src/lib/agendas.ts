export type Agenda = {
  id: string;
  title: string;
  reason: string;
  technique: string;
  minutes: number;
};

/**
 * A session card never says "chat with Ren". It states a length, an agenda,
 * and why that agenda exists — which is the thing a general assistant cannot do.
 */
export const STARTER_AGENDAS: Agenda[] = [
  {
    id: "where-this-stands",
    title: "Where this actually stands",
    reason: "What you owe, what it's costing you, and roughly when it ends.",
    technique: "Reality before resources",
    minutes: 20,
  },
  {
    id: "ordinary-tuesday",
    title: "An ordinary Tuesday, eighteen months out",
    reason: "Not a slogan. What your actual week looks like once this is gone.",
    technique: "Best possible self",
    minutes: 20,
  },
  {
    id: "last-plan",
    title: "The last plan that didn't stick",
    reason: "What happened, and what was different the times it did work.",
    technique: "Past-success and exception questions",
    minutes: 20,
  },
  {
    id: "months-it-didnt",
    title: "The months this didn't happen",
    reason: "You weren't like this every month. What was different then?",
    technique: "Solution-focused exceptions",
    minutes: 10,
  },
  {
    id: "uncomfortable-for",
    title: "What you'd be uncomfortable for",
    reason: "The stuff that isn't up for negotiation, and building around it.",
    technique: "Values clarification",
    minutes: 40,
  },
  {
    id: "who-else",
    title: "Who else could carry some of this",
    reason: "Help you haven't asked for, and systems that could do it instead of willpower.",
    technique: "Resource activation",
    minutes: 20,
  },
];

export const OPEN_AGENDA: Agenda = {
  id: "open",
  title: "Something else entirely",
  reason: "Tell me where to start.",
  technique: "Open",
  minutes: 20,
};

export type AgendaContext = {
  name: string;
  currency: string;
  monthlyBleed: number;
  missedCommitment?: { wish: string; createdAt: Date } | null;
  openCommitment?: { wish: string; trigger: string } | null;
  belief?: { text: string; namedOn: Date } | null;
  sessionsHeld: number;
};

function monthName(date: Date): string {
  return date.toLocaleDateString("en-GB", { month: "long" });
}

/**
 * Generated from what actually happened, not from a menu. Where a pattern and a
 * belief line up, the card names both and dates the belief.
 */
export function generatedAgendas(context: AgendaContext): Agenda[] {
  const generated: Agenda[] = [];

  if (context.missedCommitment) {
    generated.push({
      id: "gap",
      title: "The gap between deciding and doing",
      reason: context.belief
        ? `"${context.missedCommitment.wish}" didn't happen. In ${monthName(
            context.belief.namedOn,
          )} you said the thing behind it might be that ${lowerFirst(
            context.belief.text,
          )} I'd like to poke at that, because if it's right it explains more than this month.`
        : `"${context.missedCommitment.wish}" didn't happen. Not why — what happened between deciding and the moment it didn't.`,
      technique: "Behaviour chain analysis",
      minutes: 15,
    });
  }

  generated.push({
    id: "the-bleed",
    title: "What the interest is actually costing",
    reason: `${context.currency} ${Math.round(
      context.monthlyBleed,
    ).toLocaleString("en-US")} of rent on the debt this month, before a dirham of it comes down. Worth understanding where that goes.`,
    technique: "Reality before resources",
    minutes: 20,
  });

  if (context.sessionsHeld > 0) {
    generated.push({
      id: "what-worked",
      title: "The weeks it did work",
      reason: "Three of the last eleven weeks went the way you wanted. Those are worth taking apart.",
      technique: "Solution-focused exceptions",
      minutes: 10,
    });
  }

  return generated;
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Four at a time, shuffled, plus the open option which is never buried. */
export function shuffledStarters(seed: number, count = 4): Agenda[] {
  const pool = [...STARTER_AGENDAS];
  const picked: Agenda[] = [];
  let cursor = seed;
  while (picked.length < count && pool.length > 0) {
    cursor = (cursor * 1103515245 + 12345) % 2147483648;
    picked.push(pool.splice(cursor % pool.length, 1)[0]);
  }
  return picked;
}
