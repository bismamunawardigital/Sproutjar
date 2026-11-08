import { savePlanChange } from "./plan";

export const STORY_FIELDS = [
  { key: "moneyPurpose", label: "What the money is for", note: "Ren comes back to this when a month goes sideways." },
  { key: "goodDecision", label: "Something you already did that worked", note: "" },
  { key: "upbringing", label: "Where your money story starts", note: "" },
] as const;

export function deletionConfirmed(word: string) { return word.trim().toLowerCase() === "delete"; }

export async function deleteSproutjarAccount(request: typeof fetch = fetch) {
  return savePlanChange("/api/account", "DELETE", undefined, request);
}
