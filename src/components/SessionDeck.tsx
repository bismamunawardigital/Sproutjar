"use client";

import { useState } from "react";
import { AgendaBlock } from "@/components/AgendaBlock";
import { RenSession } from "@/components/RenSession";
import type { Agenda } from "@/lib/agendas";

/**
 * The session card and the agenda list are one thing: picking an agenda loads
 * it into Ren's card with its length and its reason already stated.
 */
export function SessionDeck({
  userName,
  agendas,
  openAgenda,
}: {
  userName: string;
  agendas: Agenda[];
  openAgenda: Agenda;
}) {
  const [picked, setPicked] = useState<Agenda | null>(null);
  const [minutes, setMinutes] = useState(20);

  return (
    <div className="space-y-4">
      <RenSession userName={userName} agenda={picked} minutes={minutes} />
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
