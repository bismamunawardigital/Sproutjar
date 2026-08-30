const STEM_LENGTH = 276;
const SOIL_LINE = 308;
const LID_LINE = 32;
const ROOT_LENGTH = 128;

/**
 * The stem grows on money. The roots grow on the work.
 * The plant never wilts, shrinks or loses a leaf.
 */
export type PlantState = {
  stemPct: number;
  leafPairs: number;
  rootDepth: number;
  sparks: boolean;
  cleared: boolean;
};

const LEAF_SLOTS = [
  { y: 280, tilt: -10, scale: 0.68 },
  { y: 226, tilt: -14, scale: 0.82 },
  { y: 172, tilt: -18, scale: 0.92 },
  { y: 118, tilt: -24, scale: 0.88 },
  { y: 62, tilt: -36, scale: 0.72 },
];

const ROOT_PATHS = [
  "M220 310 L220 404",
  "M220 310 C 204 332 193 356 188 400",
  "M220 310 C 236 332 247 356 252 400",
  "M220 310 C 190 330 172 360 168 396",
  "M220 310 C 250 330 268 360 272 396",
];

function leafPosition(index: number, pairs: number) {
  // Leaves sit under the current stem height so a pair never floats above the plant.
  const slot = LEAF_SLOTS[Math.min(index, LEAF_SLOTS.length - 1)];
  return { ...slot, visible: index < pairs };
}

export function Plant({ state, className }: { state: PlantState; className?: string }) {
  const pct = Math.max(0, Math.min(1, state.stemPct));
  const stemTop = SOIL_LINE - (SOIL_LINE - LID_LINE) * pct;
  const dashoffset = STEM_LENGTH * (1 - pct);
  const rootCount = Math.max(1, Math.min(ROOT_PATHS.length, state.rootDepth));

  return (
    <svg
      viewBox="0 0 440 500"
      className={className}
      role="img"
      aria-label={`A sprout in a jar. Stem at ${Math.round(pct * 100)} percent, ${state.leafPairs} leaf ${
        state.leafPairs === 1 ? "pair" : "pairs"
      }, ${rootCount} roots.`}
    >
      <g transform="translate(0,-8)">
        <rect x="86" y="132" width="268" height="300" rx="34" fill="#FDFCF8" stroke="#C8DACB" strokeWidth="3" />
        <path d="M89 308 H351 V398 C351 416 337 430 319 430 H121 C103 430 89 416 89 398 Z" fill="#B98F63" />

        {ROOT_PATHS.slice(0, rootCount).map((d, index) => (
          <path
            key={d}
            className="plant-root"
            d={d}
            fill="none"
            stroke="#7A6248"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={ROOT_LENGTH}
            strokeDashoffset={0}
            style={{ transitionDelay: `${index * 80}ms` }}
          />
        ))}

        <rect
          x="78"
          y="98"
          width="284"
          height="34"
          rx="17"
          fill="#C8DACB"
          className={state.cleared ? "lid-tip" : undefined}
        />

        <path
          className="plant-stem"
          d={`M220 ${SOIL_LINE} L220 ${LID_LINE}`}
          fill="none"
          stroke="#5FA877"
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={STEM_LENGTH}
          strokeDashoffset={dashoffset}
        />

        {LEAF_SLOTS.map((_, index) => {
          const leaf = leafPosition(index, state.leafPairs);
          if (!leaf.visible || leaf.y < stemTop) return null;
          return (
            <g key={index}>
              <g className="leaf leaf-r" style={{ animationDelay: `${index * 160}ms` }}>
                <g transform={`translate(226,${leaf.y}) rotate(${leaf.tilt}) scale(${leaf.scale})`}>
                  <path d="M0 0 C 0 -24 20 -42 46 -44 C 48 -18 24 2 0 0 Z" fill="#6FBF88" />
                </g>
              </g>
              <g className="leaf leaf-l" style={{ animationDelay: `${index * 160 + 80}ms` }}>
                <g transform={`translate(214,${leaf.y + 10}) scale(-1,1) rotate(${leaf.tilt + 4}) scale(${leaf.scale})`}>
                  <path d="M0 0 C 0 -24 20 -42 46 -44 C 48 -18 24 2 0 0 Z" fill="#92D3A3" />
                </g>
              </g>
            </g>
          );
        })}

        {state.sparks ? (
          <>
            <circle className="spark" style={{ animationDelay: "0ms" }} cx="146" cy="78" r="6" fill="#E8A94B" />
            <circle className="spark" style={{ animationDelay: "100ms" }} cx="306" cy="54" r="7" fill="#E8A94B" />
            <circle className="spark" style={{ animationDelay: "200ms" }} cx="266" cy="20" r="5" fill="#E8A94B" />
          </>
        ) : null}
      </g>
    </svg>
  );
}
