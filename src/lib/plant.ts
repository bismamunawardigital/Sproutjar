import type { PlantState } from "@/components/Plant";

export type GrowthInput = {
  openingPrincipal: number;
  currentPrincipal: number;
  sessionsHeld: number;
  commitmentsKept: number;
  weeksActive: number;
  /** Growth already banked. The stem is never drawn below it. */
  stemPeak: number;
};

const LEAF_MILESTONES = [0.1, 0.25, 0.5, 0.75, 1];

/**
 * Stem grows on principal cleared. Roots grow on the talks: one root per
 * conversation held. The two are deliberately separate so a hard month still
 * moves something.
 */
export function plantState(input: GrowthInput): PlantState {
  const cleared = Math.max(0, input.openingPrincipal - input.currentPrincipal);
  const earned = input.openingPrincipal > 0 ? Math.min(1, cleared / input.openingPrincipal) : 0;
  // Owning up to a card you had been hiding is progress, not a setback, so the
  // stem holds at its high-water mark and grows again from there.
  const stemPct = Math.max(earned, Math.min(1, input.stemPeak));
  const leafPairs = LEAF_MILESTONES.filter((milestone) => stemPct >= milestone).length;
  // One root per talk, plus one for turning up at all. Nothing else moves them,
  // so the roots read as exactly what they are: conversations held.
  const rootDepth = Math.max(1, Math.min(12, input.sessionsHeld + 1));

  return {
    stemPct,
    leafPairs,
    rootDepth,
    sparks: earned >= 1,
    cleared: input.currentPrincipal <= 0 && input.openingPrincipal > 0,
  };
}

export function principalCleared(openingPrincipal: number, currentPrincipal: number): number {
  return Math.max(0, openingPrincipal - currentPrincipal);
}
