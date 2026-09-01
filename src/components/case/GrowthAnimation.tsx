"use client";

import { useEffect, useRef, useState } from "react";

const LEAVES: { pair: string; y: number; rotate: number; scale: number }[] = [
  { pair: "p1", y: 280, rotate: -10, scale: 0.68 },
  { pair: "p2", y: 226, rotate: -14, scale: 0.82 },
  { pair: "p3", y: 172, rotate: -18, scale: 0.92 },
  { pair: "p4", y: 118, rotate: -24, scale: 0.88 },
  { pair: "p5", y: 62, rotate: -36, scale: 0.72 },
];

const LEAF = "M0 0 C 0 -24 20 -42 46 -44 C 48 -18 24 2 0 0 Z";

/**
 * The original growth animation, the one every value in the product was drawn
 * from. It plays once when it comes into view; the replay button is here
 * because people ask for it.
 */
export function GrowthAnimation({ caption = "outgrown the jar" }: { caption?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setPlaying(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      <div key={run} className={`sj-stage w-full max-w-[420px] ${playing ? "play" : ""}`}>
        <svg
          viewBox="0 0 440 580"
          className="block h-auto w-full"
          role="img"
          aria-label="A sprout grows in spurts inside a glass jar, tips the lid off and springs into place."
        >
          <rect x="0" y="0" width="440" height="580" rx="14" fill="#F2EDE4" />
          <g transform="translate(0,78)">
            <g className="sj-jar">
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
              <path
                d="M89 308 H351 V398 C351 416 337 430 319 430 H121 C103 430 89 416 89 398 Z"
                fill="#B98F63"
              />
            </g>

            <path className="sj-root sj-r1" d="M220 310 L220 404" fill="none" stroke="#7A6248" strokeWidth="6" strokeLinecap="round" />
            <path className="sj-root sj-r2" d="M220 310 C 204 332 193 356 188 400" fill="none" stroke="#7A6248" strokeWidth="6" strokeLinecap="round" />
            <path className="sj-root sj-r3" d="M220 310 C 236 332 247 356 252 400" fill="none" stroke="#7A6248" strokeWidth="6" strokeLinecap="round" />

            <rect className="sj-lid" x="78" y="98" width="284" height="34" rx="17" fill="#CDDCCD" />

            <g className="sj-plant">
              <path className="sj-stem" d="M220 308 L220 32" fill="none" stroke="#5FA877" strokeWidth="12" strokeLinecap="round" />
              {LEAVES.map((leaf) => (
                <g key={leaf.pair}>
                  <g className={`sj-leaf sj-leafR sj-${leaf.pair}a`}>
                    <g transform={`translate(226,${leaf.y}) rotate(${leaf.rotate}) scale(${leaf.scale})`}>
                      <path d={LEAF} fill="#6FBF88" />
                    </g>
                  </g>
                  <g className={`sj-leaf sj-leafL sj-${leaf.pair}b`}>
                    <g transform={`translate(214,${leaf.y + 10}) scale(-1,1) rotate(${leaf.rotate + 4}) scale(${leaf.scale})`}>
                      <path d={LEAF} fill="#92D3A3" />
                    </g>
                  </g>
                </g>
              ))}
            </g>

            <circle className="sj-spark sj-s1" cx="146" cy="78" r="6" fill="#E8A94B" />
            <circle className="sj-spark sj-s2" cx="306" cy="54" r="7" fill="#E8A94B" />
            <circle className="sj-spark sj-s3" cx="266" cy="20" r="5" fill="#E8A94B" />

            <text className="sj-cap" x="220" y="474" textAnchor="middle" fontSize="17" fill="#5C6B62">
              {caption}
            </text>
          </g>
        </svg>
      </div>

      <button
        type="button"
        onClick={() => {
          setPlaying(true);
          setRun((value) => value + 1);
        }}
        className="rounded-full border border-rule px-4 py-1.5 text-[13px] font-bold text-ink-500 transition hover:border-stem hover:text-stem-700"
      >
        Play it again
      </button>
    </div>
  );
}
