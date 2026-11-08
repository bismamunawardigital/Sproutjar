export function onboardingRedirect(onboardedAt: number | undefined): "/dashboard" | null {
  return onboardedAt ? "/dashboard" : null;
}
