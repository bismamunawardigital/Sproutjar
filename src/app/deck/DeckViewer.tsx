"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const SLIDE_W = 1280;

/**
 * Lays out 1280x720 slides one under another, scaled to the container width so the deck
 * reads on a laptop or a phone without changing a slide's layout. Print keeps them at 1:1.
 */
export function DeckViewer({ slides }: { slides: ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / SLIDE_W));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="deck" style={{ "--deck-scale": scale } as CSSProperties}>
      {slides.map((slide, i) => (
        <div key={i} id={`slide-${i + 1}`} className="deck-frame mb-6 sm:mb-8">
          <div className="deck-stage">{slide}</div>
        </div>
      ))}
    </div>
  );
}
