export type JarInput = {
  id: string;
  name: string;
  purpose: string;
  target: number;
  saved: number;
};

export type JarProgress = JarInput & {
  pct: number;
  remaining: number;
  /** Months to fill the jar at the current contribution rate, null when nothing is going in. */
  monthsToFull: number | null;
  stage: "seed" | "sprout" | "sapling" | "grown";
};

function stageFor(pct: number): JarProgress["stage"] {
  if (pct >= 100) return "grown";
  if (pct >= 66) return "sapling";
  if (pct >= 25) return "sprout";
  return "seed";
}

export function jarProgress(jar: JarInput, monthlyContribution = 0): JarProgress {
  const pct = jar.target > 0 ? Math.min(100, (jar.saved / jar.target) * 100) : 0;
  const remaining = Math.max(0, jar.target - jar.saved);
  return {
    ...jar,
    pct: Math.round(pct),
    remaining,
    monthsToFull:
      remaining === 0 ? 0 : monthlyContribution > 0 ? Math.ceil(remaining / monthlyContribution) : null,
    stage: stageFor(pct),
  };
}

/**
 * Ren's step 3: one month of essentials sits in a jar before any extra goes at the debt,
 * because without it the first surprise bill goes straight back on the card.
 */
export function recommendedStarterJar(monthlyEssentials: number): number {
  return Math.round(monthlyEssentials);
}

/**
 * Splits the monthly surplus between the starter jar and the debt attack.
 * The jar is filled first, then everything flows to the cards.
 */
export function allocateSurplus(
  surplus: number,
  starterJarTarget: number,
  jarSaved: number,
): { toJar: number; toDebt: number; jarComplete: boolean } {
  const gap = Math.max(0, starterJarTarget - jarSaved);
  if (gap <= 0) return { toJar: 0, toDebt: Math.max(0, surplus), jarComplete: true };
  const toJar = Math.min(surplus, Math.max(gap * 0.5, Math.min(gap, surplus * 0.5)));
  return {
    toJar: Math.round(Math.min(toJar, gap)),
    toDebt: Math.round(Math.max(0, surplus - Math.min(toJar, gap))),
    jarComplete: false,
  };
}
