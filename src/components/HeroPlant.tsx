const SOIL_LINE = 308;
const LID_LINE = 32;
const STEM_LENGTH = 348;
const ROOT_LENGTH = 128;

const LEAF_SLOTS = [
  { y: 252, tilt: -10, scale: 0.78 },
  { y: 182, tilt: -14, scale: 0.92 },
  { y: 112, tilt: -18, scale: 1.02 },
  { y: 42, tilt: -24, scale: 0.98 },
  { y: -28, tilt: -36, scale: 0.82 },
];

const ROOT_PATHS = [
  "M220 308 L220 402",
  "M220 308 C 204 330 193 354 188 398",
  "M220 308 C 236 330 247 354 252 398",
  "M220 308 C 190 328 172 358 168 394",
  "M220 308 C 250 328 268 358 272 394",
  "M220 308 C 178 324 152 348 144 386",
  "M220 308 C 262 324 288 348 296 386",
];

function leafPosition(index: number, pairs: number) {
  const slot = LEAF_SLOTS[Math.min(index, LEAF_SLOTS.length - 1)];
  return { ...slot, visible: index < pairs };
}

export function HeroPlant({ className }: { className?: string }) {
  const stemTop = -40;
  const rootCount = 5;
  const leafPairs = 4;
  const pct = (SOIL_LINE - stemTop) / STEM_LENGTH;
  const dashoffset = STEM_LENGTH * (1 - pct);

  return (
    <svg
      viewBox="0 -80 440 520"
      className={className}
      role="img"
      aria-label="A plant sprouting out of a jar, because you can grow out of the jar you are in."
      preserveAspectRatio="xMidYMid meet"
    >
      <g>
        {/* Jar */}
        <rect
          x="86"
          y="132"
          width="268"
          height="300"
          rx="34"
          fill="#FDFCF8"
          stroke="#C8DACB"
          strokeWidth="3"
        />

        {/* Soil */}
        <path
          d="M89 308 H351 V398 C351 416 337 430 319 430 H121 C103 430 89 416 89 398 Z"
          fill="#B98F63"
        />

        {/* Roots */}
        {ROOT_PATHS.slice(0, rootCount).map((d, index) => (
          <path
            key={d}
            className="plant-root"
            d={d}
            fill="none"
            stroke="#7A6248"
            strokeWidth={index < 3 ? 6 : 4.5}
            strokeLinecap="round"
            strokeDasharray={ROOT_LENGTH}
            strokeDashoffset={0}
          />
        ))}

        {/* Tipped lid */}
        <g transform="translate(118, -78) rotate(42, 220, 115)">
          <rect x="78" y="98" width="284" height="34" rx="17" fill="#C8DACB" />
        </g>

        {/* Stem growing out of the jar */}
        <path
          className="plant-stem"
          d={`M220 ${SOIL_LINE} L220 ${stemTop}`}
          fill="none"
          stroke="#5FA877"
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={STEM_LENGTH}
          strokeDashoffset={dashoffset}
        />

        {/* Leaves */}
        {LEAF_SLOTS.map((_, index) => {
          const leaf = leafPosition(index, leafPairs);
          if (!leaf.visible) return null;
          return (
            <g key={index}>
              <g className="leaf leaf-r" style={{ animationDelay: `${index * 160}ms` }}>
                <g transform={`translate(226,${leaf.y}) rotate(${leaf.tilt}) scale(${leaf.scale})`}>
                  <path d="M0 0 C 0 -24 20 -42 46 -44 C 48 -18 24 2 0 0 Z" fill="#6FBF88" />
                </g>
              </g>
              <g className="leaf leaf-l" style={{ animationDelay: `${index * 160 + 80}ms` }}>
                <g
                  transform={`translate(214,${leaf.y + 10}) scale(-1,1) rotate(${leaf.tilt + 4}) scale(${leaf.scale})`}
                >
                  <path d="M0 0 C 0 -24 20 -42 46 -44 C 48 -18 24 2 0 0 Z" fill="#92D3A3" />
                </g>
              </g>
            </g>
          );
        })}

        {/* Sparks */}
        <circle className="spark" style={{ animationDelay: "0ms" }} cx="176" cy="10" r="6" fill="#E8A94B" />
        <circle className="spark" style={{ animationDelay: "120ms" }} cx="286" cy="-16" r="7" fill="#E8A94B" />
        <circle className="spark" style={{ animationDelay: "240ms" }} cx="246" cy="-44" r="5" fill="#E8A94B" />
      </g>
    </svg>
  );
}
