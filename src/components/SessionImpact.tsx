import { formatMoneyShort as formatMoney } from "@/lib/money";
import type { HistoryPoint } from "@/lib/user";

type Talk = { id: string; agenda: string; mode: string; startedAt: Date; summary: string; wish: string | null; status: string | null };

function statusChip(status: string | null): { label: string; tone: string } {
  switch (status) {
    case "kept": return { label: "Done", tone: "c-grow" };
    case "partial": return { label: "Partly", tone: "c-amber" };
    case "missed": return { label: "Another time", tone: "c-neutral" };
    case "open": return { label: "Open", tone: "c-neutral" };
    default: return { label: "Nothing to carry", tone: "c-neutral" };
  }
}

export function SessionImpact({ history, talks, currency }: { history: HistoryPoint[]; talks: Talk[]; currency: string }) {
  return (
    <div className="space-y-5">
      {talks.length > 0 ? <HistoryChart history={history} talks={talks} currency={currency} /> : null}
      <section className="rounded-card border border-rule bg-card p-5">
        <h2 className="label">Your talks</h2>
        {talks.length === 0 ? <p className="mt-3 text-[14px] leading-relaxed text-ink-500">Your talks with Ren will show up here, with what you chose to do after each one.</p> : <><p className="mt-2 text-[13px] text-ink-400">Each talk adds a root. They only go down.</p><div className="mt-3 divide-y divide-rule">{talks.map((talk) => <details key={talk.id} className="py-2"><summary className="min-h-11 cursor-pointer py-2 text-[14px] text-ink-900"><span className="font-bold">{talk.agenda}</span><span className="mt-2 flex flex-wrap items-center gap-2"><span className={`chip ${statusChip(talk.status).tone}`}>{statusChip(talk.status).label}</span>{talk.mode === "text" ? <span className="chip c-neutral">Typed</span> : null}<span className="ml-auto text-[12px] text-ink-400">{talk.startedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span></span></summary><div className="pb-3 pt-2 text-[14px] leading-relaxed text-ink-500"><p className="label">Saved summary</p><p className="mt-2 whitespace-pre-line">{talk.summary || "No summary was saved for this talk."}</p><p className="mt-3 font-bold text-ink-700">{talk.wish ?? "Nothing to do after this one."}</p></div></details>)}</div></>}
      </section>
    </div>
  );
}

function HistoryChart({ history, talks, currency }: { history: HistoryPoint[]; talks: Talk[]; currency: string }) {
  if (history.length < 2) return null;
  const first = history[0], last = history[history.length - 1];
  const highest = Math.max(...history.map((point) => point.total));
  const lowest = Math.min(...history.map((point) => point.total));
  const span = Math.max(1, highest - lowest), W = 320, H = 84;
  const startMs = first.at.getTime(), endMs = Math.max(last.at.getTime(), startMs + 1);
  const x = (at: Date) => Math.max(4, Math.min(W - 4, (at.getTime() - startMs) / (endMs - startMs) * W));
  const y = (total: number) => H - 8 - (total - lowest) / span * (H - 20);
  const line = history.map((point) => `${x(point.at)},${y(point.total)}`).join(" ");
  const marks = talks.filter((talk) => talk.startedAt.getTime() >= startMs && talk.startedAt.getTime() <= endMs).map((talk) => {
    const nearest = history.reduce((best, point) => Math.abs(point.at.getTime() - talk.startedAt.getTime()) < Math.abs(best.at.getTime() - talk.startedAt.getTime()) ? point : best);
    return { id: talk.id, cx: x(talk.startedAt), cy: y(nearest.total) };
  });
  return <section className="rounded-card border border-rule bg-card p-5"><p className="label">Cleared while coaching with Ren</p><p className="n mt-2 text-[30px] font-bold text-stem-700">{formatMoney(Math.max(0, first.total - last.total), currency)}</p><p className="mt-1 text-[13px] text-ink-400">across {talks.length} conversation{talks.length === 1 ? "" : "s"}.</p><svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-24 w-full" role="img" aria-label={`Recorded balance from ${formatMoney(first.total, currency)} to ${formatMoney(last.total, currency)}. Each dot marks a talk.`}><polyline points={line} fill="none" stroke="var(--color-stem-600)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />{marks.map((mark) => <circle key={mark.id} cx={mark.cx} cy={mark.cy} r="3.5" fill="var(--color-stem-600)" />)}</svg><div className="flex justify-between text-[12px] text-ink-400"><span>{formatMoney(first.total, currency)}</span><span>{formatMoney(last.total, currency)}</span></div></section>;
}
