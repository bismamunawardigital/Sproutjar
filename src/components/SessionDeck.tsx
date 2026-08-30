"use client";

import { useState } from "react";
import { AgendaBlock } from "@/components/AgendaBlock";
import { RenSession } from "@/components/RenSession";
import { SessionClose } from "@/components/SessionClose";
import type { Agenda } from "@/lib/agendas";

/**
 * The session card and the agenda list are one thing: picking an agenda loads
 * it into Ren's card with its length and its reason already stated. Once a call
 * has happened, the close card takes over the bottom of the screen.
 */
export function SessionDeck({
  userName,
  agendas,
  openAgenda,
  initialAgenda = null,
  commitment = null,
}: {
  userName: string;
  agendas: Agenda[];
  openAgenda: Agenda;
  initialAgenda?: Agenda | null;
  commitment?: { wish: string; trigger: string } | null;
}) {
  const [picked, setPicked] = useState<Agenda | null>(initialAgenda);
  const [minutes, setMinutes] = useState(initialAgenda?.minutes ?? 20);
  const [ended, setEnded] = useState(false);

  return (
    <div className="space-y-4">
      <RenSession
        userName={userName}
        agenda={picked}
        minutes={minutes}
        onEnded={() => setEnded(true)}
      />

      {ended ? <SessionClose commitment={commitment} /> : null}

      <AgendaBlock
        agendas={agendas}
        openAgenda={openAgenda}
        onPick={(agenda, chosenMinutes) => {
          setPicked(agenda);
          setMinutes(agenda.id === openAgenda.id ? chosenMinutes : agenda.minutes);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
