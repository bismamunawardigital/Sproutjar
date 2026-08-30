import Link from "next/link";
import type { Agenda } from "@/lib/agendas";

const BARS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

/**
 * The invitation to talk lives on Home, and it looks like what it is: a call
 * waiting to be placed. Picking a line carries that agenda into Ren's screen.
 */
export function HomeAgendas({ agendas, hasHistory }: { agendas: Agenda[]; hasHistory: boolean }) {
  return (
    <section className="overflow-hidden rounded-card bg-ink-800 text-cream">
      <div className="flex flex-col items-center px-5 pb-5 pt-7 text-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <span className="orb-halo absolute inset-0 rounded-full" aria-hidden />
          <span className="orb-halo orb-halo-2 absolute inset-0 rounded-full" aria-hidden />
          <span className="ren-orb orb-listening absolute inset-5 rounded-full" aria-hidden />
          <span className="relative text-[15px] font-bold tracking-wide text-white">Ren</span>
        </div>

        <div className="mt-4 flex h-6 items-end gap-[3px]" aria-hidden>
          {BARS.map((bar) => (
            <span
              key={bar}
              className="wave-bar w-[3px] rounded-full bg-leaf-300"
              style={{ animationDelay: `${bar * 110}ms` }}
            />
          ))}
        </div>

        <p className="mt-3 text-[13px] font-bold uppercase tracking-[0.14em] text-leaf-300">
          Your voice coach · ready
        </p>
        <h2 className="mt-2 text-[21px] font-bold leading-snug">
          What do you want to talk about?
        </h2>
        <p className="mt-1 text-[13px] text-cream/60">
          {hasHistory
            ? "Ren has your numbers and remembers where you left it."
            : "Say it out loud. Ren already has your numbers."}
        </p>

        <Link
          href="/dashboard/ren"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-stem px-5 py-3.5 text-[16px] font-bold text-white transition hover:opacity-90"
        >
          <MicGlyph />
          Call Ren
        </Link>
      </div>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-cream/40">
          Or start from one of these
        </p>
        <div className="mt-2.5 space-y-1.5">
          {agendas.slice(0, 4).map((agenda) => (
            <Link
              key={agenda.id}
              href={`/dashboard/ren?agenda=${agenda.id}`}
              className="flex items-center justify-between gap-3 rounded-card px-3 py-2.5 transition hover:bg-white/10"
            >
              <span className="text-[14px] font-bold leading-snug">{agenda.title}</span>
              <span className="n shrink-0 text-[12px] text-cream/50">{agenda.minutes} min</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function MicGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
      <path
        d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
