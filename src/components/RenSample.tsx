"use client";

import { useRef, useState } from "react";
import { REN_SAMPLE } from "@/lib/ren-sample";
import timings from "@/lib/ren-sample-timings.json";

export function RenSample() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const currentLine = timings.findIndex(
    ({ startTime, duration }) => currentTime >= startTime && currentTime < startTime + duration,
  );

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    try {
      await audio.play();
    } catch {
      setPlaying(false);
    }
  };

  return (
    <section aria-labelledby="ren-sample-heading" className="rounded-card border border-white/10 bg-white/5 p-4 text-left">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="ren-sample-heading" className="text-[16px] font-bold text-cream">
            Hear a real session
          </h2>
          <p className="mt-1 text-[12px] text-cream/60">A short moment with Ren and Layla</p>
        </div>
        <button
          type="button"
          aria-label={playing ? "Pause sample" : "Play sample"}
          onClick={togglePlayback}
          className="min-h-11 shrink-0 rounded-full border border-leaf-300 px-4 py-2 text-[13px] font-bold text-leaf-300 transition hover:bg-leaf-300 hover:text-ink-900"
        >
          {playing ? "Pause" : "Play"}
        </button>
      </div>
      <audio
        ref={audioRef}
        src="/ren/sample.mp3"
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onEnded={(event) => {
          setPlaying(false);
          setCurrentTime(event.currentTarget.currentTime);
        }}
      />
      <ol className="mt-4 space-y-1">
        {REN_SAMPLE.map((line, index) => (
          <li
            key={`${line.speaker}-${index}`}
            aria-current={currentLine === index ? "true" : undefined}
            className={`rounded-md px-3 py-2 text-[13px] leading-relaxed ${
              currentLine === index ? "bg-white/10 text-cream" : "text-cream/60"
            }`}
          >
            <span className="mr-2 font-bold text-leaf-300">{line.speaker === "ren" ? "Ren" : "Layla"}</span>
            {line.text}
          </li>
        ))}
      </ol>
    </section>
  );
}
