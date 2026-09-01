"use client";

import Link from "next/link";
import { useState } from "react";
import { RenSession } from "@/components/RenSession";
import { SessionClose } from "@/components/SessionClose";
import type { Agenda } from "@/lib/agendas";

/**
 * Ren's screen is the call and nothing else. Topics are chosen on Home and
 * arrive here already loaded; once a call ends, the close card takes over.
 */
export function SessionDeck({
  userName,
  initialAgenda = null,
  commitment = null,
  nextAgenda = null,
}: {
  userName: string;
  initialAgenda?: Agenda | null;
  commitment?: { wish: string; trigger: string } | null;
  nextAgenda?: { id: string; title: string } | null;
}) {
  const [ended, setEnded] = useState(false);
  const [saidByYou, setSaidByYou] = useState<string[]>([]);

  return (
    <div className="space-y-4">
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

      {ended ? null : (
        <p className="px-1 text-center text-[13px] text-ink-400">
          Want to start from something specific?{" "}
          <Link href="/dashboard" className="font-bold text-stem-700 underline">
            Pick a topic on Home
          </Link>
        </p>
      )}
    </div>
  );
}
