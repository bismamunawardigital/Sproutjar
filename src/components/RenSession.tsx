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
  | { configured: false; message: string; dynamicVariables: Record<string, string> };

type Line = { role: "ren" | "you"; text: string };

const CONTRACTS = [
  { key: "clarity", label: "Clarity" },
  { key: "decision", label: "A decision" },
  { key: "plan", label: "A plan" },
  { key: "space", label: "Space to think" },
] as const;

type Contract = (typeof CONTRACTS)[number]["key"];

function RenSessionInner({
  userName,
  agenda,
  minutes,
}: {
  userName: string;
  agenda: Agenda | null;
  minutes: number;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "connecting" | "live" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => setStatus("live"),
    onDisconnect: () => {
      setStatus("idle");
      // Ren may have logged a commitment or a jar deposit mid-call.
      router.refresh();
    },
    onError: (message) => {
      setError(typeof message === "string" ? message : "Something went wrong on the call.");
      setStatus("error");
    },
    onMessage: ({ message, source }) => {
      setLines((prev) => [...prev, { role: source === "user" ? "you" : "ren", text: message }]);
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
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
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
          agenda_reason: agenda?.reason ?? "They haven't picked an agenda. Ask where to start.",
          agenda_technique: agenda?.technique ?? "Open",
          planned_minutes: String(minutes),
          contract_choice: contract ?? "unstated",
        },
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start the session.");
      setStatus("error");
    }
  }, [agenda, contract, conversation, minutes]);

  const stop = useCallback(() => {
    conversation.endSession();
    setStatus("idle");
  }, [conversation]);

  const speaking = conversation.isSpeaking;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <section className="overflow-hidden rounded-card bg-ink-800 text-cream shadow-sh-3">
      <div className="flex flex-col gap-6 p-5 sm:p-7">
        <div className="flex items-start gap-5">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <span
              className={`ren-orb absolute inset-0 rounded-full ${
                status === "live" ? (speaking ? "orb-speaking" : "orb-listening") : ""
              }`}
            />
            <span className="relative text-[15px] font-bold text-white">Ren</span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-leaf-300">
              {status === "live"
                ? speaking
                  ? "Ren is speaking"
                  : "Ren is listening"
                : status === "connecting"
                  ? "Connecting"
                  : `${minutes} min · ${agenda?.technique ?? "Open"}`}
            </p>
            <h2 className="mt-1.5 text-[22px] font-bold leading-snug">
              {agenda ? agenda.title : `Ready when you are, ${userName}.`}
            </h2>
            <p className="mt-1.5 text-[14px] leading-relaxed text-cream/70">
              {agenda
                ? agenda.reason
                : "Pick an agenda below, or start here and tell Ren where you want to begin."}
            </p>
          </div>

          {status === "live" ? (
            <span className="n shrink-0 rounded-full bg-white/10 px-3 py-1 text-[13px]">
              {mm}:{ss}
            </span>
          ) : null}
        </div>

        {status !== "live" ? (
          <div>
            <p className="text-[14px] text-cream/70">
              Before we get into it — do you want to come out of this clearer, with a decision, with
              a plan, or do you just want somewhere to think out loud?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CONTRACTS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setContract(option.key)}
                  aria-pressed={contract === option.key}
                  className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${
                    contract === option.key
                      ? "bg-leaf-300 text-ink-900"
                      : "border border-white/20 text-cream/85 hover:border-white/50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          {status === "live" ? (
            <>
              <button
                onClick={stop}
                className="rounded-full bg-white/12 px-5 py-2.5 text-sm font-bold text-cream transition hover:bg-white/20"
              >
                End the session
              </button>
              <button
                onClick={() => conversation.setMuted(!conversation.isMuted)}
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-cream transition hover:border-white/50"
              >
                {conversation.isMuted ? "Unmute" : "Mute"}
              </button>
            </>
          ) : (
            <button
              onClick={start}
              disabled={status === "connecting"}
              className="rounded-full bg-leaf-300 px-6 py-3 text-[15px] font-bold text-ink-900 transition hover:bg-leaf-400 disabled:opacity-60"
            >
              {status === "connecting" ? "Connecting" : "Talk to Ren"}
            </button>
          )}
          {error ? <p className="text-[13px] text-amber">{error}</p> : null}
        </div>
      </div>

      {lines.length > 0 ? (
        <div
          ref={transcriptRef}
          className="max-h-64 space-y-3 overflow-y-auto border-t border-white/10 bg-black/15 px-5 py-5 sm:px-7"
        >
          {lines.map((line, index) => (
            <p key={index} className="text-[14px] leading-relaxed">
              <span
                className={`mr-2 font-bold ${line.role === "ren" ? "text-leaf-300" : "text-cream/60"}`}
              >
                {line.role === "ren" ? "Ren" : "You"}
              </span>
              <span className="text-cream/90">{line.text}</span>
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
}: {
  userName: string;
  agenda?: Agenda | null;
  minutes?: number;
}) {
  return (
    <ConversationProvider>
      <RenSessionInner userName={userName} agenda={agenda} minutes={minutes} />
    </ConversationProvider>
  );
}
