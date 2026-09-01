"use client";

import { useRef, useState } from "react";

/**
 * The recorded walkthrough. The poster frame stands in until someone asks for
 * it, so the page does not pull thirteen megabytes on load.
 */
export function Walkthrough({
  src,
  poster,
  minutes,
}: {
  src: string;
  poster: string;
  minutes: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-card border border-ink-700 bg-ink-900">
      <video
        ref={video}
        src={started ? src : undefined}
        poster={poster}
        controls={started}
        playsInline
        preload="none"
        className="block h-auto w-full"
      />
      {!started ? (
        <button
          type="button"
          onClick={() => {
            setStarted(true);
            requestAnimationFrame(() => void video.current?.play());
          }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-900/45 transition hover:bg-ink-900/30"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream shadow-sh-3">
            <svg width="20" height="22" viewBox="0 0 20 22" aria-hidden="true">
              <path d="M2 2 L18 11 L2 20 Z" fill="var(--color-ink-900)" />
            </svg>
          </span>
          <span className="rounded-full bg-ink-900/70 px-3.5 py-1.5 text-[13px] font-bold text-cream">
            Watch the walkthrough · {minutes}
          </span>
        </button>
      ) : null}
    </div>
  );
}
