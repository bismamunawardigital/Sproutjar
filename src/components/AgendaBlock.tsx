"use client";

import { useState } from "react";
import type { Agenda } from "@/lib/agendas";

const LENGTHS = [10, 20, 40, 60];

/**
 * The dashboard's empty state is a set of agendas, never a blank prompt.
 * Every card carries a length, an agenda and the reason that agenda exists.
 */
export function AgendaBlock({
  agendas,
  openAgenda,
  onPick,
}: {
  agendas: Agenda[];
  openAgenda: Agenda;
  onPick: (agenda: Agenda, minutes: number) => void;
}) {
  const [minutes, setMinutes] = useState(20);

  return (
    <section className="rounded-card border border-rule bg-card p-5 sm:p-6">
      <h2 className="text-[17px] font-bold leading-snug text-ink-900">
        What do you want to talk about?
      </h2>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {LENGTHS.map((value) => (
          <button
            key={value}
            onClick={() => setMinutes(value)}
            aria-pressed={minutes === value}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              minutes === value
                ? "bg-ink-800 text-cream"
                : "border border-rule bg-cream text-ink-500 hover:border-ink-300"
            }`}
          >
            <span className="n">{value}</span> min
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {agendas.map((agenda) => (
          <button
            key={agenda.id}
            onClick={() => onPick(agenda, minutes)}
            className="rounded-card border border-rule bg-cream p-4 text-left transition hover:border-stem hover:shadow-sh-2"
          >
            <p className="text-[15px] font-bold leading-snug text-ink-900">{agenda.title}</p>
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-400">
              {agenda.reason}
            </p>
            <p className="mt-3 flex items-center gap-2">
              <span className="chip c-neutral">
                <span className="n">{agenda.minutes}</span> min
              </span>
              <span className="text-[11px] font-semibold text-ink-300">{agenda.technique}</span>
            </p>
          </button>
        ))}
      </div>

      <button
        onClick={() => onPick(openAgenda, minutes)}
        className="mt-3 w-full rounded-card border border-dashed border-rule bg-transparent p-4 text-left transition hover:border-stem"
      >
        <p className="text-[15px] font-bold text-ink-900">{openAgenda.title}</p>
        <p className="mt-1 text-[13px] text-ink-400">{openAgenda.reason}</p>
      </button>
    </section>
  );
}
