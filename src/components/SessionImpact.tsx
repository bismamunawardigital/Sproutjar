import { formatMoneyShort } from "@/lib/money";
import type { HistoryPoint } from "@/lib/user";

type Talk = {
  id: string;
  agenda: string;
  startedAt: Date;
  wish: string | null;
  status: string | null;
};

const W = 320;
const H = 84;

/**
 * The line is the argument: talking moved money. Session marks sit on it so the
 * drop reads as something the person did, not something that happened to them.
 */
export function SessionImpact({
  history,
  talks,
  currency,
}: {
  history: HistoryPoint[];
  talks: Talk[];
  currency: string;
}) {
  if (history.length < 2 || talks.length === 0) return null;

  const first = history[0];
  const last = history[history.length - 1];
  const moved = first.total - last.total;
  const highest = Math.max(...history.map((point) => point.total));
  const lowest = Math.min(...history.map((point) => point.total));
  const span = Math.max(1, highest - lowest);
  const startMs = first.at.getTime();
  const endMs = Math.max(last.at.getTime(), startMs + 1);

  const x = (at: Date) => ((at.getTime() - startMs) / (endMs - startMs)) * W;
  const y = (total: number) => H - 8 - ((total - lowest) / span) * (H - 20);

  const line = history.map((point) => `${x(point.at)},${y(point.total)}`).join(" ");
  const area = `${line} ${W},${H} 0,${H}`;

  const marks = talks
    .filter((talk) => talk.startedAt.getTime() >= startMs && talk.startedAt.getTime() <= endMs)
    .map((talk) => {
      const nearest = history.reduce((best, point) =>
        Math.abs(point.at.getTime() - talk.startedAt.getTime()) <
        Math.abs(best.at.getTime() - talk.startedAt.getTime())
          ? point
          : best,
      );
      return { id: talk.id, cx: x(talk.startedAt), cy: y(nearest.total) };
    });

  return (
    <section className="overflow-hidden rounded-card border border-rule bg-card">
      <div className="px-5 pt-5">
        <p className="label">Cleared while coaching with Ren</p>
        <p className="mt-2 text-[26px] font-bold leading-none text-stem-700">
          <span className="n">{formatMoneyShort(moved, currency)}</span>
        </p>
        <p className="mt-1.5 text-[13px] text-ink-400">
          cleared while coaching with Ren, across{" "}
          <span className="n">{talks.length}</span> conversations.
        </p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 h-24 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Total owed falling from ${Math.round(first.total)} to ${Math.round(last.total)} ${currency}.`}
      >
        <polygon points={area} fill="var(--color-leaf-100)" opacity="0.7" />
        <polyline
          points={line}
          fill="none"
          stroke="var(--color-stem-600)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {marks.map((mark) => (
          <circle key={mark.id} cx={mark.cx} cy={mark.cy} r="3.5" fill="var(--color-stem-600)" />
        ))}
      </svg>

      <div className="flex items-baseline justify-between px-5 text-[12px] text-ink-300">
        <span className="n">{formatMoneyShort(first.total, currency)}</span>
        <span>each dot marks a talk</span>
        <span className="n">{formatMoneyShort(last.total, currency)}</span>
      </div>

      <ul className="mt-4 divide-y divide-rule border-t border-rule">
        {talks.slice(0, 6).map((talk) => (
          <li key={talk.id} className="flex items-start gap-3 px-5 py-3.5">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-stem" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold leading-snug text-ink-900">{talk.agenda}</p>
              {talk.wish ? (
                <p className="mt-0.5 text-[13px] text-ink-400">
                  {talk.wish}
                  {talk.status === "kept" ? <span className="chip c-grow ml-2">Done</span> : null}
                </p>
              ) : (
                <p className="mt-0.5 text-[13px] text-ink-300">
                  Thinking out loud. Nothing to do after it.
                </p>
              )}
            </div>
            <span className="shrink-0 text-[12px] text-ink-300">
              {talk.startedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
