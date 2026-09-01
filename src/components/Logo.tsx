/**
 * The mark from the brand guide: a sprout cut from a solid field. `dark` is the
 * version that sits on ink backgrounds.
 */
export function Logo({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const field = tone === "dark" ? "#5FA877" : "#22302A";
  const lowerLeaf = tone === "dark" ? "#22302A" : "#5FA877";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 100 100" aria-hidden="true">
        <rect x="4" y="4" width="92" height="92" rx="26" fill={field} />
        <path d="M50 82 L50 26" stroke="#F2EDE4" strokeWidth="10" strokeLinecap="round" />
        <path d="M53 50 C 53 39 62 31 76 30 C 77 43 65 51 53 50 Z" fill="#F2EDE4" />
        <path d="M47 62 C 47 51 38 43 24 42 C 23 55 35 63 47 62 Z" fill={lowerLeaf} />
      </svg>
      <span
        className={`font-logo text-[19px] font-bold tracking-[-0.03em] ${
          tone === "dark" ? "text-cream" : "text-ink-900"
        }`}
      >
        sproutjar
      </span>
    </span>
  );
}
