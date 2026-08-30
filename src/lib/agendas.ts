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
    title: "Where things actually stand",
    reason: "What you owe, what it's costing you, and roughly when it's over.",
    technique: "Getting clear",
    minutes: 20,
  },
  {
    id: "ordinary-tuesday",
    title: "An ordinary Tuesday, once this is over",
    reason: "What a normal week actually looks like when the cards are gone.",
    technique: "Looking ahead",
    minutes: 20,
  },
  {
    id: "last-plan",
    title: "The times a plan did work",
    reason: "What was going on then, and what of that you could get back.",
    technique: "Looking back",
    minutes: 20,
  },
  {
    id: "months-it-didnt",
    title: "The months that went fine",
    reason: "It hasn't been like this every month. What was different back then?",
    technique: "What works",
    minutes: 10,
  },
  {
    id: "uncomfortable-for",
    title: "What you'd put up with, and what you wouldn't",
    reason: "The things you're not willing to give up, and building the plan around them.",
    technique: "What matters to you",
    minutes: 40,
  },
  {
    id: "who-else",
    title: "Who else could take some of this",
    reason: "Help you haven't asked for, and set-ups that work without willpower.",
    technique: "Finding support",
    minutes: 20,
  },
];

export const OPEN_AGENDA: Agenda = {
  id: "open",
  title: "Something else",
  reason: "Tell Ren where you want to start.",
  technique: "Up to you",
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
          )} you said it might be because ${lowerFirst(
            context.belief.text,
          )} Worth looking at, because it would explain more than just this month.`
        : `"${context.missedCommitment.wish}" didn't happen. Not why — just what got in the way.`,
      technique: "Working out what happened",
      minutes: 15,
    });
  }

  generated.push({
    id: "the-bleed",
    title: "What the interest is really costing you",
    reason: `${context.currency} ${Math.round(context.monthlyBleed).toLocaleString(
      "en-US",
    )} goes on interest this month. There are ways to bring that number down — worth a look.`,
    technique: "Getting clear",
    minutes: 20,
  });

  if (context.sessionsHeld > 0) {
    generated.push({
      id: "what-worked",
      title: "The weeks that did go well",
      reason: "Three of the last eleven weeks went the way you wanted. Worth knowing why.",
      technique: "What works",
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
