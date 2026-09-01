"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Content settles in once, on first sight, and then stays put. Nothing on this
 * page re-animates when you scroll back up it.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? "none" : "translateY(14px)",
        filter: seen ? "none" : "blur(4px)",
        transition: `opacity 720ms var(--ease-settle) ${delay}ms, transform 720ms var(--ease-out) ${delay}ms, filter 720ms var(--ease-out) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
