"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

const SEGMENTS = [
  { key: "clearing", label: "Clearing" },
  { key: "building", label: "Building" },
] as const;

type Segment = (typeof SEGMENTS)[number]["key"];

export function GrowthTabs({ clearing, building, moment, initialSegment = "clearing" }: { clearing: ReactNode; building: ReactNode; moment?: ReactNode; initialSegment?: Segment }) {
  const [segment, setSegment] = useState<Segment>(initialSegment);
  const [acknowledged, setAcknowledged] = useState(false);

  if (moment && !acknowledged) return <section className="rounded-card bg-ink-900 p-6 text-center text-cream">{moment}<button className="mt-5 min-h-12 w-full rounded-full bg-leaf-300 px-4 text-[16px] font-bold text-ink-900" onClick={() => { setSegment("building"); setAcknowledged(true); }}>See where it goes</button><Link className="mt-2 inline-flex min-h-11 items-center text-[14px] font-bold text-leaf-300" href="/dashboard/ren">Tell Ren · AI voice coach</Link></section>;

  return (
    <div className="space-y-4">
      <div className="flex rounded-full border border-rule bg-card p-1" role="group" aria-label="Plan view">
        {SEGMENTS.map((item) => (
          <button
            key={item.key}
            onClick={() => setSegment(item.key)}
            aria-pressed={segment === item.key}
            className={`min-h-11 flex-1 rounded-full py-2 text-[14px] font-bold transition ${
              segment === item.key ? "bg-ink-800 text-cream" : "text-ink-400 hover:text-ink-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {segment === "clearing" ? clearing : building}
    </div>
  );
}
