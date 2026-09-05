"use client";

import Link from "next/link";
import { useCallback, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { formatMoneyShort } from "@/lib/money";

type Answer = "yes" | "less" | null;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function remember(key: string, answer: "yes" | "less") {
  window.localStorage.setItem(key, answer);
  listeners.forEach((listener) => listener());
}

/** The month's answer lives in the browser only; it is an acknowledgement, not a record. */
function useAnswer(key: string): Answer {
  const read = useCallback((): Answer => {
    const saved = window.localStorage.getItem(key);
    return saved === "yes" || saved === "less" ? saved : null;
  }, [key]);
  return useSyncExternalStore(subscribe, read, () => null);
}

/**
 * Payday is when the money decision actually happens, so this is the one
 * moment the product speaks first. It asks, it doesn't instruct: the amount was
 * the person's decision and stays theirs to change. Purely on-screen, no push.
 */
export function PaydayInvitation({
  amount,
  source,
  derived,
  currency,
  paydayDay,
  daysUntil,
}: {
  amount: number;
  source: "derived" | "chosen";
  derived: number;
  currency: string;
  paydayDay: number;
  daysUntil: number | null;
}) {
  const router = useRouter();
  const monthKey = `sproutjar:payday:${new Date().getFullYear()}-${new Date().getMonth()}`;
  const answered = useAnswer(monthKey);
  const [mode, setMode] = useState<"ask" | "less">("ask");
  const [less, setLess] = useState("");
  const [busy, setBusy] = useState(false);

  function sayYes() {
    remember(monthKey, "yes");
  }

  async function sayLess(event: React.FormEvent) {
    event.preventDefault();
    const value = Number(less);
    if (!Number.isFinite(value) || value < 0) return;
    setBusy(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ debtAttack: value, debtAttackSource: "chosen" }),
    });
    remember(monthKey, "less");
    setBusy(false);
    router.refresh();
  }

  if (answered === "yes") {
    return (
      <section className="rounded-card border border-rule bg-card p-5">
        <p className="label">Payday</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-700">
          Noted. <span className="n">{formatMoneyShort(amount, currency)}</span> to the cards this
          month, as you decided.
        </p>
      </section>
    );
  }

  if (answered === "less") {
    return (
      <section className="rounded-card border border-rule bg-card p-5">
        <p className="label">Payday</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-700">
          Changed to <span className="n">{formatMoneyShort(amount, currency)}</span> for now. The
          date on Plan has moved to match. Nothing else needs doing.
        </p>
      </section>
    );
  }

  const timing =
    daysUntil === 0
      ? "It's payday."
      : daysUntil !== null && daysUntil > 0
        ? `Payday is in ${daysUntil} ${daysUntil === 1 ? "day" : "days"}.`
        : `Payday was on the ${paydayDay}.`;

  return (
    <section className="rounded-card border border-stem/30 bg-card p-5">
      <p className="label">Payday</p>
      <p className="mt-1.5 text-[17px] font-bold leading-snug text-ink-900">
        You decided <span className="n">{formatMoneyShort(amount, currency)}</span> goes to the
        cards on payday. Still right this month?
      </p>
      <p className="mt-1 text-[13px] text-ink-400">
        {timing}{" "}
        {source === "chosen" && derived !== amount
          ? `Your figure; the sums say ${formatMoneyShort(derived, currency)}.`
          : "Worked out from what you told Ren."}
      </p>

      {mode === "ask" ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={sayYes}
            className="rounded-full bg-ink-800 px-4 py-2 text-[13px] font-bold text-cream transition hover:bg-ink-700"
          >
            Yes, still right
          </button>
          <button
            onClick={() => setMode("less")}
            className="rounded-full border border-rule px-4 py-2 text-[13px] font-bold text-ink-700 transition hover:border-ink-300"
          >
            Less this month
          </button>
          <Link
            href="/dashboard/ren?agenda=payday"
            className="rounded-full border border-rule px-4 py-2 text-[13px] font-bold text-ink-700 transition hover:border-ink-300"
          >
            Talk it through with Ren
          </Link>
        </div>
      ) : (
        <form onSubmit={sayLess} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-[12px] font-bold text-ink-500">
            This month ({currency})
            <input
              autoFocus
              required
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={less}
              onChange={(e) => setLess(e.target.value)}
              className="mt-1 block w-40 rounded-sm border border-rule bg-card px-3 py-2 text-[15px] text-ink-800 outline-none focus:border-stem"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-ink-800 px-4 py-2.5 text-[13px] font-bold text-cream transition hover:bg-ink-700 disabled:opacity-60"
          >
            {busy ? "Saving" : "Use this"}
          </button>
          <button
            type="button"
            onClick={() => setMode("ask")}
            className="text-[13px] font-bold text-ink-300 transition hover:text-ink-500"
          >
            Back
          </button>
          <p className="basis-full text-[12px] leading-relaxed text-ink-400">
            The date moves a little, that&rsquo;s all. Some months are like that.
          </p>
        </form>
      )}
    </section>
  );
}
