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

/**
 * What Ren coaches once the cards are gone. Same relationship, different goal:
 * the money now has to be pointed at something rather than away from a bank.
 */
export const BUILDING_AGENDAS: Agenda[] = [
  {
    id: "where-it-goes-now",
    title: "Where the card money goes now",
    reason:
      "The payment that was clearing the cards is still leaving your account. Deciding where before it decides for itself.",
    technique: "Getting clear",
    minutes: 20,
  },
  {
    id: "a-year-of-cover",
    title: "How much cover is enough",
    reason:
      "Three months, six, a year. Not the textbook answer — the number that would let you sleep.",
    technique: "What matters to you",
    minutes: 20,
  },
  {
    id: "first-investment",
    title: "The first money you don't touch",
    reason:
      "What investing would mean for you, what you'd want to understand first, and what would make you pull it back out.",
    technique: "Working it out",
    minutes: 20,
  },
  {
    id: "the-asks",
    title: "The asks, now that there's money there",
    reason:
      "Family knows when things ease. What you want to say yes to, and where the line goes.",
    technique: "What matters to you",
    minutes: 20,
  },
  {
    id: "not-going-back",
    title: "What would put you back on the cards",
    reason:
      "You know the shape of it now. Naming it while nothing is going wrong is the cheap time to do it.",
    technique: "Looking ahead",
    minutes: 15,
  },
];

export type AgendaContext = {
  name: string;
  currency: string;
  monthlyBleed: number;
  missedCommitment?: { wish: string; createdAt: Date } | null;
  openCommitment?: { wish: string; trigger: string } | null;
  belief?: { text: string; namedOn: Date } | null;
  sessionsHeld: number;
  /** The last review's four numbers, when there has been one. */
  lastReview?: {
    completedAt: Date;
    principalRepaid: number;
    interestCharged: number;
    newBorrowing: number;
    reflection: string;
  } | null;
  /** Weeks of history where the balance went the way the plan said it would, out of the total. */
  weeksOnPlan?: { onPlan: number; total: number } | null;
  /** Set in the days around payday: the amount the person decided on, and whether it was theirs or derived. */
  payday?: { amount: number; source: "derived" | "chosen"; isWindow: boolean } | null;
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

  const review = context.lastReview ?? null;
  const money = (n: number) => `${context.currency} ${Math.round(n).toLocaleString("en-US")}`;

  if (context.payday?.isWindow) {
    generated.push({
      id: "payday",
      title: "What goes to the cards this payday",
      reason: `You decided on ${money(context.payday.amount)}${
        context.payday.source === "chosen" ? ", your own figure" : ""
      }. If this month is different, say so and the date moves. No one is marking this.`,
      technique: "Deciding, not being told",
      minutes: 10,
    });
  }

  if (review && review.newBorrowing > 0) {
    generated.push({
      id: "review-gap",
      title: "What went on the cards last month",
      reason: `Your ${monthName(review.completedAt)} review shows ${money(
        review.newBorrowing,
      )} new on a card while ${money(review.principalRepaid)} came off. Not a verdict. What was that week like?`,
      technique: "Working out what happened",
      minutes: 15,
    });
  }

  // The price of the debt is only raised when the numbers say it is the problem:
  // a month where the bank took more than the plan cleared.
  if (review && review.interestCharged > review.principalRepaid) {
    generated.push({
      id: "the-price",
      title: "Whether the debt could cost less",
      reason: `Last month ${money(review.interestCharged)} went on interest and ${money(
        review.principalRepaid,
      )} came off the balance. When the bank is ahead of you, moving a balance to a lower rate is worth exploring. Nothing moves unless you decide it does.`,
      technique: "Getting clear",
      minutes: 20,
    });
  } else {
    generated.push({
      id: "the-bleed",
      title: "What the interest is really costing you",
      reason: `${money(context.monthlyBleed)} goes on interest this month. Knowing the number changes what the minimum payment feels like.`,
      technique: "Getting clear",
      minutes: 20,
    });
  }

  if (context.weeksOnPlan && context.weeksOnPlan.total > 0 && context.weeksOnPlan.onPlan > 0) {
    generated.push({
      id: "what-worked",
      title: "The weeks that did go well",
      reason: `${context.weeksOnPlan.onPlan} of the last ${context.weeksOnPlan.total} weeks the balance came down by at least what you planned. Worth knowing what those weeks had.`,
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
