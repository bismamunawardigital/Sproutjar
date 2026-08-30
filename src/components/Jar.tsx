/**
 * A jar that fills. The fill level is the only thing that moves, so a deposit
 * reads as the liquid rising rather than a bar sliding across.
 */
export function Jar({
  pct,
  stage,
  className = "",
}: {
  pct: number;
  stage: "seed" | "sprout" | "sapling" | "grown";
  className?: string;
}) {
  const filled = Math.max(0, Math.min(100, pct));
  const bodyTop = 26;
  const bodyBottom = 92;
  const height = ((bodyBottom - bodyTop) * filled) / 100;
  const fillTop = bodyBottom - height;
  const leaves = stage === "grown" ? 3 : stage === "sapling" ? 2 : stage === "sprout" ? 1 : 0;

  return (
    <svg viewBox="0 0 64 100" className={className} aria-hidden>
      <defs>
        <clipPath id={`jar-body-${filled}-${stage}`}>
          <path d="M10 26 h44 v54 a12 12 0 0 1 -12 12 h-20 a12 12 0 0 1 -12 -12 z" />
        </clipPath>
      </defs>

      <rect x="8" y="14" width="48" height="10" rx="5" fill="#DED6C8" />

      <g clipPath={`url(#jar-body-${filled}-${stage})`}>
        <rect x="10" y="26" width="44" height="66" fill="#FDFCF8" />
        <rect
          x="10"
          y={fillTop}
          width="44"
          height={height + 2}
          fill="#92D3A3"
          className="transition-all duration-700 ease-out"
        />
        {filled > 0 ? (
          <ellipse
            cx="32"
            cy={fillTop}
            rx="22"
            ry="3"
            fill="#5FA877"
            className="transition-all duration-700 ease-out"
          />
        ) : null}
      </g>

      <path
        d="M10 26 h44 v54 a12 12 0 0 1 -12 12 h-20 a12 12 0 0 1 -12 -12 z"
        fill="none"
        stroke="#DED6C8"
        strokeWidth="3"
      />

      {leaves > 0 ? (
        <g>
          <path d="M32 26 L32 10" stroke="#3D7A55" strokeWidth="3" strokeLinecap="round" />
          <path d="M33 14 C 33 8 39 4 47 4 C 47 12 41 16 33 14 Z" fill="#5FA877" />
          {leaves > 1 ? (
            <path d="M31 20 C 31 14 25 10 17 10 C 17 18 23 22 31 20 Z" fill="#92D3A3" />
          ) : null}
          {leaves > 2 ? <circle cx="32" cy="4" r="3.5" fill="#E8A94B" /> : null}
        </g>
      ) : null}
    </svg>
  );
}
