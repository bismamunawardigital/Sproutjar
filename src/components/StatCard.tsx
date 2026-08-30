export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "good" | "warn";
}) {
  const valueTone =
    tone === "good" ? "text-moss" : tone === "warn" ? "text-clay" : "text-bark";
  return (
    <div className="rounded-2xl border border-sand bg-cream p-6">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className={`mt-3 font-display text-3xl font-semibold ${valueTone}`}>{value}</p>
      {hint ? <p className="mt-2 text-sm leading-relaxed text-ink-soft">{hint}</p> : null}
    </div>
  );
}
