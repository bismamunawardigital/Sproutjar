"use client";

import Link from "next/link";
import { useState } from "react";
import { RenContract } from "@/components/RenContract";
import { RenSession } from "@/components/RenSession";
import { SessionClose } from "@/components/SessionClose";
import type { Agenda } from "@/lib/agendas";

/**
 * Ren's screen is the call. Today hands over the opener; the other topics Ren
 * would raise sit here as a row underneath, and once a call ends the close card
 * takes over.
 */
export function SessionDeck({
  userName,
  initialAgenda = null,
  agendas = [],
  commitment = null,
  nextAgenda = null,
  contracted,
}: {
  userName: string;
  initialAgenda?: Agenda | null;
  agendas?: Agenda[];
  commitment?: { wish: string; trigger: string } | null;
  nextAgenda?: { id: string; title: string } | null;
  contracted: boolean;
}) {
  const [ended, setEnded] = useState(false);
  const [saidByYou, setSaidByYou] = useState<string[]>([]);
  const others = agendas.filter((agenda) => agenda.id !== initialAgenda?.id).slice(0, 4);

  return (
    <div className="space-y-4">
      {contracted ? null : <RenContract contracted={false} />}

      <RenSession
        userName={userName}
        agenda={initialAgenda}
        minutes={initialAgenda?.minutes ?? 20}
        onEnded={(spoken) => {
          setSaidByYou(spoken);
          setEnded(true);
        }}
      />

      {ended ? (
        <SessionClose
          commitment={commitment}
          saidByYou={saidByYou}
          nextAgenda={nextAgenda}
        />
      ) : null}

      {!ended && others.length > 0 ? (
        <section>
          <p className="label px-1">
            {initialAgenda ? "Or start somewhere else" : "Ren would raise"}
          </p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {others.map((agenda) => (
              <Link
                key={agenda.id}
                href={`/dashboard/ren?agenda=${agenda.id}`}
                className="shrink-0 rounded-full border border-rule bg-card px-3.5 py-2 text-[13px] font-bold text-ink-600 transition hover:border-stem"
              >
                {agenda.title}
                <span className="n ml-2 text-[11px] font-bold text-ink-300">{agenda.minutes} min</span>
              </Link>
            ))}
            {initialAgenda ? (
              <Link
                href="/dashboard/ren"
                className="shrink-0 rounded-full border border-dashed border-rule px-3.5 py-2 text-[13px] font-bold text-ink-400 transition hover:border-stem"
              >
                Open, no topic
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      {contracted ? <RenContract contracted compact /> : null}
    </div>
  );
}
