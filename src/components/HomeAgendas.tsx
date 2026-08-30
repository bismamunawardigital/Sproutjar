import Link from "next/link";
import type { Agenda } from "@/lib/agendas";

/**
 * The invitation to talk lives on Home, so opening the app asks a question
 * rather than showing a menu. Picking one carries it into Ren's screen.
 */
export function HomeAgendas({ agendas, hasHistory }: { agendas: Agenda[]; hasHistory: boolean }) {
  return (
    <section className="rounded-card bg-ink-800 p-5 text-cream">
      <div className="flex items-start gap-4">
        <span className="ren-orb orb-listening h-11 w-11 shrink-0 rounded-full" aria-hidden />
        <div>
          <h2 className="text-[18px] font-bold leading-snug">What do you want to talk about?</h2>
          <p className="mt-1 text-[13px] text-cream/60">
            {hasHistory ? "Ren remembers where you left it." : "Pick one, or just start talking."}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {agendas.slice(0, 3).map((agenda) => (
          <Link
            key={agenda.id}
            href={`/dashboard/ren?agenda=${agenda.id}`}
            className="block rounded-card bg-white/8 px-4 py-3 transition hover:bg-white/15"
          >
            <p className="text-[15px] font-bold leading-snug">{agenda.title}</p>
            <p className="mt-0.5 text-[12px] text-cream/60">
              <span className="n">{agenda.minutes}</span> min · {agenda.technique}
            </p>
          </Link>
        ))}
      </div>

      <Link
        href="/dashboard/ren"
        className="mt-3 block rounded-full bg-stem px-4 py-3 text-center text-[15px] font-bold text-white transition hover:opacity-90"
      >
        Something else — just call Ren
      </Link>
    </section>
  );
}
