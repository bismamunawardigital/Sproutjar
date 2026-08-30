"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import type { Agenda } from "@/lib/agendas";

type SessionConfig =
  | {
      configured: true;
      conversationToken: string;
      agentId: string;
      dynamicVariables: Record<string, string>;
    }
  | {
      configured: false;
      message: string;
      dynamicVariables: Record<string, string>;
    };

type Line = { role: "ren" | "you"; text: string };

const CONTRACTS = [
  { key: "clarity", label: "Clarity" },
  { key: "decision", label: "A decision" },
  { key: "plan", label: "A plan" },
  { key: "space", label: "Space to think" },
] as const;

type Contract = (typeof CONTRACTS)[number]["key"];

function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="mt-[3px] h-3.5 w-3.5 shrink-0 text-stem" aria-hidden>
      <path
        d="M3 8.5 6.2 11.5 13 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CallGlyph() {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" aria-hidden>
      <path
        d="M10 2.5a2.5 2.5 0 0 0-2.5 2.5v4a2.5 2.5 0 0 0 5 0V5A2.5 2.5 0 0 0 10 2.5ZM5 9a5 5 0 0 0 10 0M10 14v3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RenSessionInner({
  userName,
  agenda,
  minutes,
  onEnded,
}: {
  userName: string;
  agenda: Agenda | null;
  minutes: number;
  onEnded?: () => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "connecting" | "live" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => setStatus("live"),
    onDisconnect: () => {
      setStatus("idle");
      onEnded?.();
      // Ren may have logged a commitment or a jar deposit mid-call.
      router.refresh();
    },
    onError: (message) => {
      setError(
        typeof message === "string"
          ? message
          : "Something went wrong on the call.",
      );
      setStatus("error");
    },
    onMessage: ({ message, source }) => {
      setLines((prev) => [
        ...prev,
        { role: source === "user" ? "you" : "ren", text: message },
      ]);
    },
    // Ren calls this after writing a commitment or a deposit so the dashboard updates live.
    clientTools: {
      refresh_dashboard: () => {
        router.refresh();
        return "Dashboard refreshed.";
      },
    },
  });

  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [lines]);

  useEffect(() => {
    if (status !== "live") return;
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  const start = useCallback(async () => {
    setError(null);
    setElapsed(0);
    setStatus("connecting");
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const response = await fetch("/api/agent/session", { cache: "no-store" });
      const config = (await response.json()) as SessionConfig;
      if (!config.configured) {
        setError(config.message);
        setStatus("error");
        return;
      }
      setLines([]);
      conversation.startSession({
        conversationToken: config.conversationToken,
        connectionType: "webrtc",
        dynamicVariables: {
          ...config.dynamicVariables,
          agenda_title: agenda?.title ?? "Open",
          agenda_reason:
            agenda?.reason ??
            "They haven't picked an agenda. Ask where to start.",
          agenda_technique: agenda?.technique ?? "Open",
          planned_minutes: String(minutes),
          contract_choice: contract ?? "unstated",
        },
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not start the session.",
      );
      setStatus("error");
    }
  }, [agenda, contract, conversation, minutes]);

  const stop = useCallback(() => {
    conversation.endSession();
    setStatus("idle");
    onEnded?.();
  }, [conversation, onEnded]);

  const speaking = conversation.isSpeaking;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  if (status === "live" || status === "connecting") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-ink-800 text-cream">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-[13px] font-bold text-cream/60">
            {agenda ? agenda.title : "Open conversation"}
          </span>
          <span className="n rounded-full bg-white/10 px-3 py-1 text-[13px]">
            {mm}:{ss}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="relative flex h-44 w-44 items-center justify-center">
            <span
              className={`ren-orb absolute inset-0 rounded-full ${
                status === "live"
                  ? speaking
                    ? "orb-speaking"
                    : "orb-listening"
                  : ""
              }`}
            />
            <span className="relative text-[20px] font-bold text-white">
              Ren
            </span>
          </div>

          <p className="text-[17px] font-bold">
            {status === "connecting"
              ? "Connecting…"
              : speaking
                ? "Ren is speaking"
                : conversation.isMuted
                  ? "Your mic is off"
                  : "Ren is listening"}
          </p>

          {showTranscript && lines.length > 0 ? (
            <div
              ref={transcriptRef}
              className="max-h-56 w-full max-w-md space-y-3 overflow-y-auto rounded-card bg-black/20 p-4 text-left"
            >
              {lines.map((line, index) => (
                <p key={index} className="text-[14px] leading-relaxed">
                  <span
                    className={`mr-2 font-bold ${
                      line.role === "ren" ? "text-leaf-300" : "text-cream/60"
                    }`}
                  >
                    {line.role === "ren" ? "Ren" : "You"}
                  </span>
                  <span className="text-cream/90">{line.text}</span>
                </p>
              ))}
            </div>
          ) : null}

          {error ? <p className="text-[13px] text-amber">{error}</p> : null}
        </div>

        <div className="flex items-center justify-center gap-4 pb-12 pt-4">
          <button
            onClick={() => conversation.setMuted(!conversation.isMuted)}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-[12px] font-bold text-cream transition hover:border-white/50"
          >
            {conversation.isMuted ? "Unmute" : "Mute"}
          </button>
          <button
            onClick={stop}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-danger text-[13px] font-bold text-white transition hover:opacity-90"
          >
            End
          </button>
          <button
            onClick={() => setShowTranscript((value) => !value)}
            aria-pressed={showTranscript}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-[12px] font-bold text-cream transition hover:border-white/50"
          >
            {showTranscript ? "Hide" : "Words"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-card border border-rule bg-card">
      <div className="flex items-center gap-2.5 border-b border-rule px-5 py-3.5">
        <span className="live-dot h-2 w-2 rounded-full bg-stem" aria-hidden />
        <p className="text-[13px] font-bold text-ink-900">Ren is free right now</p>
        <p className="ml-auto text-[12px] text-ink-300">Line closed</p>
      </div>

      <div className="flex flex-col items-center px-5 py-8 text-center sm:px-7">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <span className="dial-ring absolute inset-0 rounded-full" aria-hidden />
          <span className="dial-ring dial-ring-2 absolute inset-4 rounded-full" aria-hidden />
          <span className="ren-orb absolute inset-10 rounded-full" aria-hidden />
          <span className="relative text-[15px] font-bold text-white">Ren</span>
        </div>

        <h2 className="mt-6 max-w-md text-[24px] font-bold leading-tight text-ink-900">
          {agenda ? agenda.title : `Hi ${userName}. Whenever you're ready.`}
        </h2>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-400">
          {agenda
            ? agenda.reason
            : "Speak the way you would to a friend who happens to know the numbers. Ren listens first."}
        </p>

        <ul className="mt-6 w-full max-w-md space-y-2 text-left">
          {[
            "Your cards and balances are already on the call",
            "What you said last time comes with you",
            `Ends when you do · about ${minutes} min`,
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 rounded-card bg-leaf-50 px-3.5 py-2.5 text-[13px] text-ink-600"
            >
              <CheckGlyph />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 w-full max-w-md">
          <p className="label">Before you dial</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {CONTRACTS.map((option) => (
              <button
                key={option.key}
                onClick={() => setContract(option.key)}
                aria-pressed={contract === option.key}
                className={`rounded-card border px-3 py-2.5 text-[13px] font-bold transition ${
                  contract === option.key
                    ? "border-stem bg-leaf-100 text-stem-700"
                    : "border-rule text-ink-400 hover:border-ink-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={start}
          className="mt-6 flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-stem px-6 py-4 text-[17px] font-bold text-white transition hover:opacity-90"
        >
          <CallGlyph />
          {lines.length > 0 ? "Call Ren again" : "Call Ren"}
        </button>
        {error ? <p className="mt-3 text-[13px] text-danger">{error}</p> : null}
      </div>

      {lines.length > 0 ? (
        <div className="max-h-64 space-y-3 overflow-y-auto border-t border-rule bg-leaf-50 px-5 py-5 sm:px-7">
          <p className="label">What you talked about</p>
          {lines.map((line, index) => (
            <p key={index} className="text-[14px] leading-relaxed">
              <span
                className={`mr-2 font-bold ${line.role === "ren" ? "text-stem-700" : "text-ink-300"}`}
              >
                {line.role === "ren" ? "Ren" : "You"}
              </span>
              <span className="text-ink-600">{line.text}</span>
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function RenSession({
  userName,
  agenda = null,
  minutes = 20,
  onEnded,
}: {
  userName: string;
  agenda?: Agenda | null;
  minutes?: number;
  onEnded?: () => void;
}) {
  return (
    <ConversationProvider>
      <RenSessionInner
        userName={userName}
        agenda={agenda}
        minutes={minutes}
        onEnded={onEnded}
      />
    </ConversationProvider>
  );
}
