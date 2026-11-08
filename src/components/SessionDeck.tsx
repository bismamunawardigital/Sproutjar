"use client";

import { useState } from "react";
import { RenContract } from "@/components/RenContract";
import { RenSession } from "@/components/RenSession";
import { SessionClose } from "@/components/SessionClose";
import type { Agenda } from "@/lib/agendas";

export function SessionDeck({ userName, initialAgenda = null, agendas = [], commitments = [], contracted, guest }: {
  userName: string;
  initialAgenda?: Agenda | null;
  agendas?: Agenda[];
  commitments?: { id: string; wish: string; trigger: string }[];
  contracted: boolean;
  guest: boolean;
}) {
  const [ended, setEnded] = useState(false);
  const [saidByYou, setSaidByYou] = useState<string[]>([]);
  const [agenda, setAgenda] = useState(initialAgenda ?? agendas[0] ?? null);
  const [beforeCall, setBeforeCall] = useState(() => new Set(commitments.map((commitment) => commitment.id)));
  const fresh = commitments.find((commitment) => !beforeCall.has(commitment.id)) ?? null;
  const choices = agenda && !agendas.some((choice) => choice.id === agenda.id) ? [agenda, ...agendas] : agendas;
  return (
    <div className="space-y-5">
      {ended ? <><SessionClose commitment={fresh} saidByYou={saidByYou} readOnly={guest} /><button onClick={() => { setBeforeCall(new Set(commitments.map((commitment) => commitment.id))); setEnded(false); }} className="min-h-11 w-full text-[14px] font-bold text-stem-700">Back to Ren</button></> : <RenSession guest={guest} userName={userName} agenda={agenda} agendas={choices} onAgenda={setAgenda} minutes={agenda?.minutes ?? 20} onEnded={(spoken) => { setSaidByYou(spoken); setEnded(true); }} />}
      {!guest ? <RenContract contracted={contracted} compact={contracted} /> : null}
    </div>
  );
}
