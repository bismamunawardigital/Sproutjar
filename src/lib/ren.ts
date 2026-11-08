import type { Agenda } from "./agendas";
import { ONBOARDING_QUESTIONS, type OnboardingAnswers } from "./onboarding";

const PATTERNS = {
  stuck: ["See how much of each payment goes to interest", "Why it feels like nothing will change", "Find the one change that frees up the most", "See what moved, and decide where it goes next"],
  fade: ["Pick one habit small enough to keep for a week", "Why your last plans faded", "Plan for the day it usually slips", "Keep what worked, and set next month's goal"],
  away: ["See what you owe and what it costs each month", "What stops you opening your statements", "Make statement day easy, step by step", "See what changed once you started looking"],
  carry: ["Fit family support and your cards into one plan", "What makes doing both feel impossible", "Plan for months when family needs more", "See how you managed both, and what to keep"],
} as const;

export function firstCallAgendas(answers: OnboardingAnswers, sessions: number): Agenda[] {
  if (!Number.isInteger(sessions) || sessions < 0 || sessions >= 4) return [];
  const keys = ["stuck", "fade", "away", "carry"] as const;
  const scores = { stuck: 0, fade: 0, away: 0, carry: 0 };
  let last: typeof keys[number] | undefined;
  for (const question of ONBOARDING_QUESTIONS) {
    const index = question.options.findIndex((option) => option === answers[question.id]);
    if (index < 0) continue;
    last = keys[index];
    scores[last] += 2;
  }
  if (!last) return [];
  scores[last] += 1;
  return keys.slice().sort((a, b) => scores[b] - scores[a]).slice(0, 2).map((pattern) => ({
    id: `set-b-${pattern}-${sessions + 1}`,
    title: PATTERNS[pattern][sessions],
    reason: `${PATTERNS[pattern][sessions]}.\nStart with what they want from this call, ask what actually happened, explore their options, and let them choose one thing to try and when. Family support stays in the plan; never suggest giving less.`,
    technique: ["Getting clear", "Looking back", "If-then planning", "What works"][sessions],
    minutes: 20,
  }));
}

export type RenLine = { role: "ren" | "you"; text: string };

export function appendRenLine(lines: RenLine[], line: RenLine): RenLine[] {
  if (!line.text.trim()) return lines;
  const last = lines.at(-1);
  if (last?.role === line.role && (line.text.startsWith(last.text) || last.text.startsWith(line.text))) {
    return line.text.length > last.text.length ? [...lines.slice(0, -1), line] : lines;
  }
  return [...lines, line];
}

export function wordsToKeep(words: string[]): string | null {
  const candidate = words.map((line) => line.trim()).filter((line) => line.length >= 40).sort((a, b) => b.length - a.length)[0];
  if (!candidate) return null;
  if (candidate.length <= 140) return candidate;
  const cut = candidate.slice(0, 140);
  const stop = Math.max(cut.lastIndexOf("."), cut.lastIndexOf(","), cut.lastIndexOf(" "));
  return `${cut.slice(0, stop > 60 ? stop : 140).trim()}…`;
}

export type RenTalkRecord = {
  conversationId: string;
  agenda: string;
  agendaReason: string;
  technique: string;
  plannedMinutes: number;
  contractChoice: string;
  mode: "voice" | "text";
  startedAt: number;
  endedAt: number;
};

export async function recordRenTalk(talk: RenTalkRecord, request: typeof fetch = fetch): Promise<string> {
  const response = await request("/api/sessions", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(talk),
  });
  if (!response.ok) throw new Error("Your talk didn't save. Try again before keeping a step.");
  const result = await response.json();
  if (typeof result?.id !== "string" || !result.id) throw new Error("Your talk didn't save. Try again before keeping a step.");
  return result.id;
}

export async function keepRenStep(wish: string, trigger: string, request: typeof fetch = fetch, sessionId?: string) {
  if (!wish.trim()) throw new Error("Write the thing you want to keep first.");
  const response = await request("/api/commitments", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wish: wish.trim(), trigger: trigger.trim(), ownershipConfirmed: true, ...(sessionId ? { sessionId } : {}) }),
  });
  if (!response.ok) throw new Error("That didn't save. Your words are still here. Try again.");
}

export async function decideRenProposal(id: string, action: "apply" | "discard", request: typeof fetch = fetch) {
  const response = await request(`/api/proposals/${encodeURIComponent(id)}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }),
  });
  if (!response.ok) throw new Error("That didn't save. The proposal is still here. Try again.");
}
