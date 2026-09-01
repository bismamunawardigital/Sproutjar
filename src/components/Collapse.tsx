import type { ReactNode } from "react";

/** Detail that earns its space only when asked for. */
export function Collapse({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-card border border-rule bg-card">
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-[15px] font-bold text-ink-900">{title}</span>
          {hint ? <span className="block text-[13px] text-ink-400">{hint}</span> : null}
        </span>
        <span className="text-[13px] font-bold text-ink-300 group-open:hidden">Show</span>
        <span className="hidden text-[13px] font-bold text-ink-300 group-open:inline">Hide</span>
      </summary>
      <div className="border-t border-rule p-5 pt-4">{children}</div>
    </details>
  );
}
