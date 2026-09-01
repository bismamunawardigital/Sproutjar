"use client";

import { useEffect, useRef, useState } from "react";

export type LinePoint = { at: string; total: number };

const W = 640;
const H = 200;
const PAD_T = 30;
const PAD_B = 26;
const PAD_X = 8;

/**
 * The proof shot at the top of the page: the balance line falling, drawn once,
 * with a dot for every conversation. The talks are on the line on purpose —
 * the argument of the product is that the money moved because someone talked.
 */
export function DebtLine({
  history,
  talkDates,
  currency = "AED",
}: {
  history: LinePoint[];
  talkDates: string[];
  currency?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const points = history.map((point) => ({ at: new Date(point.at), total: point.total }));
  const first = points[0];
  const last = points[points.length - 1];
  const highest = Math.max(...points.map((p) => p.total));
  const lowest = Math.min(...points.map((p) => p.total));
  const startMs = first.at.getTime();
  const endMs = last.at.getTime();

  const x = (at: Date) =>
    PAD_X + ((at.getTime() - startMs) / (endMs - startMs)) * (W - PAD_X * 2);
  const y = (total: number) =>
    H - PAD_B - ((total - lowest) / Math.max(1, highest - lowest)) * (H - PAD_T - PAD_B);

  const line = points.map((p) => `${x(p.at).toFixed(1)},${y(p.total).toFixed(1)}`).join(" ");
  const area = `${line} ${W - PAD_X},${H} ${PAD_X},${H}`;

  const marks = talkDates.map((iso) => {
    const at = new Date(iso);
    const nearest = points.reduce((best, p) =>
      Math.abs(p.at.getTime() - at.getTime()) < Math.abs(best.at.getTime() - at.getTime()) ? p : best,
    );
    return { iso, cx: x(at), cy: y(nearest.total) };
  });

  const money = (value: number) =>
    `${currency} ${Math.round(value).toLocaleString("en-AE")}`;

  return (
    <figure className="rounded-card border border-rule bg-card p-5 shadow-sh-2">
      <figcaption className="flex items-baseline justify-between gap-4">
        <p className="text-[15px] font-bold text-ink-900">What eleven weeks of talking looks like</p>
        <p className="text-[12px] text-ink-300">Seeded demo profile</p>
      </figcaption>

      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 h-[200px] w-full"
        role="img"
        aria-label={`Total owed falling from ${money(first.total)} to ${money(last.total)} over eleven weeks, with ${talkDates.length} conversations marked on the line.`}
      >
        <polygon
          points={area}
          fill="var(--color-leaf-100)"
          style={{ opacity: drawn ? 0.75 : 0, transition: "opacity 900ms var(--ease-settle) 500ms" }}
        />
        <polyline
          points={line}
          fill="none"
          stroke="var(--color-stem-600)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={drawn ? 0 : 100}
          style={{ transition: "stroke-dashoffset 1600ms var(--ease-out)" }}
        />
        {marks.map((mark, index) => (
          <circle
            key={mark.iso}
            cx={mark.cx}
            cy={mark.cy}
            r="5"
            fill="var(--color-card)"
            stroke="var(--color-stem-700)"
            strokeWidth="2.5"
            style={{
              opacity: drawn ? 1 : 0,
              transform: drawn ? "none" : "scale(0.2)",
              transformBox: "fill-box",
              transformOrigin: "center",
              transition: `opacity 320ms var(--ease-out) ${700 + index * 130}ms, transform 480ms var(--ease-spring) ${700 + index * 130}ms`,
            }}
          />
        ))}
        <text x={PAD_X} y={y(first.total) - 12} className="n" fontSize="13" fill="var(--color-ink-400)">
          {money(first.total)}
        </text>
        <text
          x={W - PAD_X}
          y={y(last.total) - 14}
          textAnchor="end"
          className="n"
          fontSize="15"
          fontWeight="800"
          fill="var(--color-stem-700)"
        >
          {money(last.total)}
        </text>
      </svg>

      <p className="mt-1 text-[13px] text-ink-400">
        Each ring is one conversation with Ren.{" "}
        <span className="n">{money(first.total - last.total)}</span> cleared across{" "}
        {talkDates.length} of them.
      </p>
    </figure>
  );
}
