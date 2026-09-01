"use client";

import { useState, type ReactNode } from "react";

const SEGMENTS = [
  { key: "clearing", label: "Clearing" },
  { key: "building", label: "Building" },
] as const;

type Segment = (typeof SEGMENTS)[number]["key"];

export function GrowthTabs({ clearing, building }: { clearing: ReactNode; building: ReactNode }) {
  const [segment, setSegment] = useState<Segment>("clearing");

  return (
    <div className="space-y-4">
      <div className="flex rounded-full border border-rule bg-card p-1">
        {SEGMENTS.map((item) => (
          <button
            key={item.key}
            onClick={() => setSegment(item.key)}
            aria-pressed={segment === item.key}
            className={`flex-1 rounded-full py-2 text-[14px] font-bold transition ${
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
