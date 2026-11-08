import { useId } from "react";

export function RenOrb({ small = false, level = 0 }: { small?: boolean; level?: number }) {
  const scale = 1 + Math.max(0, Math.min(1, Number.isFinite(level) ? level : 0)) * 0.12;
  const id = useId();
  return (
    <div aria-hidden className={`relative mx-auto grid shrink-0 place-items-center ${small ? "h-28 w-28" : "h-56 w-56"}`}>
      <span className="absolute inset-2 rounded-full bg-leaf-300/20 blur-2xl" />
      <svg viewBox="0 0 200 200" className="ren-level orb-listening absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] rounded-full shadow-sh-3 transition-transform duration-100" style={{ transform: `scale(${scale})` }}>
        <defs>
          <radialGradient id={`${id}-light`} cx="70%" cy="25%" r="80%"><stop stopColor="#e0f0cb" /><stop offset=".48" stopColor="#92d3a3" /><stop offset="1" stopColor="#3d7a55" /></radialGradient>
          <radialGradient id={`${id}-shade`}><stop stopColor="#24553d" /><stop offset="1" stopColor="#3d7a55" stopOpacity="0" /></radialGradient>
          <clipPath id={`${id}-clip`}><circle cx="100" cy="100" r="98" /></clipPath>
          <filter id={`${id}-soft`}><feGaussianBlur stdDeviation="7" /></filter>
        </defs>
        <g clipPath={`url(#${id}-clip)`}>
          <circle cx="100" cy="100" r="99" fill={`url(#${id}-light)`} />
          <ellipse cx="67" cy="72" rx="75" ry="84" fill={`url(#${id}-shade)`} transform="rotate(-30 67 72)" />
          <path d="M-25 105 C30 150 65 157 94 115 S135 58 219 9" fill="none" stroke="#c5bb7b" strokeWidth="26" opacity=".8" filter={`url(#${id}-soft)`} />
          <path d="M16 10 C75-18 137 2 186 41" fill="none" stroke="#d8f0cb" strokeWidth="9" opacity=".7" filter={`url(#${id}-soft)`} />
        </g>
      </svg>
    </div>
  );
}
