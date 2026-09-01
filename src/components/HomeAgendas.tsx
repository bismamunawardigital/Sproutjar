import Link from "next/link";
import type { Agenda } from "@/lib/agendas";

/**
 * Home is the doorway, not the room. It shows the one line Ren would open with
 * today and a way in — the call itself, the orb and the transcript live on
 * Ren's own screen.
 */
export function HomeAgendas({
  agendas,
  hasHistory,
}: {
  agendas: Agenda[];
  hasHistory: boolean;
}) {
  const opener = agendas[0] ?? null;
  const rest = agendas.slice(1, 4);

  return (
    <section className="overflow-hidden rounded-card bg-ink-800 text-cream">
      <div className="flex items-start gap-4 px-5 pt-5">
        <span className="relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center">
          <span className="orb-halo absolute inset-0 rounded-full" aria-hidden />
          <span className="ren-orb orb-listening absolute inset-1 rounded-full" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-leaf-300">
            Ren would open here today
          </p>
          <p className="mt-1.5 text-[17px] font-bold leading-snug">
            {opener
              ? `“${opener.title}”`
              : hasHistory
                ? "“Where things stand this week.”"
                : "“Start anywhere. I have your numbers.”"}
          </p>
          {opener ? (
            <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-cream/60">
              {opener.reason}
            </p>
          ) : null}
        </div>
      </div>

      <div className="px-5 pb-4 pt-4">
        <Link
          href={opener ? `/dashboard/ren?agenda=${opener.id}` : "/dashboard/ren"}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-leaf-300 px-5 py-3.5 text-[16px] font-bold text-ink-900 transition hover:bg-leaf-400"
        >
          <MicGlyph />
          Call Ren
          {opener ? (
            <span className="n text-[13px] font-bold text-ink-900/60">
              {opener.minutes} min
            </span>
          ) : null}
        </Link>
      </div>

      {rest.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto border-t border-white/10 px-5 py-3">
          <span className="shrink-0 self-center text-[12px] text-cream/40">or</span>
          {rest.map((agenda) => (
            <Link
              key={agenda.id}
              href={`/dashboard/ren?agenda=${agenda.id}`}
              className="shrink-0 rounded-full border border-white/20 px-3.5 py-1.5 text-[12px] font-bold text-cream/80 transition hover:border-white/50"
            >
              {agenda.title}
            </Link>
          ))}
        </div>
      ) : null}
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
