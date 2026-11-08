"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { savePlanChange } from "@/lib/plan";

const SEGMENTS = [
  { key: "clearing", label: "Clearing" },
  { key: "building", label: "Building" },
] as const;

type Segment = (typeof SEGMENTS)[number]["key"];

export function GrowthTabs({ clearing, building, moment, acknowledgedAt, readOnly = false, initialSegment = "clearing" }: { clearing: ReactNode; building: ReactNode; moment?: ReactNode; acknowledgedAt?: number; readOnly?: boolean; initialSegment?: Segment }) {
  const router = useRouter();
  const [segment, setSegment] = useState<Segment>(initialSegment);
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function acknowledge(destination: "building" | "ren") {
    if (busy) return;
    setBusy(true); setError(null);
    try {
      if (!readOnly) await savePlanChange("/api/profile", "PATCH", { acknowledgeDebtFree: true });
      setAcknowledged(true); setSegment("building");
      if (!readOnly) router.refresh();
      if (destination === "ren") router.push("/dashboard/ren");
    } catch { setError("That didn't save. Try again."); }
    finally { setBusy(false); }
  }

  if (moment && !acknowledgedAt && !acknowledged) return <section className="rounded-card bg-ink-900 p-6 text-center text-cream">{moment}{error ? <p role="alert" className="mt-3 text-[14px] text-cream">{error}</p> : null}<button disabled={busy} className="mt-5 min-h-12 w-full rounded-full bg-leaf-300 px-4 text-[16px] font-bold text-ink-900 disabled:opacity-50" onClick={() => void acknowledge("building")}>{busy ? "Saving" : "See where it goes"}</button><button disabled={busy} className="mt-2 inline-flex min-h-11 items-center text-[14px] font-bold text-leaf-300 disabled:opacity-50" onClick={() => void acknowledge("ren")}>Tell Ren · AI voice coach</button></section>;

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
