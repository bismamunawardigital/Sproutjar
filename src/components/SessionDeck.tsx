"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RenContract } from "@/components/RenContract";
import { RenSession } from "@/components/RenSession";
import { SessionClose } from "@/components/SessionClose";
import type { Agenda } from "@/lib/agendas";
import { recordRenTalk, type RenTalkRecord } from "@/lib/ren";

export function SessionDeck({ userName, initialAgenda = null, agendas = [], commitments = [], contracted, guest }: {
  userName: string;
  initialAgenda?: Agenda | null;
  agendas?: Agenda[];
  commitments?: { id: string; wish: string; trigger: string }[];
  contracted: boolean;
  guest: boolean;
}) {
  const [ended, setEnded] = useState(false);
  const router = useRouter();
  const [talk, setTalk] = useState<RenTalkRecord | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [savingTalk, setSavingTalk] = useState(false);
  const [talkError, setTalkError] = useState<string | null>(null);
  const savingAttempt = useRef(0);
  const [saidByYou, setSaidByYou] = useState<string[]>([]);
  const [agenda, setAgenda] = useState(initialAgenda ?? agendas[0] ?? null);
  const [beforeCall, setBeforeCall] = useState(() => new Set(commitments.map((commitment) => commitment.id)));
  const fresh = commitments.find((commitment) => !beforeCall.has(commitment.id)) ?? null;
  const choices = agenda && !agendas.some((choice) => choice.id === agenda.id) ? [agenda, ...agendas] : agendas;
  async function saveTalk(record: RenTalkRecord) {
    const attempt = ++savingAttempt.current;
    setSavingTalk(true);
    setTalkError(null);
    try {
      const id = await recordRenTalk(record);
      if (attempt !== savingAttempt.current) return;
      setSessionId(id);
      router.refresh();
    } catch {
      if (attempt === savingAttempt.current) setTalkError("Your talk didn't save. Your words are still here. Try again before keeping a step.");
    } finally {
      if (attempt === savingAttempt.current) setSavingTalk(false);
    }
  }
  return (
    <div className="space-y-5">
      {ended ? <><SessionClose commitment={fresh} saidByYou={saidByYou} readOnly={guest} sessionId={sessionId} savingTalk={savingTalk} talkError={talkError} onRetryTalk={talk ? () => void saveTalk(talk) : undefined} /><button onClick={() => { savingAttempt.current++; setBeforeCall(new Set(commitments.map((commitment) => commitment.id))); setEnded(false); }} className="min-h-11 w-full text-[14px] font-bold text-stem-700">Back to Ren</button></> : <RenSession guest={guest} userName={userName} agenda={agenda} agendas={choices} onAgenda={setAgenda} minutes={agenda?.minutes ?? 20} onEnded={(spoken, record) => { setSaidByYou(spoken); setEnded(true); setTalk(record); setSessionId(null); if (record) void saveTalk(record); else { setSavingTalk(false); setTalkError("Ren couldn't identify this talk. Your words are still here."); } }} />}
      {!guest ? <RenContract contracted={contracted} compact={contracted} /> : null}
    </div>
  );
}
